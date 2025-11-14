import express from 'express';
import { authenticateAdmin, AdminRequest } from '../middleware/adminAuth';
import { getJobsPaginated, getQueueStats } from '../services/queue';
import logger from '../config/logger';

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/queue/jobs:
 *   get:
 *     summary: List all cronjobs (monitor jobs)
 *     tags: [Admin - Queue Management]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [waiting, active, completed, failed, delayed]
 *         description: Filter by job status (can be multiple, comma-separated)
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       data:
 *                         type: object
 *                         properties:
 *                           monitorId:
 *                             type: string
 *                           organizationId:
 *                             type: string
 *                           type:
 *                             type: string
 *                           name:
 *                             type: string
 *                           url:
 *                             type: string
 *                           checkInterval:
 *                             type: integer
 *                       state:
 *                         type: string
 *                         enum: [waiting, active, completed, failed, delayed]
 *                       progress:
 *                         type: number
 *                       returnValue:
 *                         type: object
 *                       failedReason:
 *                         type: string
 *                       timestamp:
 *                         type: integer
 *                       processedOn:
 *                         type: integer
 *                       finishedOn:
 *                         type: integer
 *                       attemptsMade:
 *                         type: integer
 *                       opts:
 *                         type: object
 *                         properties:
 *                           delay:
 *                             type: integer
 *                           repeat:
 *                             type: object
 *                           attempts:
 *                             type: integer
 *                           backoff:
 *                             type: object
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
router.get('/jobs', authenticateAdmin, async (req: AdminRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const statusParam = req.query.status as string;

    // Parse status filter (can be comma-separated)
    let statuses: ('waiting' | 'active' | 'completed' | 'failed' | 'delayed')[] = ['waiting', 'active', 'delayed'];
    
    if (statusParam) {
      const requestedStatuses = statusParam.split(',').map(s => s.trim()) as ('waiting' | 'active' | 'completed' | 'failed' | 'delayed')[];
      const validStatuses: ('waiting' | 'active' | 'completed' | 'failed' | 'delayed')[] = ['waiting', 'active', 'completed', 'failed', 'delayed'];
      statuses = requestedStatuses.filter(s => validStatuses.includes(s));
      
      if (statuses.length === 0) {
        statuses = ['waiting', 'active', 'delayed']; // Default to active jobs
      }
    }

    const result = await getJobsPaginated(statuses, page, limit);

    res.json(result);
  } catch (error) {
    logger.error('List cronjobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/admin/queue/stats:
 *   get:
 *     summary: Get queue statistics
 *     tags: [Admin - Queue Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 waiting:
 *                   type: integer
 *                   description: Number of waiting jobs
 *                 active:
 *                   type: integer
 *                   description: Number of active jobs
 *                 completed:
 *                   type: integer
 *                   description: Number of completed jobs
 *                 failed:
 *                   type: integer
 *                   description: Number of failed jobs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not an admin
 *       500:
 *         description: Internal server error
 */
router.get('/stats', authenticateAdmin, async (req: AdminRequest, res) => {
  try {
    const stats = await getQueueStats();
    res.json(stats);
  } catch (error) {
    logger.error('Get queue stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
