import { Worker, Job } from 'bullmq';
import { redis } from './config/redis';
import logger, { monitorLogger } from './config/logger';
import { MonitorJobData } from './services/queue';
import { MonitorChecker } from './services/monitorCheck';
import { PrismaClient } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';

const prisma = new PrismaClient();

// Create worker
const worker = new Worker<MonitorJobData>('monitor-checks', async (job: Job<MonitorJobData>) => {
  const { data } = job;
  
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

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Worker shutting down gracefully...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Worker shutting down gracefully...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

// Always log worker startup
monitorLogger.info('Monitor check worker started');

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
