const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for logging
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        if (stack) {
            log += `\n${stack}`;
        }
        return log;
    })
);

// Create logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: customFormat,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        }),
        // File transport for errors
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Security event logger
const securityLogger = {
    loginAttempt: (ip, email, success) => {
        logger.info('Login attempt', {
            type: 'AUTH',
            ip,
            email,
            success
        });
    },

    rateLimitHit: (ip, endpoint) => {
        logger.warn('Rate limit exceeded', {
            type: 'RATE_LIMIT',
            ip,
            endpoint
        });
    },

    suspiciousActivity: (ip, description, details = {}) => {
        logger.warn('Suspicious activity detected', {
            type: 'SECURITY',
            ip,
            description,
            ...details
        });
    },

    adminAction: (userId, action, details = {}) => {
        logger.info('Admin action', {
            type: 'ADMIN',
            userId,
            action,
            ...details
        });
    }
};

module.exports = logger;
module.exports.securityLogger = securityLogger;
