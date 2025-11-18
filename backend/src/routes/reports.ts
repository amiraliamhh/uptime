import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/organizations/{organizationId}/reports:
 *   get:
 *     summary: Get organization report with daily statistics for all monitors
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
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
 *         description: Report data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organization:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       format: date
 *                     end:
 *                       type: string
 *                       format: date
 *                 monitors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       url:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       checkInterval:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                       dailySummaries:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             date:
 *                               type: string
 *                               format: date
 *                             totalChecks:
 *                               type: integer
 *                             successfulChecks:
 *                               type: integer
 *                             failedChecks:
 *                               type: integer
 *                             timeoutChecks:
 *                               type: integer
 *                             errorChecks:
 *                               type: integer
 *                             uptimePercentage:
 *                               type: number
 *                             averageResponseTime:
 *                               type: number
 *                             minResponseTime:
 *                               type: integer
 *                             maxResponseTime:
 *                               type: integer
 *                       overallStats:
 *                         type: object
 *                         properties:
 *                           totalChecks:
 *                             type: integer
 *                           successfulChecks:
 *                             type: integer
 *                           failedChecks:
 *                             type: integer
 *                           timeoutChecks:
 *                             type: integer
 *                           errorChecks:
 *                             type: integer
 *                           overallUptimePercentage:
 *                             type: number
 *                           averageResponseTime:
 *                             type: number
 *                           minResponseTime:
 *                             type: integer
 *                           maxResponseTime:
 *                             type: integer
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
router.get('/organizations/:organizationId/reports', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { organizationId } = req.params;
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

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
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

    // Get all monitors for the organization
    const monitors = await prisma.monitor.findMany({
      where: {
        organizationId
      },
      select: {
        id: true,
        name: true,
        type: true,
        url: true,
        httpMethod: true,
        isActive: true,
        checkInterval: true,
        checkTimeout: true,
        failThreshold: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get daily summaries for all monitors in the date range
    const monitorIds = monitors.map(m => m.id);
    
    const dailySummaries = await prisma.dailySummary.findMany({
      where: {
        monitorId: { in: monitorIds },
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Group summaries by monitor ID
    const summariesByMonitor = dailySummaries.reduce((acc, summary) => {
      if (!acc[summary.monitorId]) {
        acc[summary.monitorId] = [];
      }
      acc[summary.monitorId].push(summary);
      return acc;
    }, {} as Record<string, typeof dailySummaries>);

    // Build response with monitors and their daily summaries
    const monitorsWithData = monitors.map(monitor => {
      const summaries = summariesByMonitor[monitor.id] || [];
      
      // Calculate overall statistics for this monitor
      const totalChecks = summaries.reduce((sum, s) => sum + s.totalChecks, 0);
      const successfulChecks = summaries.reduce((sum, s) => sum + s.successfulChecks, 0);
      const failedChecks = summaries.reduce((sum, s) => sum + s.failedChecks, 0);
      const timeoutChecks = summaries.reduce((sum, s) => sum + s.timeoutChecks, 0);
      const errorChecks = summaries.reduce((sum, s) => sum + s.errorChecks, 0);
      
      const totalResponseTime = summaries.reduce((sum, s) => sum + (s.totalResponseTime || 0), 0);
      const averageResponseTime = totalChecks > 0 ? totalResponseTime / totalChecks : 0;
      
      const responseTimes = summaries
        .map(s => [s.minResponseTime, s.maxResponseTime])
        .flat()
        .filter((rt): rt is number => rt !== null && rt !== undefined);
      
      const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : null;
      const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : null;
      
      const overallUptimePercentage = totalChecks > 0 
        ? (successfulChecks / totalChecks) * 100 
        : 0;

      return {
        id: monitor.id,
        name: monitor.name,
        type: monitor.type,
        url: monitor.url,
        httpMethod: monitor.httpMethod,
        isActive: monitor.isActive,
        checkInterval: monitor.checkInterval,
        checkTimeout: monitor.checkTimeout,
        failThreshold: monitor.failThreshold,
        createdAt: monitor.createdAt,
        updatedAt: monitor.updatedAt,
        dailySummaries: summaries.map(s => ({
          date: s.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
          totalChecks: s.totalChecks,
          successfulChecks: s.successfulChecks,
          failedChecks: s.failedChecks,
          timeoutChecks: s.timeoutChecks,
          errorChecks: s.errorChecks,
          uptimePercentage: parseFloat(s.uptimePercentage.toFixed(2)),
          averageResponseTime: parseFloat(s.averageResponseTime.toFixed(2)),
          minResponseTime: s.minResponseTime,
          maxResponseTime: s.maxResponseTime
        })),
        overallStats: {
          totalChecks,
          successfulChecks,
          failedChecks,
          timeoutChecks,
          errorChecks,
          overallUptimePercentage: parseFloat(overallUptimePercentage.toFixed(2)),
          averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
          minResponseTime,
          maxResponseTime
        }
      };
    });

    res.json({
      organization: {
        id: organization.id,
        name: organization.name,
        description: organization.description
      },
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      },
      monitors: monitorsWithData
    });
  } catch (error) {
    logger.error('Get organization report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

