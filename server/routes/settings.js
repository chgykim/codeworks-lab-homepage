const express = require('express');
const router = express.Router();

const { settingsModel, statsModel } = require('../models/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All app keys
const APP_KEYS = ['wayvision', 'waypulse', 'wayback', 'wayscan', 'waysound', 'waypanic', 'wayenvelope', 'waybrain', 'wayrest', 'waymoments', 'wayer', 'waywild', 'waystory', 'waycrash'];

// GET /api/settings/public - Get public site settings
router.get('/public', asyncHandler(async (req, res) => {
    const settings = await settingsModel.getAll();

    // Track homepage visit
    const ip = req.ip || 'unknown';
    await statsModel.recordVisit('/', ip, req.headers['user-agent']);

    // Get released apps (stored as comma-separated string)
    const releasedAppsStr = settings.released_apps || '';
    const releasedApps = releasedAppsStr ? releasedAppsStr.split(',') : [];

    res.json({
        siteName: settings.site_name || 'CodeWorks Lab',
        siteDescription: settings.site_description || 'Way 12 - 기록하고, 보여주고, 돕는 12개의 앱',
        appStoreUrl: settings.app_store_url || '#',
        playStoreUrl: settings.play_store_url || '#',
        releasedApps: releasedApps
    });
}));

// GET /api/settings/apps - Get app release status (admin only)
router.get('/apps', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    const settings = await settingsModel.getAll();
    const releasedAppsStr = settings.released_apps || '';
    const releasedApps = releasedAppsStr ? releasedAppsStr.split(',') : [];

    const apps = APP_KEYS.map(key => ({
        key,
        released: releasedApps.includes(key)
    }));

    res.json({ apps });
}));

// PUT /api/settings/apps - Update app release status (admin only)
router.put('/apps', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    const { releasedApps } = req.body;

    if (!Array.isArray(releasedApps)) {
        return res.status(400).json({ error: 'releasedApps must be an array' });
    }

    // Validate app keys
    const validApps = releasedApps.filter(key => APP_KEYS.includes(key));

    // Store as comma-separated string
    await settingsModel.set('released_apps', validApps.join(','));

    res.json({ message: 'App release status updated', releasedApps: validApps });
}));

module.exports = router;
