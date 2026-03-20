import winston from "winston"

/**
 * Application logger using Winston
 * Following working agreement: No console.log in production code
 */

const isDevelopment = process.env.NODE_ENV !== "production"

// Create logger instance
const logger = winston.createLogger({
  level: isDevelopment ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "mtn-leave-tracker" },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Write all logs to `combined.log`
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
})

// In development, also log to console with better formatting
if (isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          return `${timestamp} [${level}]: ${message} ${metaStr}`
        })
      ),
    })
  )
}

// Export typed logger functions
export const log = {
  error: (message: string, meta?: Record<string, unknown>): void => {
    logger.error(message, meta)
  },
  warn: (message: string, meta?: Record<string, unknown>): void => {
    logger.warn(message, meta)
  },
  info: (message: string, meta?: Record<string, unknown>): void => {
    logger.info(message, meta)
  },
  debug: (message: string, meta?: Record<string, unknown>): void => {
    logger.debug(message, meta)
  },
}

export default logger
