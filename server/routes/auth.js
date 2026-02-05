const express = require('express');
const router = express.Router();

const { verifyIdToken, isAdminEmail } = require('../config/firebase');
const { generateToken, authenticateToken, cookieOptions } = require('../middleware/auth');
const { authLimiter } = require('../config/security');
const { securityLogger } = require('../utils/logger');

// POST /api/auth/firebase-login - Firebase Google login (Admin only)
router.post('/firebase-login', authLimiter, async (req, res) => {
    const { idToken } = req.body;
    const ip = req.ip || 'unknown';

    if (!idToken) {
        return res.status(400).json({ error: 'ID token required' });
    }

    try {
        // Verify Firebase ID token
        const decoded = await verifyIdToken(idToken);

        const isAdmin = isAdminEmail(decoded.email);

        // Only allow admin users
        if (!isAdmin) {
            securityLogger.loginAttempt(ip, decoded.email, false);
            return res.status(403).json({ error: 'Admin access only' });
        }

        // Log the login attempt
        securityLogger.loginAttempt(ip, decoded.email, true);

        // Generate session token
        const token = generateToken({
            uid: decoded.uid,
            email: decoded.email,
            role: 'admin'
        });

        // Set cookie
        res.cookie('authToken', token, cookieOptions);

        res.json({
            message: 'Login successful',
            user: {
                id: decoded.uid,
                email: decoded.email,
                displayName: decoded.displayName,
                photoURL: decoded.photoURL,
                role: 'admin'
            },
            token
        });
    } catch (error) {
        console.error('Firebase login error:', error);
        securityLogger.loginAttempt(ip, 'unknown', false);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me - Get current user (admin only)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // For Firebase users (admin)
        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role,
                displayName: req.user.displayName,
                photoURL: req.user.photoURL
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// POST /api/auth/refresh - Refresh token
router.post('/refresh', authenticateToken, (req, res) => {
    const token = generateToken({
        uid: req.user.id,
        email: req.user.email,
        role: req.user.role
    });

    res.cookie('authToken', token, cookieOptions);

    res.json({
        message: 'Token refreshed',
        token
    });
});

module.exports = router;
