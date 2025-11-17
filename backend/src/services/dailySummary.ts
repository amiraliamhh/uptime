import { PrismaClient } from '@prisma/client';
import { monitorLogger } from '../config/logger';

const prisma = new PrismaClient();

export interface CheckResult {
  status: 'success' | 'failure' | 'timeout' | 'error';
  responseTime: number;
}

/**
 * Update daily summary incrementally when a check completes
 * This is called in real-time after each monitor check
 */
export async function updateDailySummary(
  monitorId: string,
  organizationId: string,
  result: CheckResult,
  checkedAt: Date = new Date()
): Promise<void> {
  try {
    // Get the date (YYYY-MM-DD) for the summary
    const date = new Date(checkedAt);
    date.setHours(0, 0, 0, 0); // Set to start of day

    const responseTime = result.responseTime || 0;
    
    // First, try to get existing summary to calculate new values
    const existingSummary = await prisma.dailySummary.findUnique({
      where: {
        monitorId_date: {
          monitorId,
          date,
        },
      },
    });

    // Calculate new values
    const newTotalChecks = (existingSummary?.totalChecks || 0) + 1;
    let newSuccessfulChecks = existingSummary?.successfulChecks || 0;
    let newFailedChecks = existingSummary?.failedChecks || 0;
    let newTimeoutChecks = existingSummary?.timeoutChecks || 0;
    let newErrorChecks = existingSummary?.errorChecks || 0;
    
    // Increment the appropriate counter
    if (result.status === 'success') {
      newSuccessfulChecks++;
    } else if (result.status === 'failure') {
      newFailedChecks++;
    } else if (result.status === 'timeout') {
      newTimeoutChecks++;
    } else if (result.status === 'error') {
      newErrorChecks++;
    }

    const newTotalResponseTime = (existingSummary?.totalResponseTime || 0) + responseTime;
    const newAverageResponseTime = newTotalResponseTime / newTotalChecks;
    const newUptimePercentage = (newSuccessfulChecks / newTotalChecks) * 100;
    
    // Calculate min/max response times
    const newMinResponseTime = existingSummary?.minResponseTime 
      ? Math.min(existingSummary.minResponseTime, responseTime)
      : responseTime;
    const newMaxResponseTime = existingSummary?.maxResponseTime
      ? Math.max(existingSummary.maxResponseTime, responseTime)
      : responseTime;

    // Use upsert to create or update the daily summary atomically
    await prisma.dailySummary.upsert({
      where: {
        monitorId_date: {
          monitorId,
          date,
        },
      },
      create: {
        monitorId,
        organizationId,
        date,
        totalChecks: newTotalChecks,
        successfulChecks: newSuccessfulChecks,
        failedChecks: newFailedChecks,
        timeoutChecks: newTimeoutChecks,
        errorChecks: newErrorChecks,
        totalResponseTime: newTotalResponseTime,
        averageResponseTime: newAverageResponseTime,
        minResponseTime: newMinResponseTime,
        maxResponseTime: newMaxResponseTime,
        uptimePercentage: newUptimePercentage,
      },
      update: {
        totalChecks: newTotalChecks,
        successfulChecks: newSuccessfulChecks,
        failedChecks: newFailedChecks,
        timeoutChecks: newTimeoutChecks,
        errorChecks: newErrorChecks,
        totalResponseTime: newTotalResponseTime,
        averageResponseTime: newAverageResponseTime,
        minResponseTime: newMinResponseTime,
        maxResponseTime: newMaxResponseTime,
        uptimePercentage: newUptimePercentage,
      },
    });

    // Only log in development to avoid spam
    if (process.env.NODE_ENV !== 'production') {
      monitorLogger.debug('[DAILY-SUMMARY] Updated daily summary', {
        monitorId,
        date: date.toISOString().split('T')[0],
        status: result.status,
        uptimePercentage: newUptimePercentage.toFixed(2),
      });
    }
  } catch (error) {
    // Log error but don't throw - we don't want to fail the check if summary update fails
    monitorLogger.error('[DAILY-SUMMARY] Failed to update daily summary', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      monitorId,
      organizationId,
    });
  }
}


/**
 * Recalculate daily summary for a specific monitor and date
 * This is used for reconciliation jobs
 */
export async function recalculateDailySummary(
  monitorId: string,
  date: Date
): Promise<void> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all logs for this monitor on this date
    const logs = await prisma.log.findMany({
      where: {
        monitorId,
        checkedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        status: true,
        responseTime: true,
      },
    });

    if (logs.length === 0) {
      // No logs for this day, delete summary if it exists
      await prisma.dailySummary.deleteMany({
        where: {
          monitorId,
          date: startOfDay,
        },
      });
      return;
    }

    // Calculate aggregates
    const totalChecks = logs.length;
    const successfulChecks = logs.filter(log => log.status === 'success').length;
    const failedChecks = logs.filter(log => log.status === 'failure').length;
    const timeoutChecks = logs.filter(log => log.status === 'timeout').length;
    const errorChecks = logs.filter(log => log.status === 'error').length;
    
    const responseTimes = logs.map(log => log.responseTime).filter(rt => rt > 0);
    const totalResponseTime = responseTimes.reduce((sum, rt) => sum + rt, 0);
    const averageResponseTime = responseTimes.length > 0 
      ? totalResponseTime / responseTimes.length 
      : 0;
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : null;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : null;
    
    const uptimePercentage = totalChecks > 0 
      ? (successfulChecks / totalChecks) * 100 
      : 0;

    // Get organizationId from monitor
    const monitor = await prisma.monitor.findUnique({
      where: { id: monitorId },
      select: { organizationId: true },
    });

    if (!monitor) {
      throw new Error(`Monitor ${monitorId} not found`);
    }

    // Upsert the summary
    await prisma.dailySummary.upsert({
      where: {
        monitorId_date: {
          monitorId,
          date: startOfDay,
        },
      },
      create: {
        monitorId,
        organizationId: monitor.organizationId,
        date: startOfDay,
        totalChecks,
        successfulChecks,
        failedChecks,
        timeoutChecks,
        errorChecks,
        uptimePercentage,
        averageResponseTime,
        minResponseTime,
        maxResponseTime,
        totalResponseTime,
      },
      update: {
        totalChecks,
        successfulChecks,
        failedChecks,
        timeoutChecks,
        errorChecks,
        uptimePercentage,
        averageResponseTime,
        minResponseTime,
        maxResponseTime,
        totalResponseTime,
      },
    });

    monitorLogger.info('[DAILY-SUMMARY] Recalculated daily summary', {
      monitorId,
      date: startOfDay.toISOString().split('T')[0],
      totalChecks,
      uptimePercentage: uptimePercentage.toFixed(2),
    });
  } catch (error) {
    monitorLogger.error('[DAILY-SUMMARY] Failed to recalculate daily summary', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      monitorId,
      date: date.toISOString().split('T')[0],
    });
    throw error;
  }
}

