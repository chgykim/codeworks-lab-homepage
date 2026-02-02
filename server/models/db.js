const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database schema
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');

        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await client.query(schema);
        }

        // Create default admin user if not exists
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123!@#';

        const existingAdmin = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [adminEmail]
        );

        if (existingAdmin.rows.length === 0) {
            const hashedPassword = bcrypt.hashSync(adminPassword, 12);
            await client.query(
                'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
                [adminEmail, hashedPassword, 'admin']
            );
            console.log('Default admin user created');
        }

        // Insert default site settings
        const defaultSettings = [
            ['site_name', 'HealthLife App'],
            ['site_description', '건강한 라이프스타일을 위한 최고의 앱'],
            ['contact_email', 'contact@healthlife.app'],
            ['app_store_url', 'https://apps.apple.com'],
            ['play_store_url', 'https://play.google.com']
        ];

        for (const [key, value] of defaultSettings) {
            await client.query(
                'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
                [key, value]
            );
        }
    } finally {
        client.release();
    }
}

// User operations
const userModel = {
    findByEmail: async (email) => {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    findById: async (id) => {
        const result = await pool.query(
            'SELECT id, email, role, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    create: async (email, password, role = 'user') => {
        const hashedPassword = bcrypt.hashSync(password, 12);
        const result = await pool.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
            [email, hashedPassword, role]
        );
        return result.rows[0].id;
    },

    updatePassword: async (id, newPassword) => {
        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, id]
        );
    }
};

// Login attempts for brute force protection
const loginAttemptModel = {
    record: async (ipAddress, email, success) => {
        await pool.query(
            'INSERT INTO login_attempts (ip_address, email, success) VALUES ($1, $2, $3)',
            [ipAddress, email, success]
        );
    },

    getRecentFailures: async (ipAddress, minutes = 15) => {
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM login_attempts
             WHERE ip_address = $1 AND success = FALSE
             AND attempted_at > NOW() - INTERVAL '${minutes} minutes'`,
            [ipAddress]
        );
        return result.rows[0];
    },

    clearOldAttempts: async () => {
        await pool.query(
            "DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '1 day'"
        );
    }
};

// Review operations
const reviewModel = {
    getAll: async (status = null, limit = 50, offset = 0) => {
        if (status) {
            const result = await pool.query(
                `SELECT * FROM reviews WHERE status = $1
                 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
                [status, limit, offset]
            );
            return result.rows;
        }
        const result = await pool.query(
            'SELECT * FROM reviews ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        return result.rows;
    },

    getApproved: async (limit = 50, offset = 0) => {
        const result = await pool.query(
            `SELECT id, author_name, rating, content, created_at
             FROM reviews WHERE status = 'approved'
             ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    },

    getById: async (id) => {
        const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
        return result.rows[0];
    },

    create: async (authorName, email, rating, content, ipAddress) => {
        const result = await pool.query(
            `INSERT INTO reviews (author_name, email, rating, content, ip_address)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [authorName, email, rating, content, ipAddress]
        );
        return result.rows[0].id;
    },

    updateStatus: async (id, status) => {
        await pool.query(
            'UPDATE reviews SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [status, id]
        );
    },

    delete: async (id) => {
        await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    },

    getStats: async () => {
        const result = await pool.query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                AVG(CASE WHEN status = 'approved' THEN rating ELSE NULL END) as avg_rating
            FROM reviews
        `);
        return result.rows[0];
    }
};

// Blog operations
const blogModel = {
    getAll: async (status = null, limit = 50, offset = 0) => {
        if (status) {
            const result = await pool.query(
                `SELECT id, title, slug, excerpt, category, status, views, created_at
                 FROM blog_posts WHERE status = $1
                 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
                [status, limit, offset]
            );
            return result.rows;
        }
        const result = await pool.query(
            `SELECT id, title, slug, excerpt, category, status, views, created_at
             FROM blog_posts ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    },

    getPublished: async (limit = 50, offset = 0) => {
        const result = await pool.query(
            `SELECT id, title, slug, excerpt, category, views, created_at
             FROM blog_posts WHERE status = 'published'
             ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    },

    getById: async (id) => {
        const result = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
        return result.rows[0];
    },

    getBySlug: async (slug) => {
        const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [slug]);
        return result.rows[0];
    },

    create: async (title, slug, content, excerpt, category, authorId) => {
        const result = await pool.query(
            `INSERT INTO blog_posts (title, slug, content, excerpt, category, author_id)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [title, slug, content, excerpt, category, authorId]
        );
        return result.rows[0].id;
    },

    update: async (id, title, slug, content, excerpt, category, status) => {
        await pool.query(
            `UPDATE blog_posts
             SET title = $1, slug = $2, content = $3, excerpt = $4, category = $5,
                 status = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7`,
            [title, slug, content, excerpt, category, status, id]
        );
    },

    delete: async (id) => {
        await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    },

    incrementViews: async (id) => {
        await pool.query('UPDATE blog_posts SET views = views + 1 WHERE id = $1', [id]);
    },

    getStats: async () => {
        const result = await pool.query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
                SUM(views) as total_views
            FROM blog_posts
        `);
        return result.rows[0];
    }
};

// Site settings operations
const settingsModel = {
    get: async (key) => {
        const result = await pool.query(
            'SELECT value FROM site_settings WHERE key = $1',
            [key]
        );
        return result.rows[0] ? result.rows[0].value : null;
    },

    getAll: async () => {
        const result = await pool.query('SELECT key, value FROM site_settings');
        return result.rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
    },

    set: async (key, value) => {
        await pool.query(
            `INSERT INTO site_settings (key, value) VALUES ($1, $2)
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
            [key, value]
        );
    }
};

// Visitor stats operations
const statsModel = {
    recordVisit: async (page, ipAddress, userAgent) => {
        await pool.query(
            'INSERT INTO visitor_stats (page, ip_address, user_agent) VALUES ($1, $2, $3)',
            [page, ipAddress, userAgent]
        );
    },

    getVisitorCount: async (days = 30) => {
        const result = await pool.query(
            `SELECT COUNT(DISTINCT ip_address) as unique_visitors, COUNT(*) as total_visits
             FROM visitor_stats
             WHERE visited_at > NOW() - INTERVAL '${days} days'`
        );
        return result.rows[0];
    },

    getPageViews: async (days = 30) => {
        const result = await pool.query(
            `SELECT page, COUNT(*) as views
             FROM visitor_stats
             WHERE visited_at > NOW() - INTERVAL '${days} days'
             GROUP BY page ORDER BY views DESC`
        );
        return result.rows;
    }
};

// Contact form operations
const contactModel = {
    create: async (name, email, subject, message, ipAddress) => {
        const result = await pool.query(
            `INSERT INTO contact_submissions (name, email, subject, message, ip_address)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [name, email, subject, message, ipAddress]
        );
        return result.rows[0].id;
    },

    getAll: async (status = null, limit = 50, offset = 0) => {
        if (status) {
            const result = await pool.query(
                `SELECT * FROM contact_submissions WHERE status = $1
                 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
                [status, limit, offset]
            );
            return result.rows;
        }
        const result = await pool.query(
            'SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        return result.rows;
    },

    updateStatus: async (id, status) => {
        await pool.query(
            'UPDATE contact_submissions SET status = $1 WHERE id = $2',
            [status, id]
        );
    }
};

module.exports = {
    pool,
    initializeDatabase,
    userModel,
    loginAttemptModel,
    reviewModel,
    blogModel,
    settingsModel,
    statsModel,
    contactModel
};
