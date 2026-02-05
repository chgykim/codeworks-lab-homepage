const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Helmet configuration for security headers
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// CORS configuration
const corsConfig = cors({
    origin: function (origin, callback) {
        const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');

        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
});

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for'] || 'unknown';
    }
});

// Strict rate limiter for authentication
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes
    message: {
        error: 'Too many login attempts. Please try again in 15 minutes.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

// Rate limiter for review submissions
const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 reviews per hour
    message: {
        error: 'Too many reviews submitted. Please try again later.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter for contact form
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 contact submissions per hour
    message: {
        error: 'Too many contact requests. Please try again later.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    helmetConfig,
    corsConfig,
    generalLimiter,
    authLimiter,
    reviewLimiter,
    contactLimiter
};
