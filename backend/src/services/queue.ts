import { Queue, QueueEvents, Job } from 'bullmq';
import { redis } from '../config/redis';
import logger, { monitorLogger } from '../config/logger';

const isProduction = process.env.NODE_ENV === 'production';

export interface MonitorJobData {
  monitorId: string;
  organizationId: string;
  type: 'https' | 'tcp';
  name: string;
  url: string;
  httpMethod: string;
  requestHeaders: Array<{ key: string; value: string }>;
  followRedirects: boolean;
  expectedStatusCodes: string[];
  expectedResponseHeaders: Array<{ key: string; value: string }>;
  checkInterval: number;
  checkTimeout: number;
  failThreshold: number;
  contacts: string[];
}

// Monitor check queue
export const monitorQueue = new Queue<MonitorJobData>('monitor-checks', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 3,           // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Queue events for monitoring
export const queueEvents = new QueueEvents('monitor-checks', {
  connection: redis,
});

// Queue event handlers
queueEvents.on('waiting', ({ jobId }) => {
  // Always log when job is waiting
  monitorLogger.info(`[QUEUE-EVENT] Job waiting`, {
    jobId,
    timestamp: new Date().toISOString(),
  });
});

queueEvents.on('active', ({ jobId }) => {
  // Always log when job becomes active (picked up by worker)
  monitorLogger.info(`[QUEUE-EVENT] Job became active (picked up by worker)`, {
    jobId,
    timestamp: new Date().toISOString(),
  });
});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  // Always log completions
  monitorLogger.info(`[QUEUE-EVENT] Job completed successfully`, {
    jobId,
    returnvalue,
    timestamp: new Date().toISOString(),
  });
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  // Always log failures
  monitorLogger.error(`[QUEUE-EVENT] Job failed`, {
    jobId,
    failedReason,
    timestamp: new Date().toISOString(),
  });
});

queueEvents.on('stalled', ({ jobId }) => {
  // Always log stalls
  monitorLogger.warn(`[QUEUE-EVENT] Job stalled`, {
    jobId,
    timestamp: new Date().toISOString(),
  });
});

queueEvents.on('progress', ({ jobId, data }) => {
  // Log progress updates
  monitorLogger.info(`[QUEUE-EVENT] Job progress`, {
    jobId,
    data,
    timestamp: new Date().toISOString(),
  });
});

// Add a monitor check job
export async function addMonitorJob(data: MonitorJobData, delay?: number): Promise<Job<MonitorJobData>> {
  try {
    const job = await monitorQueue.add('check-monitor', data, {
      delay: delay || 0,
      jobId: `${data.monitorId}-${Date.now()}`, // Unique job ID
    });
    
    // Always log job additions (important for debugging)
    monitorLogger.info(`[QUEUE] Added monitor job to queue`, {
      jobId: job.id,
      jobName: 'check-monitor',
      monitorId: data.monitorId,
      monitorName: data.name,
      url: data.url,
      delay: delay || 0,
      timestamp: new Date().toISOString(),
    });
    
    // Log queue stats after adding
    const waiting = await monitorQueue.getWaitingCount();
    const delayed = await monitorQueue.getDelayedCount();
    monitorLogger.info(`[QUEUE] Queue stats after adding job`, {
      waiting: waiting,
      delayed: delayed,
      jobId: job.id,
    });
    
    return job;
  } catch (error) {
    monitorLogger.error('[QUEUE] Failed to add monitor job', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      data 
    });
    throw error;
  }
}

// Schedule recurring monitor checks
export async function scheduleMonitor(data: MonitorJobData & { checkInterval: number }): Promise<void> {
  try {
    // Add immediate check
    await addMonitorJob(data);
    
    // Use the checkInterval from the monitor data
    const checkIntervalMinutes = Math.max(1, Math.floor(data.checkInterval / 60));
    
    // Use a cron pattern for recurring jobs
    const cronPattern = `*/${checkIntervalMinutes} * * * *`; // Every N minutes
    
    const recurringJob = await monitorQueue.add('recurring-check', data, {
      repeat: { pattern: cronPattern },
      jobId: `recurring-${data.monitorId}`,
    });
    
    // Always log scheduling (important for debugging)
    monitorLogger.info(`[QUEUE] Scheduled recurring monitor`, {
      monitorId: data.monitorId,
      monitorName: data.name,
      recurringJobId: recurringJob.id,
      cronPattern,
      checkInterval: data.checkInterval,
      checkIntervalMinutes,
      timestamp: new Date().toISOString(),
    });
    
    // Warn if worker might not be running
    monitorLogger.warn(`[QUEUE] IMPORTANT: Make sure the worker process is running!`, {
      message: 'Jobs are added to the queue, but they will not be processed unless the worker is running.',
      command: 'Run: npm run worker (or pnpm worker)',
      monitorId: data.monitorId,
    });
  } catch (error) {
    monitorLogger.error('[QUEUE] Failed to schedule monitor', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      data 
    });
    throw error;
  }
}

// Remove monitor from queue
export async function removeMonitor(monitorId: string): Promise<void> {
  try {
    // Remove recurring job
    const recurringJob = await monitorQueue.getJob(`recurring-${monitorId}`);
    if (recurringJob) {
      await recurringJob.remove();
    }
    
    // Remove any pending jobs for this monitor
    const jobs = await monitorQueue.getJobs(['waiting', 'delayed', 'active']);
    const monitorJobs = jobs.filter(job => job.data.monitorId === monitorId);
    
    for (const job of monitorJobs) {
      await job.remove();
    }
    
    // Only log removals in development
    if (!isProduction) {
      monitorLogger.info(`Removed monitor from queue`, { monitorId, removedJobs: monitorJobs.length });
    }
  } catch (error) {
    logger.error('Failed to remove monitor from queue', { error, monitorId });
    throw error;
  }
}

// Get queue statistics
export async function getQueueStats() {
  try {
    const waiting = await monitorQueue.getWaiting();
    const active = await monitorQueue.getActive();
    const completed = await monitorQueue.getCompleted();
    const failed = await monitorQueue.getFailed();
    
    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  } catch (error) {
    logger.error('Failed to get queue stats', { error });
    throw error;
  }
}

// Get jobs with pagination
export async function getJobsPaginated(
  statuses: ('waiting' | 'active' | 'completed' | 'failed' | 'delayed')[] = ['waiting', 'active', 'delayed'],
  page: number = 1,
  limit: number = 20
) {
  try {
    const skip = (page - 1) * limit;
    const allJobs: Job<MonitorJobData>[] = [];

    // Get jobs from each status
    for (const status of statuses) {
      let jobs: Job<MonitorJobData>[] = [];
      
      switch (status) {
        case 'waiting':
          jobs = await monitorQueue.getWaiting(0, -1);
          break;
        case 'active':
          jobs = await monitorQueue.getActive(0, -1);
          break;
        case 'completed':
          jobs = await monitorQueue.getCompleted(0, -1);
          break;
        case 'failed':
          jobs = await monitorQueue.getFailed(0, -1);
          break;
        case 'delayed':
          jobs = await monitorQueue.getDelayed(0, -1);
          break;
      }
      
      allJobs.push(...jobs);
    }

    // Sort by timestamp (newest first)
    allJobs.sort((a, b) => {
      const aTime = a.timestamp || 0;
      const bTime = b.timestamp || 0;
      return bTime - aTime;
    });

    const total = allJobs.length;
    const paginatedJobs = allJobs.slice(skip, skip + limit);

    // Format jobs for response
    const formattedJobs = await Promise.all(
      paginatedJobs.map(async (job) => {
        const state = await job.getState();
        const progress = job.progress;
        const returnValue = job.returnvalue;
        const failedReason = job.failedReason;
        const opts = job.opts;

        return {
          id: job.id,
          name: job.name,
          data: job.data,
          state,
          progress,
          returnValue,
          failedReason,
          timestamp: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          attemptsMade: job.attemptsMade,
          opts: {
            delay: opts?.delay,
            repeat: opts?.repeat,
            attempts: opts?.attempts,
            backoff: opts?.backoff
          }
        };
      })
    );

    return {
      jobs: formattedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to get jobs paginated', { error });
    throw error;
  }
}

// Daily summary reconciliation queue
export const summaryReconciliationQueue = new Queue('summary-reconciliation', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

/**
 * Schedule daily summary reconciliation job
 * This runs once per day to recalculate summaries for the previous day
 * as a safety net in case any incremental updates were missed
 */
export async function scheduleDailyReconciliation(): Promise<void> {
  try {
    // Run daily at 2:00 AM (after most checks are done)
    const cronPattern = '0 2 * * *'; // Daily at 2 AM
    
    await summaryReconciliationQueue.add('reconcile-daily-summaries', {}, {
      repeat: { pattern: cronPattern },
      jobId: 'daily-summary-reconciliation',
    });

    monitorLogger.info('[QUEUE] Scheduled daily summary reconciliation', {
      cronPattern,
      nextRun: 'Daily at 2:00 AM',
    });
  } catch (error) {
    monitorLogger.error('[QUEUE] Failed to schedule daily reconciliation', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Graceful shutdown
export async function closeQueue(): Promise<void> {
  try {
    await monitorQueue.close();
    await queueEvents.close();
    await summaryReconciliationQueue.close();
    monitorLogger.info('Queue closed gracefully');
  } catch (error) {
    logger.error('Error closing queue', { error });
  }
}
