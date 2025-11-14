import express from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';
import { authenticateAdmin, AdminRequest } from '../middleware/adminAuth';
import logger from '../config/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email or name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, client]
 *         description: Filter by role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not an admin
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateAdmin, async (req: AdminRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      AND: []
    };

    // Search filter
    if (search) {
      where.AND.push({
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    // Role filter
    if (role === 'admin') {
      where.AND.push({
        roles: { has: 'admin' }
      });
    } else if (role === 'client') {
      // Client users are those without admin role
      where.AND.push({
        OR: [
          { roles: { isEmpty: true } },
          { roles: { not: { has: 'admin' } } }
        ]
      });
    }

    // If no filters, remove AND wrapper
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          provider: true,
          isVerified: true,
          roles: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              organizationMembers: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 organizations:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - not an admin
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateAdmin, async (req: AdminRequest, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        googleId: true,
        isVerified: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
        organizationMembers: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        googleId: user.googleId,
        isVerified: user.isVerified,
        roles: user.roles || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      organizations: user.organizationMembers.map(member => ({
        id: member.organization.id,
        name: member.organization.name,
        description: member.organization.description,
        role: member.role,
        joinedAt: member.joinedAt
      }))
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               isVerified:
 *                 type: boolean
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [admin]
 *                 description: User roles (admin only for now)
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - not an admin
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateAdmin, async (req: AdminRequest, res) => {
  try {
    const { id } = req.params;
    const { name, avatar, isVerified, roles, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate roles if provided
    if (roles !== undefined) {
      if (!Array.isArray(roles)) {
        return res.status(400).json({ error: 'Roles must be an array' });
      }
      
      // Validate role values
      const validRoles = ['admin'];
      const invalidRoles = roles.filter(role => !validRoles.includes(role));
      if (invalidRoles.length > 0) {
        return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
      }
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (roles !== undefined) updateData.roles = roles;

    // Handle password update
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      updateData.password = await hashPassword(password);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        isVerified: true,
        roles: true,
        createdAt: true,
        updatedAt: true
      }
    });

    logger.info('User updated by admin', {
      adminId: req.user!.id,
      userId: id,
      changes: Object.keys(updateData)
    });

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: Bad request - cannot delete yourself
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - not an admin
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateAdmin, async (req: AdminRequest, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (cascade will handle organization members)
    await prisma.user.delete({
      where: { id }
    });

    logger.info('User deleted by admin', {
      adminId: req.user!.id,
      userId: id,
      userEmail: user.email
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/{id}/make-admin:
 *   post:
 *     summary: Grant admin role to user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Admin role granted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin role granted successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - user is already an admin
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - not an admin
 *       500:
 *         description: Internal server error
 */
router.post('/:id/make-admin', authenticateAdmin, async (req: AdminRequest, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already an admin
    const isAdmin = user.roles && user.roles.includes('admin');
    if (isAdmin) {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    // Add admin role (avoid duplicates)
    const currentRoles = user.roles || [];
    const updatedRoles = currentRoles.includes('admin') 
      ? currentRoles 
      : [...currentRoles, 'admin'];
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        roles: updatedRoles
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        isVerified: true,
        roles: true,
        createdAt: true,
        updatedAt: true
      }
    });

    logger.info('Admin role granted', {
      adminId: req.user!.id,
      userId: id,
      userEmail: user.email
    });

    res.json({
      message: 'Admin role granted successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Make admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/{id}/remove-admin:
 *   post:
 *     summary: Remove admin role from user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Admin role removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin role removed successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - user is not an admin or cannot remove yourself
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - not an admin
 *       500:
 *         description: Internal server error
 */
router.post('/:id/remove-admin', authenticateAdmin, async (req: AdminRequest, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from removing their own admin role
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'You cannot remove your own admin role' });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is an admin
    const isAdmin = user.roles && user.roles.includes('admin');
    if (!isAdmin) {
      return res.status(400).json({ error: 'User is not an admin' });
    }

    // Remove admin role
    const updatedRoles = (user.roles || []).filter(role => role !== 'admin');
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        roles: updatedRoles
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        isVerified: true,
        roles: true,
        createdAt: true,
        updatedAt: true
      }
    });

    logger.info('Admin role removed', {
      adminId: req.user!.id,
      userId: id,
      userEmail: user.email
    });

    res.json({
      message: 'Admin role removed successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Remove admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/{id}/reset-password:
 *   post:
 *     summary: Reset user password (admin action)
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - not an admin
 *       500:
 *         description: Internal server error
 */
router.post('/:id/reset-password', authenticateAdmin, async (req: AdminRequest, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash and update password
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null
      }
    });

    logger.info('Password reset by admin', {
      adminId: req.user!.id,
      userId: id,
      userEmail: user.email
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Admin reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
