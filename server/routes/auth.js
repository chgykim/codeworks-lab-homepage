const express = require('express');
const router = express.Router();

const { verifyIdToken, isAdminEmail, ADMIN_EMAIL } = require('../config/firebase');
const { generateToken, authenticateToken, cookieOptions } = require('../middleware/auth');
const { authLimiter } = require('../config/security');
const { securityLogger } = require('../utils/logger');

// POST /api/auth/firebase-login - Firebase Google login
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

        // Log the login attempt
        securityLogger.loginAttempt(ip, decoded.email, true);

        // Generate session token
        const token = generateToken({
            uid: decoded.uid,
            email: decoded.email,
            role: isAdmin ? 'admin' : 'user'
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
                role: isAdmin ? 'admin' : 'user'
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

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            displayName: req.user.displayName,
            photoURL: req.user.photoURL
        }
    });
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
