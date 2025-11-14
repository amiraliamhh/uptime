# Monitor System Documentation

This document describes the complete monitoring system implementation, including the job queue architecture, worker processes, and monitor check services.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Production Considerations](#production-considerations)
- [Troubleshooting](#troubleshooting)

---

## Overview

The monitoring system is designed to handle thousands of uptime checks efficiently using a distributed job queue architecture. It supports both HTTP/HTTPS and TCP monitoring with comprehensive logging and alerting capabilities.

### Key Features

- **Scalable Job Queue** - Bull/BullMQ with Redis for job management
- **Worker Processes** - Separate processes for executing monitor checks
- **Comprehensive Monitoring** - HTTP/HTTPS and TCP checks with detailed metrics
- **Production-Optimized Logging** - Minimal logging in production to prevent spam
- **Database Integration** - MongoDB with Prisma for data persistence
- **Real-time Scheduling** - Cron-based recurring job scheduling

---

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Server    │    │   Job Queue     │    │   Worker Pool   │
│                 │    │   (Redis)       │    │                 │
│  - Monitor CRUD │───▶│  - Job Storage  │───▶│  - Check Exec   │
│  - Auth         │    │  - Scheduling   │    │  - Logging      │
│  - Validation   │    │  - Retry Logic  │    │  - Notifications│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   Redis         │    │   External      │
│                 │    │                 │    │   APIs/Sites    │
│  - Monitor Data │    │  - Job Queue    │    │                 │
│  - Check Logs   │    │  - Cache        │    │  - HTTP Checks  │
│  - Users/Orgs   │    │  - Sessions     │    │  - TCP Checks   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Interaction

1. **API Server** receives monitor creation/update requests
2. **Job Queue** schedules and manages monitor check jobs
3. **Worker Processes** execute the actual monitoring checks
4. **Database** stores monitor configurations and check results
5. **External Services** are monitored via HTTP/TCP requests

---

## Core Components

### 1. Job Queue System (`src/services/queue.ts`)

The job queue manages monitor scheduling and execution using Bull/BullMQ with Redis.

#### Key Functions

- **`addMonitorJob()`** - Adds a single monitor check job
- **`scheduleMonitor()`** - Schedules recurring monitor checks
- **`removeMonitor()`** - Removes monitor from queue
- **`getQueueStats()`** - Returns queue statistics

#### Job Data Structure

```typescript
interface MonitorJobData {
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
  checkInterval: number;  // Seconds between checks
  checkTimeout: number;   // Request timeout in seconds
  failThreshold: number;  // Failures before alert
  contacts: string[];     // User IDs to notify
}
```

#### Scheduling Logic

- **Immediate Check** - First check runs immediately
- **Recurring Checks** - Cron pattern based on `checkInterval`
- **Cron Pattern** - `*/${minutes} * * * *` (every N minutes)
- **Job Persistence** - Jobs survive server restarts

### 2. Worker Process (`src/worker.ts`)

Separate process that executes monitor checks with concurrency control.

#### Features

- **Concurrent Processing** - Up to 10 jobs simultaneously
- **Error Handling** - Comprehensive error handling and retry logic
- **Graceful Shutdown** - Proper cleanup on process termination
- **Failure Notifications** - Alerts when failure threshold is reached

#### Worker Flow

1. **Receive Job** - Get monitor check job from queue
2. **Execute Check** - Run appropriate check (HTTP/TCP)
3. **Save Results** - Store check results in database
4. **Handle Failures** - Process notifications if threshold reached
5. **Log Results** - Log success/failure (production-optimized)

### 3. Monitor Check Service (`src/services/monitorCheck.ts`)

Core service that performs actual monitoring checks using fetch API.

#### HTTP/HTTPS Monitoring

```typescript
static async checkHttpsMonitor(data: {
  url: string;
  httpMethod: string;
  requestHeaders: Array<{ key: string; value: string }>;
  followRedirects: boolean;
  expectedStatusCodes: string[];
  expectedResponseHeaders: Array<{ key: string; value: string }>;
  checkTimeout: number;
}): Promise<CheckResult>
```

**Features:**
- **Fetch API** - Modern HTTP client with timeout support
- **Header Management** - Custom request headers
- **Redirect Handling** - Configurable redirect following
- **Status Code Validation** - Range and exact match support
- **Response Header Validation** - Expected header checking
- **Body Truncation** - Large responses truncated to save space

#### TCP Monitoring

```typescript
static async checkTcpMonitor(data: {
  url: string;
  checkTimeout: number;
}): Promise<CheckResult>
```

**Features:**
- **Port Connectivity** - Tests TCP connection to host:port
- **Timeout Handling** - Configurable connection timeout
- **Error Detection** - Network and connection errors

#### Check Result Structure

```typescript
interface CheckResult {
  status: 'success' | 'failure' | 'timeout' | 'error';
  responseTime: number;           // Total response time (ms)
  sslHandshakeTime?: number;      // SSL handshake time (ms)
  dnsLookupTime?: number;         // DNS lookup time (ms)
  tcpConnectTime?: number;        // TCP connection time (ms)
  httpStatus?: number;            // HTTP status code
  httpVersion?: string;           // HTTP version
  responseSize?: number;          // Response body size (bytes)
  redirectCount: number;          // Number of redirects followed
  errorMessage?: string;          // Error message if failed
  errorCode?: string;             // Error code if failed
  requestUrl: string;             // Final URL after redirects
  requestMethod: string;          // HTTP method used
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  responseBody?: string;          // Response body (truncated)
  responseBodyTruncated: boolean; // Whether body was truncated
  userAgent?: string;             // User agent used
  ipAddress?: string;             // IP address of target
}
```

### 4. Database Integration

#### Monitor Model

```typescript
model Monitor {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  organizationId        String    @db.ObjectId
  type                  String    // "https", "tcp"
  name                  String
  failThreshold         Int       @default(3)
  checkInterval         Int       @default(300) // seconds
  checkTimeout          Int       @default(30)  // seconds
  url                   String
  httpMethod            String    @default("HEAD")
  requestHeaders        Json      // Array of key/value pairs
  followRedirects       Boolean   @default(true)
  expectedStatusCodes   String[]  // Array like "200-299", "300"
  expectedResponseHeaders Json    // Array of key/value pairs
  contacts              String[]  // Array of user IDs
  isActive              Boolean   @default(true)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

#### Log Model

```typescript
model Log {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  monitorId             String    @db.ObjectId
  organizationId        String    @db.ObjectId
  status                String    // "success", "failure", "timeout", "error"
  responseTime          Int       // Total response time (ms)
  sslHandshakeTime      Int?      // SSL handshake time (ms)
  dnsLookupTime         Int?      // DNS lookup time (ms)
  tcpConnectTime        Int?      // TCP connection time (ms)
  httpStatus            Int?      // HTTP status code
  httpVersion           String?   // HTTP version
  responseSize          Int?      // Response body size (bytes)
  redirectCount         Int       @default(0)
  errorMessage          String?   // Error message if failed
  errorCode             String?   // Error code if failed
  requestUrl            String    // Final URL after redirects
  requestMethod         String    // HTTP method used
  requestHeaders        Json?     // Request headers sent
  responseHeaders       Json?     // Response headers received
  responseBody          String?   // Response body (truncated)
  responseBodyTruncated Boolean   @default(false)
  userAgent             String?   // User agent used
  ipAddress             String?   // IP address of target
  checkedAt             DateTime  @default(now())
  createdAt             DateTime  @default(now())
}
```

---

## Data Flow

### 1. Monitor Creation Flow

```
User Request → API Validation → Database Save → Job Queue → Worker Execution
     ↓              ↓              ↓            ↓           ↓
  POST /monitors  Validate Data  Create Monitor  Schedule   Execute Check
     ↓              ↓              ↓            ↓           ↓
  Auth Check    Type/URL Check  Store Config   Add Job    Fetch Request
     ↓              ↓              ↓            ↓           ↓
  Org Access    Interval Check  Return Data   Redis Queue  Save Log
```

### 2. Monitor Check Execution Flow

```
Cron Trigger → Job Queue → Worker → Monitor Check → Database Log → Notification
     ↓            ↓         ↓          ↓             ↓            ↓
  Schedule    Get Job    Process    HTTP/TCP      Save Result   Check Threshold
     ↓            ↓         ↓          ↓             ↓            ↓
  Every N min  Redis     Worker    Fetch API    MongoDB      Send Alert
```

### 3. Error Handling Flow

```
Check Failure → Error Logging → Threshold Check → Notification → Retry Logic
     ↓              ↓              ↓              ↓            ↓
  Timeout/Error  Log Error     Count Failures   Send Alert   Retry Job
     ↓              ↓              ↓              ↓            ↓
  Save Status    Monitor Log   Check Count     Email/Webhook  Queue Retry
```

---

## API Endpoints

### Monitor Management

#### `GET /api/v1/monitors`
- **Purpose**: Get all monitors for user's organizations
- **Auth**: Required (JWT token)
- **Response**: Array of monitors with log counts

#### `POST /api/v1/monitors`
- **Purpose**: Create a new monitor
- **Auth**: Required (JWT token)
- **Body**: Monitor configuration (type, name, url, etc.)
- **Response**: Created monitor with scheduling confirmation

#### `GET /api/v1/monitors/:id`
- **Purpose**: Get specific monitor details
- **Auth**: Required (JWT token)
- **Response**: Monitor details with organization info

#### `PUT /api/v1/monitors/:id`
- **Purpose**: Update monitor configuration
- **Auth**: Required (JWT token)
- **Body**: Updated monitor fields
- **Response**: Updated monitor (reschedules if active)

#### `DELETE /api/v1/monitors/:id`
- **Purpose**: Delete monitor and stop scheduling
- **Auth**: Required (JWT token)
- **Response**: Deletion confirmation

#### `GET /api/v1/monitors/:id/logs`
- **Purpose**: Get monitor check logs
- **Auth**: Required (JWT token)
- **Query**: `limit`, `offset` for pagination
- **Response**: Array of check logs with pagination info

### Request/Response Examples

#### Create Monitor Request

```json
{
  "type": "https",
  "name": "API Health Check",
  "url": "https://api.example.com/health",
  "httpMethod": "GET",
  "requestHeaders": [
    {"key": "Authorization", "value": "Bearer token123"},
    {"key": "Content-Type", "value": "application/json"}
  ],
  "followRedirects": true,
  "expectedStatusCodes": ["200-299"],
  "expectedResponseHeaders": [
    {"key": "Content-Type", "value": "application/json"}
  ],
  "checkInterval": 300,
  "checkTimeout": 30,
  "failThreshold": 3,
  "contacts": ["user_id_1", "user_id_2"]
}
```

#### Monitor Response

```json
{
  "message": "Monitor created successfully",
  "monitor": {
    "id": "monitor_id",
    "organizationId": "org_id",
    "type": "https",
    "name": "API Health Check",
    "url": "https://api.example.com/health",
    "httpMethod": "GET",
    "checkInterval": 300,
    "checkTimeout": 30,
    "failThreshold": 3,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL=mongodb://localhost:27017/uptime

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Logging
LOG_LEVEL=info
NODE_ENV=production

# API Configuration
BACKEND_PORT=6052
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:6051

# Email Configuration
MAIL_SMTP_USERNAME=your-email@gmail.com
MAIL_SMTP_TOKEN=your-app-password
MAIL_SMTP_SERVER=smtp.gmail.com
MAIL_SMTP_PORT=587
```

### Redis Configuration

```typescript
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};
```

### Queue Configuration

```typescript
const monitorQueue = new Queue<MonitorJobData>('monitor-checks', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,  // Keep last 100 completed jobs
    removeOnFail: 50,       // Keep last 50 failed jobs
    attempts: 3,            // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});
```

---

## Production Considerations

### Logging Optimization

The system implements production-optimized logging to prevent log spam from thousands of monitor checks.

#### Development Logging
- **Full Logging** - All operations logged
- **Console Output** - Real-time debugging
- **Combined Logs** - All log levels in files

#### Production Logging
- **Error-Only** - Only errors and critical events
- **No Console** - File-based logging only
- **Separate Logs** - Monitor errors in dedicated files

#### Log Files
- `logs/error.log` - All system errors
- `logs/monitor-errors.log` - Monitor-specific errors
- `logs/combined.log` - All logs (development only)
- `logs/monitor-combined.log` - All monitor logs (development only)

### Performance Optimization

#### Database Indexes
```typescript
// Efficient querying for logs
@@index([monitorId, checkedAt])
@@index([organizationId, checkedAt])
@@index([status, checkedAt])
```

#### Memory Management
- **Response Body Truncation** - Large responses limited to 10KB
- **Job Cleanup** - Automatic removal of old completed jobs
- **Connection Pooling** - Efficient database connections

#### Scalability
- **Horizontal Scaling** - Add more workers as needed
- **Job Distribution** - Redis distributes jobs across workers
- **Concurrent Processing** - Multiple checks run simultaneously

### Monitoring and Alerting

#### Queue Health
- **Job Statistics** - Track waiting, active, completed, failed jobs
- **Worker Health** - Monitor worker process status
- **Error Rates** - Track failure rates and patterns

#### System Metrics
- **Response Times** - Monitor check performance
- **Error Rates** - Track system reliability
- **Resource Usage** - Monitor CPU, memory, disk usage

---

## Troubleshooting

### Common Issues

#### 1. Jobs Not Processing
**Symptoms**: Jobs stuck in queue, no worker activity
**Causes**: 
- Worker process not running
- Redis connection issues
- Worker crashed

**Solutions**:
- Check worker process status
- Verify Redis connectivity
- Restart worker process
- Check worker logs for errors

#### 2. High Memory Usage
**Symptoms**: System running out of memory
**Causes**:
- Large response bodies not truncated
- Too many jobs in queue
- Memory leaks in worker

**Solutions**:
- Verify response body truncation
- Clean up old jobs
- Restart worker processes
- Monitor memory usage

#### 3. Database Connection Issues
**Symptoms**: Logs not saving, database errors
**Causes**:
- MongoDB connection lost
- Database overload
- Network issues

**Solutions**:
- Check MongoDB status
- Verify connection string
- Monitor database performance
- Check network connectivity

#### 4. Redis Connection Issues
**Symptoms**: Jobs not queued, queue errors
**Causes**:
- Redis server down
- Connection configuration wrong
- Network issues

**Solutions**:
- Check Redis server status
- Verify connection settings
- Test Redis connectivity
- Check Redis logs

### Debugging Commands

#### Check Queue Status
```bash
# Get queue statistics
curl http://localhost:6052/api/v1/queue/stats
```

#### Monitor Worker Logs
```bash
# Development
pnpm run worker

# Production
NODE_ENV=production pnpm run worker
```

#### Check Redis Status
```bash
# Connect to Redis
redis-cli

# Check queue length
LLEN bull:monitor-checks:waiting
```

#### Database Queries
```bash
# Check recent logs
db.logs.find().sort({checkedAt: -1}).limit(10)

# Check monitor status
db.monitors.find({isActive: true})
```

### Performance Tuning

#### Worker Concurrency
```typescript
// Adjust based on system capacity
const worker = new Worker<MonitorJobData>('monitor-checks', processor, {
  concurrency: 10, // Increase for more powerful systems
});
```

#### Queue Cleanup
```typescript
// Adjust retention based on needs
defaultJobOptions: {
  removeOnComplete: 100, // Keep more for debugging
  removeOnFail: 50,      // Keep more for analysis
}
```

#### Database Optimization
- **Index Optimization** - Add indexes for common queries
- **Connection Pooling** - Optimize database connections
- **Query Optimization** - Use efficient queries

---

## Conclusion

The monitoring system provides a robust, scalable solution for uptime monitoring with:

- **High Performance** - Handles thousands of monitors efficiently
- **Reliability** - Fault-tolerant with retry logic and error handling
- **Scalability** - Horizontal scaling with worker processes
- **Production Ready** - Optimized logging and resource management
- **Comprehensive Monitoring** - Detailed metrics and alerting
- **Easy Maintenance** - Clear separation of concerns and debugging tools

The system is designed to grow with your needs while maintaining performance and reliability in production environments.
