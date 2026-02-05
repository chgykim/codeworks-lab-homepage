const express = require('express');
const router = express.Router();
const { announcementModel } = require('../models/db');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/announcements - Get published announcements
router.get('/', asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type; // new_app, update, announcement

    const announcements = await announcementModel.getPublished(type, limit, offset);

    res.json({
        announcements: announcements.map(a => ({
            id: a.id,
            type: a.type,
            title: a.title,
            content: a.content,
            createdAt: a.created_at
        })),
        pagination: {
            page,
            limit,
            hasMore: announcements.length === limit
        }
    });
}));

module.exports = router;
