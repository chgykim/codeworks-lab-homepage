const express = require('express');
const router = express.Router();

const {
    reviewModel,
    blogModel,
    settingsModel,
    statsModel,
    contactModel,
    announcementModel,
    userModel
} = require('../models/db');
const { sendAnnouncementEmail, verifyConnection } = require('../services/emailService');
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
    const userStats = await userModel.getStats();

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
        },
        users: {
            total: parseInt(userStats?.total) || 0,
            admins: parseInt(userStats?.admins) || 0,
            members: parseInt(userStats?.users) || 0,
            withEmail: parseInt(userStats?.with_email) || 0
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

// ==================== Announcements Management ====================

// GET /api/admin/announcements - Get all announcements
router.get('/announcements', validatePagination, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type;
    const status = req.query.status;

    const announcements = await announcementModel.getAll(type, status, limit, offset);

    res.json({
        announcements: announcements.map(a => ({
            id: a.id,
            type: a.type,
            title: a.title,
            content: a.content,
            status: a.status,
            emailSent: a.email_sent,
            emailSentAt: a.email_sent_at,
            authorId: a.author_id,
            createdAt: a.created_at,
            updatedAt: a.updated_at
        })),
        pagination: {
            page,
            limit,
            hasMore: announcements.length === limit
        }
    });
}));

// GET /api/admin/announcements/:id - Get single announcement
router.get('/announcements/:id', validateId, asyncHandler(async (req, res) => {
    const announcement = await announcementModel.getById(parseInt(req.params.id));

    if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({
        announcement: {
            id: announcement.id,
            type: announcement.type,
            title: announcement.title,
            content: announcement.content,
            status: announcement.status,
            emailSent: announcement.email_sent,
            emailSentAt: announcement.email_sent_at,
            authorId: announcement.author_id,
            createdAt: announcement.created_at,
            updatedAt: announcement.updated_at
        }
    });
}));

// POST /api/admin/announcements - Create new announcement
router.post('/announcements', asyncHandler(async (req, res) => {
    const { type, title, content, status } = req.body;

    if (!type || !['new_app', 'update', 'announcement'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type' });
    }

    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
    }

    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Content is required' });
    }

    const announcementStatus = status === 'published' ? 'published' : 'draft';
    const announcementId = await announcementModel.create(
        type,
        title.trim(),
        content.trim(),
        null,  // author_id - Firebase UID is not compatible with INTEGER
        announcementStatus
    );

    securityLogger.adminAction(req.user.id, 'CREATE_ANNOUNCEMENT', {
        announcementId,
        type,
        title
    });

    res.status(201).json({
        message: 'Announcement created',
        announcementId
    });
}));

// PUT /api/admin/announcements/:id - Update announcement
router.put('/announcements/:id', validateId, asyncHandler(async (req, res) => {
    const { type, title, content, status } = req.body;

    const announcement = await announcementModel.getById(parseInt(req.params.id));
    if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
    }

    if (type && !['new_app', 'update', 'announcement'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type' });
    }

    await announcementModel.update(
        parseInt(req.params.id),
        type || announcement.type,
        title?.trim() || announcement.title,
        content?.trim() || announcement.content,
        status || announcement.status
    );

    securityLogger.adminAction(req.user.id, 'UPDATE_ANNOUNCEMENT', {
        announcementId: req.params.id,
        title: title || announcement.title
    });

    res.json({ message: 'Announcement updated' });
}));

// DELETE /api/admin/announcements/:id - Delete announcement
router.delete('/announcements/:id', validateId, asyncHandler(async (req, res) => {
    const announcement = await announcementModel.getById(parseInt(req.params.id));
    if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
    }

    await announcementModel.delete(parseInt(req.params.id));

    securityLogger.adminAction(req.user.id, 'DELETE_ANNOUNCEMENT', {
        announcementId: req.params.id
    });

    res.json({ message: 'Announcement deleted' });
}));

// POST /api/admin/announcements/:id/send-email - Send announcement email
router.post('/announcements/:id/send-email', validateId, asyncHandler(async (req, res) => {
    const announcement = await announcementModel.getById(parseInt(req.params.id));

    if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.status !== 'published') {
        return res.status(400).json({ error: 'Announcement must be published before sending email' });
    }

    if (announcement.email_sent) {
        return res.status(400).json({ error: 'Email has already been sent for this announcement' });
    }

    // Mark as sent immediately to prevent duplicate sends
    await announcementModel.markEmailSent(parseInt(req.params.id));

    // Send response immediately, process email in background
    res.json({
        message: 'Email sending started',
        status: 'processing'
    });

    // Send emails in background (don't await)
    sendAnnouncementEmail(announcement)
        .then(result => {
            console.log(`Email sent for announcement ${req.params.id}: ${result.sent}/${result.total}`);
            securityLogger.adminAction(req.user.id || 'system', 'SEND_ANNOUNCEMENT_EMAIL', {
                announcementId: req.params.id,
                sent: result.sent,
                total: result.total
            });
        })
        .catch(error => {
            console.error(`Failed to send email for announcement ${req.params.id}:`, error.message);
        });
}));

// POST /api/admin/announcements/:id/reset-email - Reset email sent status
router.post('/announcements/:id/reset-email', validateId, asyncHandler(async (req, res) => {
    const announcement = await announcementModel.getById(parseInt(req.params.id));

    if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
    }

    await announcementModel.resetEmailSent(parseInt(req.params.id));

    res.json({ message: 'Email status reset successfully' });
}));

// GET /api/admin/smtp-test - Test SMTP connection
router.get('/smtp-test', asyncHandler(async (req, res) => {
    const result = await verifyConnection();

    if (result.success) {
        res.json({
            message: 'SMTP connection successful',
            config: {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                user: process.env.SMTP_USER ? '***configured***' : 'NOT SET',
                pass: process.env.SMTP_PASS ? '***configured***' : 'NOT SET',
                from: process.env.SMTP_FROM || process.env.SMTP_USER || 'NOT SET'
            }
        });
    } else {
        res.status(500).json({
            error: 'SMTP connection failed',
            details: result.error,
            config: {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                user: process.env.SMTP_USER ? '***configured***' : 'NOT SET',
                pass: process.env.SMTP_PASS ? '***configured***' : 'NOT SET'
            }
        });
    }
}));

module.exports = router;
