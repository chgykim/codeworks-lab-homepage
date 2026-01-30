const express = require('express');
const router = express.Router();

const { blogModel, statsModel } = require('../models/db');
const { validateSlug, validatePagination } = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/blog - Get published blog posts
router.get('/', validatePagination, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category;

    let posts = blogModel.getPublished(limit, offset);

    // Filter by category if provided
    if (category) {
        posts = posts.filter(p => p.category === category);
    }

    res.json({
        posts,
        pagination: {
            page,
            limit,
            hasMore: posts.length === limit
        }
    });
}));

// GET /api/blog/categories - Get unique categories
router.get('/categories', asyncHandler(async (req, res) => {
    const posts = blogModel.getPublished(1000, 0);
    const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];

    res.json({ categories });
}));

// GET /api/blog/:slug - Get single blog post by slug
router.get('/:slug', validateSlug, asyncHandler(async (req, res) => {
    const post = blogModel.getBySlug(req.params.slug);

    if (!post || post.status !== 'published') {
        return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    blogModel.incrementViews(post.id);

    // Track page visit
    const ip = req.ip || 'unknown';
    statsModel.recordVisit(`/blog/${req.params.slug}`, ip, req.headers['user-agent']);

    res.json({
        post: {
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            category: post.category,
            views: post.views + 1,
            createdAt: post.created_at,
            updatedAt: post.updated_at
        }
    });
}));

module.exports = router;
