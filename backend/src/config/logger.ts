import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: isProduction ? 'error' : (process.env.LOG_LEVEL || 'info'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'uptime-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    ...(isProduction ? [] : [new winston.transports.File({ filename: 'logs/combined.log' })]),
  ],
});

// If we're not in production, log to the console as well
if (!isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a separate logger for monitor checks - always log at info level for debugging
export const monitorLogger = winston.createLogger({
  level: 'info', // Always log at info level to track monitor checks
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'monitor-checker' },
  transports: [
    new winston.transports.File({ filename: 'logs/monitor-errors.log', level: 'error' }),
    ...(isProduction ? [] : [new winston.transports.File({ filename: 'logs/monitor-combined.log' })]),
  ],
});

// Always log monitor checks to console for visibility (important for debugging)
monitorLogger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
}));

export default logger;
