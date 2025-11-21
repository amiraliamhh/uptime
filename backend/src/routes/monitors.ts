import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { scheduleMonitor, removeMonitor, MonitorJobData } from '../services/queue';
import logger, { monitorLogger } from '../config/logger';
import { limits } from '../config/limits';

const isProduction = process.env.NODE_ENV === 'production';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/organizations/{organizationId}/monitors:
 *   get:
 *     summary: Get monitors for organization
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
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
 *       403:
 *         description: Forbidden - not a member of organization
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
router.get('/organizations/:organizationId/monitors', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { organizationId } = req.params;

    // Check if user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    const monitors = await prisma.monitor.findMany({
      where: {
        organizationId
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
 * /api/v1/organizations/{organizationId}/monitors:
 *   post:
 *     summary: Create a new monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
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
 *       403:
 *         description: Forbidden - not a member of organization
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
router.post('/organizations/:organizationId/monitors', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { organizationId } = req.params;
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

    if (checkTimeout < 5 || checkTimeout > 120) {
      return res.status(400).json({ error: 'Check timeout must be between 5 and 120 seconds' });
    }

    if (checkTimeout >= checkInterval) {
      return res.status(400).json({ error: 'Check timeout must be less than check interval' });
    }

    if (failThreshold < 1 || failThreshold > 10) {
      return res.status(400).json({ error: 'Fail threshold must be between 1 and 10' });
    }

    // Check if user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    // Check if organization has reached the monitor limit
    const monitorCount = await prisma.monitor.count({
      where: {
        organizationId
      }
    });

    if (monitorCount >= limits.maxMonitorsPerOrganization) {
      return res.status(400).json({ 
        error: `This organization has reached the maximum limit of ${limits.maxMonitorsPerOrganization} monitors` 
      });
    }

    // Create monitor
    const monitor = await prisma.monitor.create({
      data: {
        organizationId,
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
 * /api/v1/organizations/{organizationId}/monitors/{id}:
 *   get:
 *     summary: Get monitor by ID
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
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
 *       403:
 *         description: Forbidden - not a member of organization
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
router.get('/organizations/:organizationId/monitors/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { organizationId, id } = req.params;

    // Check if user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        organizationId
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
 * /api/v1/organizations/{organizationId}/monitors/{id}:
 *   put:
 *     summary: Update monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
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
 *       403:
 *         description: Forbidden - not a member of organization
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
router.put('/organizations/:organizationId/monitors/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { organizationId, id } = req.params;
    const updateData = req.body;

    // Check if user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        organizationId
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
 * /api/v1/organizations/{organizationId}/monitors/{id}:
 *   delete:
 *     summary: Delete monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
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
 *       403:
 *         description: Forbidden - not a member of organization
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
router.delete('/organizations/:organizationId/monitors/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { organizationId, id } = req.params;

    // Check if user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        organizationId
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
 * /api/v1/organizations/{organizationId}/monitors/{id}/logs:
 *   get:
 *     summary: Get monitor logs
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
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
 *       403:
 *         description: Forbidden - not a member of organization
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
router.get('/organizations/:organizationId/monitors/:id/logs', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { organizationId, id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Check if user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    // Check if monitor exists and belongs to organization
    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        organizationId
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

/**
 * @swagger
 * /api/v1/organizations/{organizationId}/monitors/{id}/summaries:
 *   get:
 *     summary: Get daily summaries for a monitor with date range
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monitor ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD). Defaults to 30 days ago
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD). Defaults to today
 *     responses:
 *       200:
 *         description: Daily summaries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summaries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       monitorId:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       totalChecks:
 *                         type: integer
 *                       successfulChecks:
 *                         type: integer
 *                       failedChecks:
 *                         type: integer
 *                       timeoutChecks:
 *                         type: integer
 *                       errorChecks:
 *                         type: integer
 *                       uptimePercentage:
 *                         type: number
 *                       averageResponseTime:
 *                         type: number
 *                       minResponseTime:
 *                         type: integer
 *                       maxResponseTime:
 *                         type: integer
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - not a member of organization
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
router.get('/organizations/:organizationId/monitors/:id/summaries', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { organizationId, id } = req.params;
    const { startDate, endDate } = req.query;

    // Check if user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    // Check if monitor exists and belongs to organization
    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Parse date range (default to last 30 days)
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999); // End of day

    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    start.setHours(0, 0, 0, 0); // Start of day

    // Validate date range
    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    // Get daily summaries
    const [summaries, total] = await Promise.all([
      prisma.dailySummary.findMany({
        where: {
          monitorId: id,
          date: {
            gte: start,
            lte: end,
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.dailySummary.count({
        where: {
          monitorId: id,
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
    ]);

    res.json({
      summaries: summaries.map(summary => ({
        id: summary.id,
        monitorId: summary.monitorId,
        date: summary.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        totalChecks: summary.totalChecks,
        successfulChecks: summary.successfulChecks,
        failedChecks: summary.failedChecks,
        timeoutChecks: summary.timeoutChecks,
        errorChecks: summary.errorChecks,
        uptimePercentage: summary.uptimePercentage,
        averageResponseTime: summary.averageResponseTime,
        minResponseTime: summary.minResponseTime,
        maxResponseTime: summary.maxResponseTime,
        lastUpdated: summary.lastUpdated,
      })),
      total,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    logger.error('Get monitor summaries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/organizations/{organizationId}/monitors/{id}/uptime:
 *   get:
 *     summary: Get aggregated uptime statistics from daily summaries
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monitor ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD). Defaults to 30 days ago
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD). Defaults to today
 *     responses:
 *       200:
 *         description: Uptime statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: object
 *                   properties:
 *                     overallUptimePercentage:
 *                       type: number
 *                       description: Overall uptime percentage for the date range
 *                     totalChecks:
 *                       type: integer
 *                       description: Total number of checks in the date range
 *                     successfulChecks:
 *                       type: integer
 *                     failedChecks:
 *                       type: integer
 *                     timeoutChecks:
 *                       type: integer
 *                     errorChecks:
 *                       type: integer
 *                     averageResponseTime:
 *                       type: number
 *                     minResponseTime:
 *                       type: integer
 *                     maxResponseTime:
 *                       type: integer
 *                     daysWithData:
 *                       type: integer
 *                       description: Number of days with summary data
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       format: date
 *                     end:
 *                       type: string
 *                       format: date
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - not a member of organization
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
router.get('/organizations/:organizationId/monitors/:id/uptime', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { organizationId, id } = req.params;
    const { startDate, endDate } = req.query;

    // Check if user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    // Check if monitor exists and belongs to organization
    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Parse date range (default to last 30 days)
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999); // End of day

    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    start.setHours(0, 0, 0, 0); // Start of day

    // Validate date range
    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    // Get all daily summaries in the date range
    const summaries = await prisma.dailySummary.findMany({
      where: {
        monitorId: id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Aggregate statistics
    const totalChecks = summaries.reduce((sum, s) => sum + s.totalChecks, 0);
    const successfulChecks = summaries.reduce((sum, s) => sum + s.successfulChecks, 0);
    const failedChecks = summaries.reduce((sum, s) => sum + s.failedChecks, 0);
    const timeoutChecks = summaries.reduce((sum, s) => sum + s.timeoutChecks, 0);
    const errorChecks = summaries.reduce((sum, s) => sum + s.errorChecks, 0);
    
    // Calculate weighted average response time
    const totalResponseTime = summaries.reduce((sum, s) => sum + (s.totalResponseTime || 0), 0);
    const averageResponseTime = totalChecks > 0 ? totalResponseTime / totalChecks : 0;

    // Get min/max response times
    const responseTimes = summaries
      .map(s => [s.minResponseTime, s.maxResponseTime])
      .flat()
      .filter((rt): rt is number => rt !== null && rt !== undefined);
    
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : null;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : null;

    // Calculate overall uptime percentage
    const overallUptimePercentage = totalChecks > 0 
      ? (successfulChecks / totalChecks) * 100 
      : 0;

    res.json({
      uptime: {
        overallUptimePercentage: parseFloat(overallUptimePercentage.toFixed(2)),
        totalChecks,
        successfulChecks,
        failedChecks,
        timeoutChecks,
        errorChecks,
        averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
        minResponseTime,
        maxResponseTime,
        daysWithData: summaries.length,
      },
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    logger.error('Get monitor uptime error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
