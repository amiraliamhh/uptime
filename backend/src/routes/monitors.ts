import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { scheduleMonitor, removeMonitor, MonitorJobData } from '../services/queue';
import logger, { monitorLogger } from '../config/logger';

const isProduction = process.env.NODE_ENV === 'production';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/monitors:
 *   get:
 *     summary: Get monitors for organization
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monitors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 monitors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Monitor'
 *       401:
 *         description: Unauthorized
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
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Get user's organizations
    const userOrganizations = await prisma.organizationMember.findMany({
      where: { userId: req.user!.id },
      select: { organizationId: true }
    });

    const organizationIds = userOrganizations.map(org => org.organizationId);

    const monitors = await prisma.monitor.findMany({
      where: {
        organizationId: { in: organizationIds }
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            logs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ monitors });
  } catch (error) {
    logger.error('Get monitors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/monitors:
 *   post:
 *     summary: Create a new monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *               - url
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [https, tcp]
 *                 description: Monitor type
 *               name:
 *                 type: string
 *                 description: Monitor name
 *               url:
 *                 type: string
 *                 description: Target URL
 *               httpMethod:
 *                 type: string
 *                 default: HEAD
 *                 description: HTTP method
 *               requestHeaders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *               followRedirects:
 *                 type: boolean
 *                 default: true
 *               expectedStatusCodes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["200-299", "300", "301"]
 *               expectedResponseHeaders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *               checkInterval:
 *                 type: integer
 *                 default: 300
 *                 minimum: 180
 *                 maximum: 3600
 *                 description: Check interval in seconds (3 minutes to 1 hour)
 *               checkTimeout:
 *                 type: integer
 *                 default: 30
 *                 minimum: 5
 *                 maximum: 120
 *               failThreshold:
 *                 type: integer
 *                 default: 3
 *                 minimum: 1
 *                 maximum: 10
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User IDs to notify
 *     responses:
 *       201:
 *         description: Monitor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Monitor created successfully"
 *                 monitor:
 *                   $ref: '#/components/schemas/Monitor'
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      type,
      name,
      url,
      httpMethod = 'HEAD',
      requestHeaders = [],
      followRedirects = true,
      expectedStatusCodes = [],
      expectedResponseHeaders = [],
      checkInterval = 300,
      checkTimeout = 30,
      failThreshold = 3,
      contacts = []
    } = req.body;

    // Validation
    if (!type || !name || !url) {
      return res.status(400).json({ error: 'Type, name, and URL are required' });
    }

    if (!['https', 'tcp'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either https or tcp' });
    }

    if (checkInterval < 180 || checkInterval > 3600) {
      return res.status(400).json({ error: 'Check interval must be between 3 minutes (180 seconds) and 1 hour (3600 seconds)' });
    }

    if (checkTimeout < 5 || checkTimeout > 120) {
      return res.status(400).json({ error: 'Check timeout must be between 5 and 120 seconds' });
    }

    if (checkTimeout >= checkInterval) {
      return res.status(400).json({ error: 'Check timeout must be less than check interval' });
    }

    if (failThreshold < 1 || failThreshold > 10) {
      return res.status(400).json({ error: 'Fail threshold must be between 1 and 10' });
    }

    // Get user's first organization (for now, we'll use the first one)
    const userOrganization = await prisma.organizationMember.findFirst({
      where: { userId: req.user!.id },
      select: { organizationId: true }
    });

    if (!userOrganization) {
      return res.status(400).json({ error: 'User must be a member of an organization' });
    }

    // Create monitor
    const monitor = await prisma.monitor.create({
      data: {
        organizationId: userOrganization.organizationId,
        type,
        name,
        url,
        httpMethod,
        requestHeaders,
        followRedirects,
        expectedStatusCodes,
        expectedResponseHeaders,
        checkInterval,
        checkTimeout,
        failThreshold,
        contacts,
        isActive: true
      }
    });

    // Schedule the monitor
    const jobData: MonitorJobData = {
      monitorId: monitor.id,
      organizationId: monitor.organizationId,
      type: monitor.type as 'https' | 'tcp',
      name: monitor.name,
      url: monitor.url,
      httpMethod: monitor.httpMethod,
      requestHeaders: monitor.requestHeaders as Array<{ key: string; value: string }>,
      followRedirects: monitor.followRedirects,
      expectedStatusCodes: monitor.expectedStatusCodes,
      expectedResponseHeaders: monitor.expectedResponseHeaders as Array<{ key: string; value: string }>,
      checkInterval: monitor.checkInterval,
      checkTimeout: monitor.checkTimeout,
      failThreshold: monitor.failThreshold,
      contacts: monitor.contacts
    };

    await scheduleMonitor(jobData);

    // Only log monitor creation in development
    if (!isProduction) {
      monitorLogger.info('Monitor created and scheduled', {
        monitorId: monitor.id,
        name: monitor.name,
        type: monitor.type
      });
    }

    res.status(201).json({
      message: 'Monitor created successfully',
      monitor
    });
  } catch (error) {
    logger.error('Create monitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/monitors/{id}:
 *   get:
 *     summary: Get monitor by ID
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monitor ID
 *     responses:
 *       200:
 *         description: Monitor retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 monitor:
 *                   $ref: '#/components/schemas/Monitor'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Monitor not found
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
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Get user's organizations
    const userOrganizations = await prisma.organizationMember.findMany({
      where: { userId: req.user!.id },
      select: { organizationId: true }
    });

    const organizationIds = userOrganizations.map(org => org.organizationId);

    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        organizationId: { in: organizationIds }
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            logs: true
          }
        }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    res.json({ monitor });
  } catch (error) {
    logger.error('Get monitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/monitors/{id}:
 *   put:
 *     summary: Update monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monitor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               checkInterval:
 *                 type: integer
 *                 minimum: 180
 *                 maximum: 3600
 *                 description: Check interval in seconds (3 minutes to 1 hour)
 *               checkTimeout:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 120
 *                 description: Check timeout in seconds
 *               failThreshold:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Number of consecutive failures before alert
 *     responses:
 *       200:
 *         description: Monitor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Monitor updated successfully"
 *                 monitor:
 *                   $ref: '#/components/schemas/Monitor'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Monitor not found
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
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get user's organizations
    const userOrganizations = await prisma.organizationMember.findMany({
      where: { userId: req.user!.id },
      select: { organizationId: true }
    });

    const organizationIds = userOrganizations.map(org => org.organizationId);

    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        organizationId: { in: organizationIds }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Validation for update data
    if (updateData.checkInterval !== undefined) {
      if (updateData.checkInterval < 180 || updateData.checkInterval > 3600) {
        return res.status(400).json({ error: 'Check interval must be between 3 minutes (180 seconds) and 1 hour (3600 seconds)' });
      }
    }

    if (updateData.checkTimeout !== undefined) {
      if (updateData.checkTimeout < 5 || updateData.checkTimeout > 120) {
        return res.status(400).json({ error: 'Check timeout must be between 5 and 120 seconds' });
      }
    }

    if (updateData.failThreshold !== undefined) {
      if (updateData.failThreshold < 1 || updateData.failThreshold > 10) {
        return res.status(400).json({ error: 'Fail threshold must be between 1 and 10' });
      }
    }

    // Validate checkTimeout < checkInterval if both are being updated
    const finalCheckInterval = updateData.checkInterval !== undefined ? updateData.checkInterval : monitor.checkInterval;
    const finalCheckTimeout = updateData.checkTimeout !== undefined ? updateData.checkTimeout : monitor.checkTimeout;
    
    if (finalCheckTimeout >= finalCheckInterval) {
      return res.status(400).json({ error: 'Check timeout must be less than check interval' });
    }

    // Update monitor
    const updatedMonitor = await prisma.monitor.update({
      where: { id },
      data: updateData
    });

    // If monitor was deactivated, remove from queue
    if (updateData.isActive === false) {
      await removeMonitor(id);
    } else if (updateData.isActive === true) {
      // If monitor was activated, reschedule it
      const jobData: MonitorJobData = {
        monitorId: updatedMonitor.id,
        organizationId: updatedMonitor.organizationId,
        type: updatedMonitor.type as 'https' | 'tcp',
        name: updatedMonitor.name,
        url: updatedMonitor.url,
        httpMethod: updatedMonitor.httpMethod,
        requestHeaders: updatedMonitor.requestHeaders as Array<{ key: string; value: string }>,
        followRedirects: updatedMonitor.followRedirects,
        expectedStatusCodes: updatedMonitor.expectedStatusCodes,
        expectedResponseHeaders: updatedMonitor.expectedResponseHeaders as Array<{ key: string; value: string }>,
        checkInterval: updatedMonitor.checkInterval,
        checkTimeout: updatedMonitor.checkTimeout,
        failThreshold: updatedMonitor.failThreshold,
        contacts: updatedMonitor.contacts
      };

      await scheduleMonitor(jobData);
    }

    res.json({
      message: 'Monitor updated successfully',
      monitor: updatedMonitor
    });
  } catch (error) {
    logger.error('Update monitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/monitors/{id}:
 *   delete:
 *     summary: Delete monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monitor ID
 *     responses:
 *       200:
 *         description: Monitor deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Monitor deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Monitor not found
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
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Get user's organizations
    const userOrganizations = await prisma.organizationMember.findMany({
      where: { userId: req.user!.id },
      select: { organizationId: true }
    });

    const organizationIds = userOrganizations.map(org => org.organizationId);

    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        organizationId: { in: organizationIds }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Remove from queue first
    await removeMonitor(id);

    // Delete monitor (cascade will delete logs)
    await prisma.monitor.delete({
      where: { id }
    });

    // Only log monitor deletion in development
    if (!isProduction) {
      monitorLogger.info('Monitor deleted', { monitorId: id });
    }

    res.json({ message: 'Monitor deleted successfully' });
  } catch (error) {
    logger.error('Delete monitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/monitors/{id}/logs:
 *   get:
 *     summary: Get monitor logs
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monitor ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of logs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of logs to skip
 *     responses:
 *       200:
 *         description: Monitor logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Monitor not found
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
router.get('/:id/logs', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get user's organizations
    const userOrganizations = await prisma.organizationMember.findMany({
      where: { userId: req.user!.id },
      select: { organizationId: true }
    });

    const organizationIds = userOrganizations.map(org => org.organizationId);

    // Check if monitor exists and user has access
    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        organizationId: { in: organizationIds }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Get logs
    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where: { monitorId: id },
        orderBy: { checkedAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.log.count({
        where: { monitorId: id }
      })
    ]);

    res.json({ logs, total });
  } catch (error) {
    logger.error('Get monitor logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
