const express = require('express');
const router = express.Router();

const { contactModel, settingsModel } = require('../models/db');
const { validateContact } = require('../middleware/validator');
const { contactLimiter } = require('../config/security');
const { asyncHandler } = require('../middleware/errorHandler');
const { optionalAuthenticateToken } = require('../middleware/auth');

// POST /api/contact - Submit contact form
router.post('/', contactLimiter, optionalAuthenticateToken, validateContact, asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;
    const ip = req.ip || 'unknown';
    const userId = req.user?.id || null;

    const submissionId = await contactModel.create(name, email, subject, message, ip, userId);

    res.status(201).json({
        message: 'Your message has been sent. We will get back to you soon.',
        submissionId
    });
}));

// GET /api/contact/info - Get contact information
router.get('/info', asyncHandler(async (req, res) => {
    const settings = await settingsModel.getAll();

    res.json({
        contactEmail: settings.contact_email || 'contact@example.com',
        siteName: settings.site_name || 'HealthLife App'
    });
}));

module.exports = router;
