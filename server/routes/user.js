const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { validatePassword, validateId } = require('../middleware/validator');
const { userModel, reviewModel, contactModel } = require('../models/db');

// All routes require authentication
router.use(authenticateToken);

// GET /api/user/profile - Get user profile
router.get('/profile', async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', async (req, res) => {
    const { name } = req.body;

    try {
        await userModel.updateProfile(req.user.id, name);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// PUT /api/user/password - Change password
router.put('/password', validatePassword, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await userModel.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValid = await userModel.checkPassword(user, currentPassword);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        await userModel.updatePassword(req.user.id, newPassword);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// DELETE /api/user/account - Delete account (soft delete)
router.delete('/account', async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required to delete account' });
    }

    try {
        const user = await userModel.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password
        const isValid = await userModel.checkPassword(user, password);
        if (!isValid) {
            return res.status(401).json({ error: 'Password is incorrect' });
        }

        // Soft delete user
        await userModel.softDelete(req.user.id);

        // Clear auth cookie
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// GET /api/user/reviews - Get user's reviews
router.get('/reviews', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        const { pool } = require('../models/db');
        const result = await pool.query(
            `SELECT id, author_name, rating, content, status, created_at
             FROM reviews WHERE user_id = $1
             ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [req.user.id, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) as total FROM reviews WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            reviews: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({ error: 'Failed to get reviews' });
    }
});

// DELETE /api/user/reviews/:id - Delete user's review
router.delete('/reviews/:id', validateId, async (req, res) => {
    const reviewId = parseInt(req.params.id);

    try {
        const { pool } = require('../models/db');

        // Check if review belongs to user
        const result = await pool.query(
            'SELECT id FROM reviews WHERE id = $1 AND user_id = $2',
            [reviewId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        await reviewModel.delete(reviewId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// GET /api/user/inquiries - Get user's contact submissions
router.get('/inquiries', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        const { pool } = require('../models/db');
        const result = await pool.query(
            `SELECT id, subject, message, status, created_at
             FROM contact_submissions WHERE user_id = $1
             ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [req.user.id, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) as total FROM contact_submissions WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            inquiries: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Get user inquiries error:', error);
        res.status(500).json({ error: 'Failed to get inquiries' });
    }
});

module.exports = router;
