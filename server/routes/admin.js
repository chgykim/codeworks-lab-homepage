const express = require('express');
const router = express.Router();

const {
    reviewModel,
    blogModel,
    settingsModel,
    statsModel,
    contactModel
} = require('../models/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateBlogPost, validateId, validatePagination } = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { securityLogger } = require('../utils/logger');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// ==================== Dashboard ====================

// GET /api/admin/dashboard - Get dashboard stats
router.get('/dashboard', asyncHandler(async (req, res) => {
    const reviewStats = await reviewModel.getStats();
    const blogStats = await blogModel.getStats();
    const visitorStats = await statsModel.getVisitorCount(30);
    const pageViews = await statsModel.getPageViews(30);

    res.json({
        reviews: {
            total: parseInt(reviewStats.total) || 0,
            pending: parseInt(reviewStats.pending) || 0,
            approved: parseInt(reviewStats.approved) || 0,
            averageRating: reviewStats.avg_rating ? parseFloat(parseFloat(reviewStats.avg_rating).toFixed(1)) : 0
        },
        blog: {
            total: parseInt(blogStats.total) || 0,
            published: parseInt(blogStats.published) || 0,
            drafts: parseInt(blogStats.drafts) || 0,
            totalViews: parseInt(blogStats.total_views) || 0
        },
        visitors: {
            uniqueVisitors: parseInt(visitorStats?.unique_visitors) || 0,
            totalVisits: parseInt(visitorStats?.total_visits) || 0,
            topPages: pageViews.slice(0, 5)
        }
    });
}));

// ==================== Reviews Management ====================

// GET /api/admin/reviews - Get all reviews (including pending)
router.get('/reviews', validatePagination, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status; // pending, approved, rejected

    const reviews = await reviewModel.getAll(status, limit, offset);

    res.json({
        reviews: reviews.map(r => ({
            id: r.id,
            authorName: r.author_name,
            email: r.email,
            rating: r.rating,
            content: r.content,
            status: r.status,
            ipAddress: r.ip_address,
            createdAt: r.created_at
        })),
        pagination: {
            page,
            limit,
            hasMore: reviews.length === limit
        }
    });
}));

// PUT /api/admin/reviews/:id/status - Update review status
router.put('/reviews/:id/status', validateId, asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const review = await reviewModel.getById(parseInt(req.params.id));
    if (!review) {
        return res.status(404).json({ error: 'Review not found' });
    }

    await reviewModel.updateStatus(parseInt(req.params.id), status);

    securityLogger.adminAction(req.user.id, 'UPDATE_REVIEW_STATUS', {
        reviewId: req.params.id,
        newStatus: status
    });

    res.json({ message: 'Review status updated', status });
}));

// DELETE /api/admin/reviews/:id - Delete review
router.delete('/reviews/:id', validateId, asyncHandler(async (req, res) => {
    const review = await reviewModel.getById(parseInt(req.params.id));
    if (!review) {
        return res.status(404).json({ error: 'Review not found' });
    }

    await reviewModel.delete(parseInt(req.params.id));

    securityLogger.adminAction(req.user.id, 'DELETE_REVIEW', {
        reviewId: req.params.id
    });

    res.json({ message: 'Review deleted' });
}));

// ==================== Blog Management ====================

// GET /api/admin/blog - Get all blog posts
router.get('/blog', validatePagination, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const posts = await blogModel.getAll(status, limit, offset);

    res.json({
        posts,
        pagination: {
            page,
            limit,
            hasMore: posts.length === limit
        }
    });
}));

// GET /api/admin/blog/:id - Get single blog post
router.get('/blog/:id', validateId, asyncHandler(async (req, res) => {
    const post = await blogModel.getById(parseInt(req.params.id));

    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
}));

// POST /api/admin/blog - Create new blog post
router.post('/blog', validateBlogPost, asyncHandler(async (req, res) => {
    const { title, content, excerpt, category, status } = req.body;

    // Generate slug from title
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100)
        + '-' + Date.now();

    const postId = await blogModel.create(
        title,
        slug,
        content,
        excerpt || content.substring(0, 200) + '...',
        category || 'general',
        req.user.id
    );

    if (status === 'published') {
        await blogModel.update(postId, title, slug, content, excerpt, category, 'published');
    }

    securityLogger.adminAction(req.user.id, 'CREATE_BLOG_POST', {
        postId,
        title
    });

    res.status(201).json({
        message: 'Blog post created',
        postId,
        slug
    });
}));

// PUT /api/admin/blog/:id - Update blog post
router.put('/blog/:id', validateId, validateBlogPost, asyncHandler(async (req, res) => {
    const { title, content, excerpt, category, status } = req.body;

    const post = await blogModel.getById(parseInt(req.params.id));
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    // Generate new slug if title changed
    let slug = post.slug;
    if (title !== post.title) {
        slug = title
            .toLowerCase()
            .replace(/[^a-z0-9가-힣\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100)
            + '-' + Date.now();
    }

    await blogModel.update(
        parseInt(req.params.id),
        title,
        slug,
        content,
        excerpt || content.substring(0, 200) + '...',
        category || 'general',
        status || 'draft'
    );

    securityLogger.adminAction(req.user.id, 'UPDATE_BLOG_POST', {
        postId: req.params.id,
        title
    });

    res.json({ message: 'Blog post updated', slug });
}));

// DELETE /api/admin/blog/:id - Delete blog post
router.delete('/blog/:id', validateId, asyncHandler(async (req, res) => {
    const post = await blogModel.getById(parseInt(req.params.id));
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    await blogModel.delete(parseInt(req.params.id));

    securityLogger.adminAction(req.user.id, 'DELETE_BLOG_POST', {
        postId: req.params.id
    });

    res.json({ message: 'Blog post deleted' });
}));

// ==================== Settings ====================

// GET /api/admin/settings - Get all settings
router.get('/settings', asyncHandler(async (req, res) => {
    const settings = await settingsModel.getAll();
    res.json({ settings });
}));

// PUT /api/admin/settings - Update settings
router.put('/settings', asyncHandler(async (req, res) => {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Invalid settings format' });
    }

    const allowedKeys = [
        'site_name',
        'site_description',
        'contact_email',
        'app_store_url',
        'play_store_url'
    ];

    for (const [key, value] of Object.entries(settings)) {
        if (allowedKeys.includes(key) && typeof value === 'string') {
            await settingsModel.set(key, value.substring(0, 500));
        }
    }

    securityLogger.adminAction(req.user.id, 'UPDATE_SETTINGS', {
        keys: Object.keys(settings)
    });

    res.json({ message: 'Settings updated' });
}));

// ==================== Contact Submissions ====================

// GET /api/admin/contacts - Get contact submissions
router.get('/contacts', validatePagination, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const submissions = await contactModel.getAll(status, limit, offset);

    res.json({
        submissions,
        pagination: {
            page,
            limit,
            hasMore: submissions.length === limit
        }
    });
}));

// PUT /api/admin/contacts/:id/status - Update contact status
router.put('/contacts/:id/status', validateId, asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!['unread', 'read', 'replied'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    await contactModel.updateStatus(parseInt(req.params.id), status);

    res.json({ message: 'Contact status updated' });
}));

module.exports = router;
