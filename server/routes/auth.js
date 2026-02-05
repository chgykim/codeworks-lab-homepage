const express = require('express');
const router = express.Router();

const { verifyIdToken, isAdminEmail, ADMIN_EMAIL } = require('../config/firebase');
const { generateToken, authenticateToken, cookieOptions } = require('../middleware/auth');
const { authLimiter, registerLimiter } = require('../config/security');
const { validateRegister, validateLogin } = require('../middleware/validator');
const { userModel, loginAttemptModel } = require('../models/db');
const { securityLogger } = require('../utils/logger');

// POST /api/auth/register - User registration
router.post('/register', registerLimiter, validateRegister, async (req, res) => {
    const { email, password, name } = req.body;
    const ip = req.ip || 'unknown';

    try {
        // Check if email already exists
        const emailExists = await userModel.emailExists(email);
        if (emailExists) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user
        const userId = await userModel.create(email, password, name, 'user');

        securityLogger.loginAttempt(ip, email, true);

        // Generate token
        const token = generateToken({
            uid: userId,
            email: email,
            role: 'user'
        });

        res.cookie('authToken', token, cookieOptions);

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: userId,
                email: email,
                name: name,
                role: 'user'
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login - Email/password login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || 'unknown';

    try {
        // Find user
        const user = await userModel.findByEmail(email);

        if (!user) {
            await loginAttemptModel.record(ip, email, false);
            securityLogger.loginAttempt(ip, email, false);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if account is locked
        if (userModel.isLocked(user)) {
            const unlockTime = new Date(user.locked_until);
            return res.status(423).json({
                error: 'Account is temporarily locked',
                lockedUntil: unlockTime.toISOString()
            });
        }

        // Check password
        const isValidPassword = await userModel.checkPassword(user, password);

        if (!isValidPassword) {
            await loginAttemptModel.record(ip, email, false);
            await userModel.incrementLoginAttempts(user.id);
            securityLogger.loginAttempt(ip, email, false);

            // Lock account after 5 failed attempts
            if (user.login_attempts >= 4) {
                await userModel.lockAccount(user.id, 15);
                return res.status(423).json({
                    error: 'Account locked due to too many failed attempts. Try again in 15 minutes.'
                });
            }

            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Reset login attempts on successful login
        await userModel.resetLoginAttempts(user.id);
        await loginAttemptModel.record(ip, email, true);
        securityLogger.loginAttempt(ip, email, true);

        // Generate token
        const token = generateToken({
            uid: user.id,
            email: user.email,
            role: user.role
        });

        res.cookie('authToken', token, cookieOptions);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/auth/check-email - Check if email is available
router.get('/check-email', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const exists = await userModel.emailExists(email);
        res.json({ available: !exists });
    } catch (error) {
        console.error('Email check error:', error);
        res.status(500).json({ error: 'Check failed' });
    }
});

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
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // For database users, fetch fresh data
        if (typeof req.user.id === 'number') {
            const user = await userModel.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        }

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
