const winston = require("winston");
const fs = require("fs");
const path = require("path");

const logDir = path.join(process.cwd(), "data", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configure the Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "bloggen" },
  transports: [
    // Write logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    // Write all logs to system.log
    new winston.transports.File({
      filename: path.join(logDir, "system.log"),
    }),
  ],
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Create a stream object for Morgan (HTTP request logger)
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = { logger, stream };
