const { body, param, query, validationResult } = require('express-validator');

// Common validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Sanitize string to prevent XSS
const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim();
};

// Login validation
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

// Review validation
const validateReview = [
    body('authorName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Author name must be 2-100 characters')
        .customSanitizer(sanitizeString),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('content')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Review must be 10-2000 characters')
        .customSanitizer(sanitizeString),
    handleValidationErrors
];

// Blog post validation
const validateBlogPost = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be 5-200 characters')
        .customSanitizer(sanitizeString),
    body('content')
        .trim()
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters'),
    body('excerpt')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Excerpt must be under 500 characters')
        .customSanitizer(sanitizeString),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Category must be under 50 characters')
        .customSanitizer(sanitizeString),
    body('status')
        .optional()
        .isIn(['draft', 'published'])
        .withMessage('Status must be draft or published'),
    handleValidationErrors
];

// Contact form validation
const validateContact = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be 2-100 characters')
        .customSanitizer(sanitizeString),
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('subject')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Subject must be under 200 characters')
        .customSanitizer(sanitizeString),
    body('message')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Message must be 10-5000 characters')
        .customSanitizer(sanitizeString),
    handleValidationErrors
];

// ID parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid ID'),
    handleValidationErrors
];

// Slug parameter validation
const validateSlug = [
    param('slug')
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Invalid slug format')
        .isLength({ max: 200 })
        .withMessage('Slug too long'),
    handleValidationErrors
];

// Pagination validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

module.exports = {
    validateLogin,
    validateReview,
    validateBlogPost,
    validateContact,
    validateId,
    validateSlug,
    validatePagination,
    handleValidationErrors
};
