import { Worker, Job } from 'bullmq';
import { redis } from './config/redis';
import logger, { monitorLogger } from './config/logger';
import { MonitorJobData, summaryReconciliationQueue, monitorQueue } from './services/queue';
import { MonitorChecker } from './services/monitorCheck';
import { recalculateDailySummary } from './services/dailySummary';
import { PrismaClient } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';

const prisma = new PrismaClient();

// Create worker
const worker = new Worker<MonitorJobData>('monitor-checks', async (job: Job<MonitorJobData>) => {
  const { data } = job;
  
  // Check if there are multiple waiting jobs for this monitor
  // If so, keep only the most recent one and remove older ones
  // This prevents processing all accumulated jobs when worker restarts after downtime
  try {
    const waitingJobs = await monitorQueue.getWaiting();
    const allMonitorJobs = waitingJobs.filter(
      j => j.data.monitorId === data.monitorId
    );
    
    if (allMonitorJobs.length > 1) {
      // Sort by timestamp (newest first)
      const sorted = allMonitorJobs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      const mostRecentJob = sorted[0];
      
      // If current job is NOT the most recent, skip it and let the most recent one run
      if (job.id !== mostRecentJob.id) {
        monitorLogger.info(`[WORKER] Skipping older job, keeping most recent`, {
          skippedJobId: job.id,
          keptJobId: mostRecentJob.id,
          monitorId: data.monitorId,
          skippedJobTimestamp: job.timestamp,
          keptJobTimestamp: mostRecentJob.timestamp,
          totalWaitingJobs: allMonitorJobs.length,
        });
        return; // Skip this job, the most recent one will be processed
      }
      
      // Current job is the most recent, remove all other waiting jobs for this monitor
      const jobsToRemove = sorted.slice(1); // All except the first (most recent)
      for (const oldJob of jobsToRemove) {
        await oldJob.remove();
        monitorLogger.info(`[WORKER] Removed older job for monitor`, {
          removedJobId: oldJob.id,
          monitorId: data.monitorId,
          keptJobId: job.id,
          removedJobTimestamp: oldJob.timestamp,
          keptJobTimestamp: job.timestamp,
        });
      }
      
      monitorLogger.info(`[WORKER] Cleaned up ${jobsToRemove.length} older job(s) for monitor`, {
        monitorId: data.monitorId,
        monitorName: data.name,
        keptJobId: job.id,
        totalWaitingJobs: allMonitorJobs.length,
      });
    }
  } catch (error) {
    // Log error but don't fail the job - continue processing
    monitorLogger.error(`[WORKER] Error cleaning up old jobs`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      monitorId: data.monitorId,
      jobId: job.id,
    });
  }
  
  // Always log job processing (important for debugging)
  monitorLogger.info(`[WORKER] Processing monitor check job`, {
    jobId: job.id,
    monitorId: data.monitorId,
    monitorName: data.name,
    type: data.type,
    url: data.url,
    httpMethod: data.httpMethod,
    timestamp: new Date().toISOString(),
  });

  try {
    // Execute the appropriate check based on monitor type
    monitorLogger.info(`[WORKER] Starting ${data.type.toUpperCase()} check`, {
      jobId: job.id,
      monitorId: data.monitorId,
      url: data.url,
      type: data.type,
    });

    let result;
    if (data.type === 'https') {
      result = await MonitorChecker.checkHttpsMonitor({
        url: data.url,
        httpMethod: data.httpMethod,
        requestHeaders: data.requestHeaders,
        followRedirects: data.followRedirects,
        expectedStatusCodes: data.expectedStatusCodes,
        expectedResponseHeaders: data.expectedResponseHeaders,
        checkTimeout: data.checkTimeout,
      });
    } else if (data.type === 'tcp') {
      result = await MonitorChecker.checkTcpMonitor({
        url: data.url,
        checkTimeout: data.checkTimeout,
      });
    } else {
      throw new Error(`Unsupported monitor type: ${data.type}`);
    }

    // Save the log to database
    await MonitorChecker.saveLog(data.monitorId, data.organizationId, result);

    // Check if this is a failure and handle notifications
    if (result.status === 'failure' || result.status === 'error' || result.status === 'timeout') {
      await handleMonitorFailure(data, result);
    }

    // Always log completion with details
    monitorLogger.info(`[WORKER] Monitor check completed`, {
      jobId: job.id,
      monitorId: data.monitorId,
      monitorName: data.name,
      status: result.status,
      responseTime: result.responseTime,
      httpStatus: result.httpStatus,
      errorMessage: result.errorMessage,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      status: result.status,
      responseTime: result.responseTime,
    };

  } catch (error) {
    // Always log errors, even in production
    monitorLogger.error(`Monitor check job failed`, {
      jobId: job.id,
      monitorId: data.monitorId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Save error log
    await MonitorChecker.saveLog(data.monitorId, data.organizationId, {
      status: 'error',
      responseTime: 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'JOB_ERROR',
      requestUrl: data.url,
      requestMethod: data.httpMethod,
      requestHeaders: {},
      responseHeaders: {},
      responseBody: '',
      responseBodyTruncated: false,
      redirectCount: 0,
    });

    throw error;
  }
}, {
  connection: redis,
  concurrency: 10, // Process up to 10 jobs concurrently
  removeOnComplete: 100,
  removeOnFail: 50,
});

// Worker event handlers
worker.on('completed', (job) => {
  // Always log job completion
  monitorLogger.info(`[WORKER] Job completed`, {
    jobId: job.id,
    timestamp: new Date().toISOString(),
  });
});

worker.on('failed', (job, err) => {
  // Always log failures
  monitorLogger.error(`[WORKER] Job failed`, {
    jobId: job?.id,
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
});

worker.on('error', (err) => {
  // Always log errors
  monitorLogger.error('[WORKER] Worker error', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
});

worker.on('stalled', (jobId) => {
  // Always log stalls
  monitorLogger.warn(`[WORKER] Job stalled`, {
    jobId,
    timestamp: new Date().toISOString(),
  });
});

worker.on('active', (job) => {
  // Always log when job becomes active
  monitorLogger.info(`[WORKER] Job became active`, {
    jobId: job.id,
    timestamp: new Date().toISOString(),
  });
});

// Create reconciliation worker for daily summary reconciliation
const reconciliationWorker = new Worker('summary-reconciliation', async (job: Job) => {
  monitorLogger.info('[RECONCILIATION] Starting daily summary reconciliation', {
    jobId: job.id,
    timestamp: new Date().toISOString(),
  });

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Get all active monitors
    const monitors = await prisma.monitor.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    monitorLogger.info('[RECONCILIATION] Recalculating summaries for monitors', {
      monitorCount: monitors.length,
      date: yesterday.toISOString().split('T')[0],
    });

    // Process monitors in batches to avoid overwhelming the database
    const batchSize = 20;
    let processed = 0;
    let errors = 0;

    for (let i = 0; i < monitors.length; i += batchSize) {
      const batch = monitors.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (monitor) => {
          try {
            await recalculateDailySummary(monitor.id, yesterday);
            processed++;
          } catch (error) {
            errors++;
            monitorLogger.error('[RECONCILIATION] Failed to recalculate summary', {
              monitorId: monitor.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        })
      );

      // Small delay between batches to avoid overwhelming the database
      if (i + batchSize < monitors.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    monitorLogger.info('[RECONCILIATION] Daily summary reconciliation completed', {
      totalMonitors: monitors.length,
      processed,
      errors,
      date: yesterday.toISOString().split('T')[0],
    });

    return {
      success: true,
      processed,
      errors,
      totalMonitors: monitors.length,
    };
  } catch (error) {
    monitorLogger.error('[RECONCILIATION] Reconciliation job failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}, {
  connection: redis,
  concurrency: 1, // Only one reconciliation job at a time
  removeOnComplete: 10,
  removeOnFail: 5,
});

reconciliationWorker.on('completed', (job) => {
  monitorLogger.info('[RECONCILIATION] Reconciliation job completed', {
    jobId: job.id,
    timestamp: new Date().toISOString(),
  });
});

reconciliationWorker.on('failed', (job, err) => {
  monitorLogger.error('[RECONCILIATION] Reconciliation job failed', {
    jobId: job?.id,
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Always log worker startup
monitorLogger.info('Monitor check worker started');
monitorLogger.info('Summary reconciliation worker started');

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Worker shutting down gracefully...');
  await worker.close();
  await reconciliationWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Worker shutting down gracefully...');
  await worker.close();
  await reconciliationWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

// Handle monitor failure notifications
async function handleMonitorFailure(data: MonitorJobData, result: any) {
  try {
    // Get recent failure count for this monitor
    const recentFailures = await prisma.log.count({
      where: {
        monitorId: data.monitorId,
        status: { in: ['failure', 'error', 'timeout'] },
        checkedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    // Only send notification if we've reached the failure threshold
    if (recentFailures >= data.failThreshold) {
      // Always log threshold reached (this is important)
      monitorLogger.info(`Monitor failure threshold reached`, {
        monitorId: data.monitorId,
        failures: recentFailures,
        threshold: data.failThreshold,
      });

      // TODO: Implement notification system (email, webhook, etc.)
      // For now, just log the notification
      monitorLogger.warn(`NOTIFICATION: Monitor ${data.name} is down`, {
        monitorId: data.monitorId,
        organizationId: data.organizationId,
        contacts: data.contacts,
        status: result.status,
        errorMessage: result.errorMessage,
      });
    }
  } catch (error) {
    logger.error('Failed to handle monitor failure', { error, monitorId: data.monitorId });
  }
}
