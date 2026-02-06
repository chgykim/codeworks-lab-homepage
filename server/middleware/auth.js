const jwt = require('jsonwebtoken');
const { verifyIdToken, isAdminEmail } = require('../config/firebase');

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT token (for session management after Firebase auth)
function generateToken(user) {
    return jwt.sign(
        {
            id: user.uid || user.id,
            email: user.email,
            role: user.role || (isAdminEmail(user.email) ? 'admin' : 'user')
        },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

// Verify JWT token middleware
function authenticateToken(req, res, next) {
    // Get token from cookie or Authorization header
    const token = req.cookies?.authToken ||
        req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // First try to verify as Firebase ID token
    verifyIdToken(token)
        .then((decoded) => {
            req.user = {
                id: decoded.uid,
                email: decoded.email,
                role: decoded.isAdmin ? 'admin' : 'user',
                displayName: decoded.displayName,
                photoURL: decoded.photoURL
            };
            next();
        })
        .catch(() => {
            // If Firebase verification fails, try JWT verification
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                req.user = decoded;
                next();
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token expired' });
                }
                return res.status(403).json({ error: 'Invalid token' });
            }
        });
}

// Check if user is admin
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Optional authentication - doesn't fail if no token
function optionalAuth(req, res, next) {
    const token = req.cookies?.authToken ||
        req.headers.authorization?.replace('Bearer ', '');

    if (token) {
        // Try Firebase token first
        verifyIdToken(token)
            .then((decoded) => {
                req.user = {
                    id: decoded.uid,
                    email: decoded.email,
                    role: decoded.isAdmin ? 'admin' : 'user'
                };
                next();
            })
            .catch(() => {
                // Try JWT
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    req.user = decoded;
                } catch (error) {
                    // Token invalid, but we don't fail - just don't set user
                }
                next();
            });
    } else {
        next();
    }
}

// Cookie options for JWT
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

module.exports = {
    generateToken,
    authenticateToken,
    requireAdmin,
    optionalAuth,
    optionalAuthenticateToken: optionalAuth,
    cookieOptions
};
