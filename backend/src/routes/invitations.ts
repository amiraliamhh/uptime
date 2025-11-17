import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import logger from '../config/logger';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// Default expiration: 7 days from now
const DEFAULT_INVITATION_EXPIRY_DAYS = 7;

/**
 * Generate a secure invitation token
 */
function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * @swagger
 * /api/v1/organizations/{id}/invitations:
 *   post:
 *     summary: Create an invitation to an organization
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the person to invite
 *               expiresInDays:
 *                 type: integer
 *                 default: 7
 *                 minimum: 1
 *                 maximum: 30
 *                 description: Number of days until invitation expires
 *     responses:
 *       201:
 *         description: Invitation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invitation created successfully"
 *                 invitation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     token:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/organizations/:id/invitations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { email, expiresInDays } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const expiryDays = expiresInDays 
      ? Math.min(Math.max(1, parseInt(expiresInDays)), 30) 
      : DEFAULT_INVITATION_EXPIRY_DAYS;

    // Check if user is an admin of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: req.user!.id,
        role: 'admin'
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Only admins can create invitations' });
    }

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      const existingMember = await prisma.organizationMember.findFirst({
        where: {
          organizationId: id,
          userId: existingUser.id
        }
      });

      if (existingMember) {
        return res.status(400).json({ error: 'User is already a member of this organization' });
      }
    }

    // Check if there's a pending invitation for this email and organization
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        organizationId: id,
        status: 'pending',
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (existingInvitation) {
      return res.status(400).json({ 
        error: 'A pending invitation already exists for this email',
        invitation: {
          id: existingInvitation.id,
          expiresAt: existingInvitation.expiresAt
        }
      });
    }

    // Generate invitation token
    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        organizationId: id,
        invitedById: req.user!.id,
        token,
        status: 'pending',
        expiresAt
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        invitedBy: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // TODO: Send invitation email with token
    // await sendInvitationEmail(email, token, organization.name);

    res.status(201).json({
      message: 'Invitation created successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
        organization: invitation.organization,
        invitedBy: invitation.invitedBy,
        createdAt: invitation.createdAt
      }
    });
  } catch (error) {
    logger.error('Create invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/organizations/{id}/invitations:
 *   get:
 *     summary: Get invitations for an organization
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, expired, cancelled]
 *         description: Filter by invitation status
 *     responses:
 *       200:
 *         description: Invitations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invitations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       status:
 *                         type: string
 *                       expiresAt:
 *                         type: string
 *                       acceptedAt:
 *                         type: string
 *                       invitedBy:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/organizations/:id/invitations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    // Check if user is an admin of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: req.user!.id,
        role: 'admin'
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Only admins can view invitations' });
    }

    // Build where clause
    const where: any = {
      organizationId: id
    };

    if (status && ['pending', 'accepted', 'expired', 'cancelled'].includes(status as string)) {
      where.status = status;
    }

    const invitations = await prisma.invitation.findMany({
      where,
      include: {
        invitedBy: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      invitations: invitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        status: inv.status,
        expiresAt: inv.expiresAt,
        acceptedAt: inv.acceptedAt,
        invitedBy: inv.invitedBy,
        createdAt: inv.createdAt
      }))
    });
  } catch (error) {
    logger.error('Get invitations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/invitations/accept:
 *   post:
 *     summary: Accept an invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Invitation token
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invitation accepted successfully"
 *                 organization:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 member:
 *                   type: object
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Invitation not found or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/invitations/accept', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { token } = req.body;
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    // Validation
    if (!token) {
      return res.status(400).json({ error: 'Invitation token is required' });
    }

    // Find invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid invitation token' });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({ 
        error: `Invitation has already been ${invitation.status}` 
      });
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      // Update status to expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      });
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Verify that the authenticated user's email matches the invitation email
    if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({ 
        error: 'This invitation was sent to a different email address. Please log in with the correct account.' 
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: invitation.organizationId,
        userId
      }
    });

    if (existingMember) {
      // Mark invitation as accepted even though user is already a member
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { 
          status: 'accepted',
          acceptedAt: new Date()
        }
      });
      return res.status(400).json({ 
        error: 'You are already a member of this organization',
        organization: invitation.organization
      });
    }

    // Accept invitation and add user to organization
    const result = await prisma.$transaction(async (tx) => {
      // Update invitation status
      const updatedInvitation = await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date()
        }
      });

      // Add user as member (default role: member)
      const member = await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          role: 'member'
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return { invitation: updatedInvitation, member };
    });

    res.json({
      message: 'Invitation accepted successfully',
      organization: result.member.organization,
      member: {
        id: result.member.id,
        role: result.member.role,
        joinedAt: result.member.joinedAt
      }
    });
  } catch (error) {
    logger.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

