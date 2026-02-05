const express = require('express');
const router = express.Router();

const { reviewModel, statsModel } = require('../models/db');
const { validateReview, validateId, validatePagination } = require('../middleware/validator');
const { reviewLimiter } = require('../config/security');
const { asyncHandler } = require('../middleware/errorHandler');
const { optionalAuthenticateToken } = require('../middleware/auth');

// GET /api/reviews - Get approved reviews (public)
router.get('/', validatePagination, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reviews = await reviewModel.getApproved(limit, offset);

    res.json({
        reviews,
        pagination: {
            page,
            limit,
            hasMore: reviews.length === limit
        }
    });
}));

// GET /api/reviews/stats - Get review statistics
router.get('/stats', asyncHandler(async (req, res) => {
    const stats = await reviewModel.getStats();

    res.json({
        total: parseInt(stats.total) || 0,
        approved: parseInt(stats.approved) || 0,
        averageRating: stats.avg_rating ? parseFloat(parseFloat(stats.avg_rating).toFixed(1)) : 0
    });
}));

// GET /api/reviews/:id - Get single review
router.get('/:id', validateId, asyncHandler(async (req, res) => {
    const review = await reviewModel.getById(parseInt(req.params.id));

    if (!review) {
        return res.status(404).json({ error: 'Review not found' });
    }

    // Only return approved reviews to public
    if (review.status !== 'approved') {
        return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
        review: {
            id: review.id,
            authorName: review.author_name,
            rating: review.rating,
            content: review.content,
            createdAt: review.created_at
        }
    });
}));

// POST /api/reviews - Submit new review
router.post('/', reviewLimiter, optionalAuthenticateToken, validateReview, asyncHandler(async (req, res) => {
    const { authorName, email, rating, content } = req.body;
    const ip = req.ip || 'unknown';
    const userId = req.user?.id || null;

    const reviewId = await reviewModel.create(authorName, email, rating, content, ip, userId);

    // Track page visit
    await statsModel.recordVisit('/reviews', ip, req.headers['user-agent']);

    res.status(201).json({
        message: 'Review submitted successfully. It will be visible after approval.',
        reviewId
    });
}));

module.exports = router;
