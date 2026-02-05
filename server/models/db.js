const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Database schema
const schema = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    email VARCHAR(255),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    ip_address VARCHAR(45),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(100) DEFAULT 'general',
    author_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visitor_stats (
    id SERIAL PRIMARY KEY,
    page VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'replied')),
    ip_address VARCHAR(45),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK(type IN ('new_app', 'update', 'announcement')),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    author_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_stats_page ON visitor_stats(page);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
`;

// Initialize database schema
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        await client.query(schema);

        // Migration: Add missing columns to users table
        const userColumns = [
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'login_attempts', type: 'INTEGER DEFAULT 0' },
            { name: 'locked_until', type: 'TIMESTAMP' },
            { name: 'deleted_at', type: 'TIMESTAMP' },
            { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
        ];

        for (const col of userColumns) {
            const columnCheck = await client.query(`
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = $1
            `, [col.name]);

            if (columnCheck.rows.length === 0) {
                await client.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
                console.log(`Added ${col.name} column to users table`);
            }
        }

        // Migration: Add user_id column to reviews table
        try {
            const reviewUserIdCheck = await client.query(`
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'reviews' AND column_name = 'user_id'
            `);
            if (reviewUserIdCheck.rows.length === 0) {
                await client.query('ALTER TABLE reviews ADD COLUMN user_id INTEGER');
                console.log('Added user_id column to reviews table');
            }
        } catch (err) {
            console.error('Migration error (reviews.user_id):', err.message);
        }

        // Migration: Add user_id column to contact_submissions table
        try {
            const contactUserIdCheck = await client.query(`
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'contact_submissions' AND column_name = 'user_id'
            `);
            if (contactUserIdCheck.rows.length === 0) {
                await client.query('ALTER TABLE contact_submissions ADD COLUMN user_id INTEGER');
                console.log('Added user_id column to contact_submissions table');
            }
        } catch (err) {
            console.error('Migration error (contact_submissions.user_id):', err.message);
        }

        // Migration: Create announcements table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id SERIAL PRIMARY KEY,
                type VARCHAR(20) NOT NULL CHECK(type IN ('new_app', 'update', 'announcement')),
                title VARCHAR(500) NOT NULL,
                content TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
                email_sent BOOLEAN DEFAULT FALSE,
                email_sent_at TIMESTAMP,
                author_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Ensured announcements table exists');

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
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        );
        return result.rows[0];
    },

    findById: async (id) => {
        const result = await pool.query(
            'SELECT id, email, name, role, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );
        return result.rows[0];
    },

    create: async (email, password, name = null, role = 'user') => {
        const hashedPassword = bcrypt.hashSync(password, 12);
        const result = await pool.query(
            'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, hashedPassword, name, role]
        );
        return result.rows[0].id;
    },

    updatePassword: async (id, newPassword) => {
        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, id]
        );
    },

    updateProfile: async (id, name) => {
        await pool.query(
            'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [name, id]
        );
    },

    softDelete: async (id) => {
        await pool.query(
            'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
    },

    checkPassword: async (user, password) => {
        return bcrypt.compareSync(password, user.password);
    },

    incrementLoginAttempts: async (id) => {
        await pool.query(
            'UPDATE users SET login_attempts = login_attempts + 1 WHERE id = $1',
            [id]
        );
    },

    resetLoginAttempts: async (id) => {
        await pool.query(
            'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = $1',
            [id]
        );
    },

    lockAccount: async (id, minutes = 15) => {
        await pool.query(
            `UPDATE users SET locked_until = NOW() + INTERVAL '${minutes} minutes' WHERE id = $1`,
            [id]
        );
    },

    isLocked: (user) => {
        return user.locked_until && new Date(user.locked_until) > new Date();
    },

    emailExists: async (email) => {
        const result = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        );
        return result.rows.length > 0;
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

    create: async (authorName, email, rating, content, ipAddress, userId = null) => {
        const result = await pool.query(
            `INSERT INTO reviews (author_name, email, rating, content, ip_address, user_id)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [authorName, email, rating, content, ipAddress, userId]
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

// Announcement operations
const announcementModel = {
    getAll: async (type = null, status = null, limit = 50, offset = 0) => {
        let query = 'SELECT * FROM announcements';
        const params = [];
        const conditions = [];

        if (type) {
            params.push(type);
            conditions.push(`type = $${params.length}`);
        }
        if (status) {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        params.push(limit, offset);
        query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const result = await pool.query(query, params);
        return result.rows;
    },

    getPublished: async (type = null, limit = 50, offset = 0) => {
        let query = `SELECT id, type, title, content, created_at
                     FROM announcements WHERE status = 'published'`;
        const params = [];

        if (type) {
            params.push(type);
            query += ` AND type = $${params.length}`;
        }

        params.push(limit, offset);
        query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const result = await pool.query(query, params);
        return result.rows;
    },

    getById: async (id) => {
        const result = await pool.query('SELECT * FROM announcements WHERE id = $1', [id]);
        return result.rows[0];
    },

    create: async (type, title, content, authorId, status = 'draft') => {
        const result = await pool.query(
            `INSERT INTO announcements (type, title, content, author_id, status)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [type, title, content, authorId, status]
        );
        return result.rows[0].id;
    },

    update: async (id, type, title, content, status) => {
        await pool.query(
            `UPDATE announcements
             SET type = $1, title = $2, content = $3, status = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [type, title, content, status, id]
        );
    },

    delete: async (id) => {
        await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    },

    markEmailSent: async (id) => {
        await pool.query(
            `UPDATE announcements
             SET email_sent = TRUE, email_sent_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [id]
        );
    },

    getStats: async () => {
        const result = await pool.query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
                SUM(CASE WHEN email_sent = TRUE THEN 1 ELSE 0 END) as email_sent
            FROM announcements
        `);
        return result.rows[0];
    }
};

// Contact form operations
const contactModel = {
    create: async (name, email, subject, message, ipAddress, userId = null) => {
        const result = await pool.query(
            `INSERT INTO contact_submissions (name, email, subject, message, ip_address, user_id)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [name, email, subject, message, ipAddress, userId]
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
    contactModel,
    announcementModel
};
