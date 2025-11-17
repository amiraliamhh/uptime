import { PrismaClient } from '@prisma/client';
import { monitorLogger } from '../config/logger';
import { updateDailySummary } from './dailySummary';

const isProduction = process.env.NODE_ENV === 'production';

const prisma = new PrismaClient();

export interface CheckResult {
  status: 'success' | 'failure' | 'timeout' | 'error';
  responseTime: number;
  sslHandshakeTime?: number;
  dnsLookupTime?: number;
  tcpConnectTime?: number;
  httpStatus?: number;
  httpVersion?: string;
  responseSize?: number;
  redirectCount: number;
  errorMessage?: string;
  errorCode?: string;
  requestUrl: string;
  requestMethod: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  responseBodyTruncated: boolean;
  userAgent?: string;
  ipAddress?: string;
}

export class MonitorChecker {
  private static readonly MAX_RESPONSE_BODY_SIZE = 10000; // 10KB max
  private static readonly DEFAULT_USER_AGENT = 'UptimeMonitor/1.0';
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  static async checkHttpsMonitor(data: {
    url: string;
    httpMethod: string;
    requestHeaders: Array<{ key: string; value: string }>;
    followRedirects: boolean;
    expectedStatusCodes: string[];
    expectedResponseHeaders: Array<{ key: string; value: string }>;
    checkTimeout: number;
  }): Promise<CheckResult> {
    const startTime = Date.now();
    let redirectCount = 0;
    let finalUrl = data.url;
    let requestHeaders: Record<string, string> = {};
    let responseHeaders: Record<string, string> = {};
    let responseBody = '';
    let responseBodyTruncated = false;
    let httpStatus: number | undefined;
    let httpVersion: string | undefined;
    let responseSize = 0;
    let errorMessage: string | undefined;
    let errorCode: string | undefined;

    // Convert request headers array to object
    data.requestHeaders.forEach(header => {
      requestHeaders[header.key] = header.value;
    });

    // Add default headers
    requestHeaders['User-Agent'] = requestHeaders['User-Agent'] || MonitorChecker.DEFAULT_USER_AGENT;
    requestHeaders['Accept'] = requestHeaders['Accept'] || '*/*';

    // Log HTTP request details
    monitorLogger.info(`[HTTP] Making ${data.httpMethod} request`, {
      url: data.url,
      method: data.httpMethod,
      headers: requestHeaders,
      followRedirects: data.followRedirects,
      timeout: data.checkTimeout,
      timestamp: new Date().toISOString(),
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), data.checkTimeout * 1000);

      const fetchOptions: RequestInit = {
        method: data.httpMethod,
        headers: requestHeaders,
        redirect: data.followRedirects ? 'follow' : 'manual',
        signal: controller.signal,
      };

      const requestStartTime = Date.now();
      const response = await fetch(data.url, fetchOptions);
      const requestEndTime = Date.now();
      
      // Log HTTP response details
      monitorLogger.info(`[HTTP] Received response`, {
        url: data.url,
        status: response.status,
        statusText: response.statusText,
        responseTime: requestEndTime - requestStartTime,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString(),
      });
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      // Handle redirects manually if not following them
      if (!data.followRedirects && response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          redirectCount++;
          finalUrl = new URL(location, data.url).href;
        }
      }

      // Get response headers
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      httpStatus = response.status;
      httpVersion = response.headers.get('server') || 'unknown';

      // Get response body (truncated if too large)
      const responseText = await response.text();
      responseSize = responseText.length;
      
      if (responseSize > MonitorChecker.MAX_RESPONSE_BODY_SIZE) {
        responseBody = responseText.substring(0, MonitorChecker.MAX_RESPONSE_BODY_SIZE);
        responseBodyTruncated = true;
      } else {
        responseBody = responseText;
      }

      // Check if status code is expected
      const isExpectedStatus = this.checkExpectedStatus(httpStatus, data.expectedStatusCodes);
      const isExpectedHeaders = this.checkExpectedHeaders(responseHeaders, data.expectedResponseHeaders);

      const status = (isExpectedStatus && isExpectedHeaders) ? 'success' : 'failure';

      return {
        status,
        responseTime,
        httpStatus,
        httpVersion,
        responseSize,
        redirectCount,
        requestUrl: finalUrl,
        requestMethod: data.httpMethod,
        requestHeaders,
        responseHeaders,
        responseBody,
        responseBodyTruncated,
        userAgent: requestHeaders['User-Agent'],
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Log HTTP request errors
      monitorLogger.error(`[HTTP] Request failed`, {
        url: data.url,
        method: data.httpMethod,
        error: error.message,
        errorName: error.name,
        errorCode: error.code,
        responseTime,
        timestamp: new Date().toISOString(),
      });
      
      if (error.name === 'AbortError') {
        return {
          status: 'timeout',
          responseTime,
          errorMessage: 'Request timeout',
          errorCode: 'TIMEOUT',
          requestUrl: finalUrl,
          requestMethod: data.httpMethod,
          requestHeaders,
          responseHeaders,
          responseBody,
          responseBodyTruncated,
          userAgent: requestHeaders['User-Agent'],
          redirectCount,
        };
      }

      return {
        status: 'error',
        responseTime,
        errorMessage: error.message || 'Unknown error',
        errorCode: error.code || 'UNKNOWN',
        requestUrl: finalUrl,
        requestMethod: data.httpMethod,
        requestHeaders,
        responseHeaders,
        responseBody,
        responseBodyTruncated,
        userAgent: requestHeaders['User-Agent'],
        redirectCount,
      };
    }
  }

  static async checkTcpMonitor(data: {
    url: string;
    checkTimeout: number;
  }): Promise<CheckResult> {
    const startTime = Date.now();
    let errorMessage: string | undefined;
    let errorCode: string | undefined;

    try {
      // Parse URL to get host and port
      const url = new URL(data.url);
      const host = url.hostname;
      const port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);

      // Log TCP connection attempt
      monitorLogger.info(`[TCP] Attempting connection`, {
        url: data.url,
        host,
        port,
        timeout: data.checkTimeout,
        timestamp: new Date().toISOString(),
      });

      // Create TCP connection
      const net = await import('net');
      const socket = new net.Socket();

      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          const responseTime = Date.now() - startTime;
          
          monitorLogger.warn(`[TCP] Connection timeout`, {
            url: data.url,
            host,
            port,
            timeout: data.checkTimeout,
            responseTime,
            timestamp: new Date().toISOString(),
          });
          
          socket.destroy();
          resolve({
            status: 'timeout',
            responseTime,
            errorMessage: 'TCP connection timeout',
            errorCode: 'TCP_TIMEOUT',
            requestUrl: data.url,
            requestMethod: 'TCP',
            requestHeaders: {},
            responseHeaders: {},
            responseBody: '',
            responseBodyTruncated: false,
            redirectCount: 0,
          });
        }, data.checkTimeout * 1000);

        socket.connect(port, host, () => {
          clearTimeout(timeoutId);
          const responseTime = Date.now() - startTime;
          
          monitorLogger.info(`[TCP] Connection successful`, {
            url: data.url,
            host,
            port,
            responseTime,
            timestamp: new Date().toISOString(),
          });
          
          socket.destroy();
          
          resolve({
            status: 'success',
            responseTime,
            requestUrl: data.url,
            requestMethod: 'TCP',
            requestHeaders: {},
            responseHeaders: {},
            responseBody: '',
            responseBodyTruncated: false,
            redirectCount: 0,
          });
        });

        socket.on('error', (error) => {
          clearTimeout(timeoutId);
          const responseTime = Date.now() - startTime;
          
          monitorLogger.error(`[TCP] Connection failed`, {
            url: data.url,
            host,
            port,
            error: error.message,
            errorCode: error.code,
            responseTime,
            timestamp: new Date().toISOString(),
          });
          
          socket.destroy();
          
          resolve({
            status: 'error',
            responseTime,
            errorMessage: error.message,
            errorCode: 'TCP_ERROR',
            requestUrl: data.url,
            requestMethod: 'TCP',
            requestHeaders: {},
            responseHeaders: {},
            responseBody: '',
            responseBodyTruncated: false,
            redirectCount: 0,
          });
        });
      });

    } catch (error: any) {
      return {
        status: 'error',
        responseTime: Date.now() - startTime,
        errorMessage: error.message || 'Unknown TCP error',
        errorCode: error.code || 'UNKNOWN',
        requestUrl: data.url,
        requestMethod: 'TCP',
        requestHeaders: {},
        responseHeaders: {},
        responseBody: '',
        responseBodyTruncated: false,
        redirectCount: 0,
      };
    }
  }

  private static checkExpectedStatus(status: number, expectedStatusCodes: string[]): boolean {
    if (expectedStatusCodes.length === 0) return true;

    return expectedStatusCodes.some(expected => {
      if (expected.includes('-')) {
        // Handle ranges like "200-299"
        const [start, end] = expected.split('-').map(Number);
        return status >= start && status <= end;
      } else {
        // Handle single codes like "200"
        return status === parseInt(expected);
      }
    });
  }

  private static checkExpectedHeaders(responseHeaders: Record<string, string>, expectedHeaders: Array<{ key: string; value: string }>): boolean {
    if (expectedHeaders.length === 0) return true;

    return expectedHeaders.every(expected => {
      const actualValue = responseHeaders[expected.key.toLowerCase()];
      return actualValue && actualValue.includes(expected.value);
    });
  }

  static async saveLog(monitorId: string, organizationId: string, result: CheckResult): Promise<void> {
    const checkedAt = new Date();
    
    try {
      // Save the log to database
      await prisma.log.create({
        data: {
          monitorId,
          organizationId,
          status: result.status,
          responseTime: result.responseTime,
          sslHandshakeTime: result.sslHandshakeTime,
          dnsLookupTime: result.dnsLookupTime,
          tcpConnectTime: result.tcpConnectTime,
          httpStatus: result.httpStatus,
          httpVersion: result.httpVersion,
          responseSize: result.responseSize,
          redirectCount: result.redirectCount,
          errorMessage: result.errorMessage,
          errorCode: result.errorCode,
          requestUrl: result.requestUrl,
          requestMethod: result.requestMethod,
          requestHeaders: result.requestHeaders,
          responseHeaders: result.responseHeaders,
          responseBody: result.responseBody,
          responseBodyTruncated: result.responseBodyTruncated,
          userAgent: result.userAgent,
          ipAddress: result.ipAddress,
          checkedAt,
        },
      });

      // Update daily summary incrementally (non-blocking, errors are logged but don't fail the check)
      updateDailySummary(monitorId, organizationId, result, checkedAt).catch((error) => {
        // Error already logged in updateDailySummary, just ensure it doesn't break the flow
        monitorLogger.warn('[DAILY-SUMMARY] Daily summary update failed, will be reconciled later', {
          monitorId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });

      // Only log successful saves in development
      if (!isProduction) {
        monitorLogger.info('Monitor check log saved', {
          monitorId,
          status: result.status,
          responseTime: result.responseTime,
        });
      }
    } catch (error) {
      // Always log errors
      monitorLogger.error('Failed to save monitor check log', { error, monitorId, result });
      throw error;
    }
  }
}
