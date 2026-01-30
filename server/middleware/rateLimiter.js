const { loginAttemptModel } = require('../models/db');

// Check for brute force attacks on login
const checkBruteForce = async (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    try {
        const result = loginAttemptModel.getRecentFailures(ip, 15);

        if (result && result.count >= 5) {
            return res.status(429).json({
                error: 'Too many failed login attempts',
                message: 'Please try again in 15 minutes',
                retryAfter: 15
            });
        }

        next();
    } catch (error) {
        // If we can't check, allow the request but log the error
        console.error('Brute force check error:', error);
        next();
    }
};

// Record login attempt
const recordLoginAttempt = (ip, email, success) => {
    try {
        loginAttemptModel.record(ip, email, success);
    } catch (error) {
        console.error('Failed to record login attempt:', error);
    }
};

// Clean up old login attempts (call periodically)
const cleanupLoginAttempts = () => {
    try {
        loginAttemptModel.clearOldAttempts();
    } catch (error) {
        console.error('Failed to cleanup login attempts:', error);
    }
};

// Request size limiter
const requestSizeLimiter = (maxSize = '10kb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxBytes = parseSize(maxSize);

        if (contentLength > maxBytes) {
            return res.status(413).json({
                error: 'Payload Too Large',
                message: `Request body exceeds ${maxSize} limit`
            });
        }
        next();
    };
};

// Parse size string to bytes
function parseSize(size) {
    const units = {
        b: 1,
        kb: 1024,
        mb: 1024 * 1024,
        gb: 1024 * 1024 * 1024
    };

    const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
    if (!match) return 10240; // Default 10kb

    const value = parseInt(match[1]);
    const unit = match[2] || 'b';

    return value * units[unit];
}

module.exports = {
    checkBruteForce,
    recordLoginAttempt,
    cleanupLoginAttempts,
    requestSizeLimiter
};
