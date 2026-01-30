const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Firebase Admin SDK
const { initializeFirebase } = require('./config/firebase');
initializeFirebase();

// Import security configurations
const {
    helmetConfig,
    corsConfig,
    generalLimiter
} = require('./config/security');

// Import middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const blogRoutes = require('./routes/blog');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const settingsRoutes = require('./routes/settings');

// Initialize database
const { initializeDatabase } = require('./models/db');

// Create Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(corsConfig);

// Rate limiting
app.use(generalLimiter);

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
            ip: req.ip,
            userAgent: req.headers['user-agent']?.substring(0, 100)
        });
    });

    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database on startup
initializeDatabase();

module.exports = app;
