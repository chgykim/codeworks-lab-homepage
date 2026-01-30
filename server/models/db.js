const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'app.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');

    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
    }

    // Create default admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123!@#';

    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

    if (!existingAdmin) {
        const hashedPassword = bcrypt.hashSync(adminPassword, 12);
        db.prepare(`
            INSERT INTO users (email, password, role) VALUES (?, ?, 'admin')
        `).run(adminEmail, hashedPassword);
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

    const insertSetting = db.prepare(`
        INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)
    `);

    for (const [key, value] of defaultSettings) {
        insertSetting.run(key, value);
    }
}

// User operations
const userModel = {
    findByEmail: (email) => {
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    },

    findById: (id) => {
        return db.prepare('SELECT id, email, role, created_at FROM users WHERE id = ?').get(id);
    },

    create: (email, password, role = 'user') => {
        const hashedPassword = bcrypt.hashSync(password, 12);
        const result = db.prepare(`
            INSERT INTO users (email, password, role) VALUES (?, ?, ?)
        `).run(email, hashedPassword, role);
        return result.lastInsertRowid;
    },

    updatePassword: (id, newPassword) => {
        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(hashedPassword, id);
    }
};

// Login attempts for brute force protection
const loginAttemptModel = {
    record: (ipAddress, email, success) => {
        db.prepare(`
            INSERT INTO login_attempts (ip_address, email, success) VALUES (?, ?, ?)
        `).run(ipAddress, email, success ? 1 : 0);
    },

    getRecentFailures: (ipAddress, minutes = 15) => {
        return db.prepare(`
            SELECT COUNT(*) as count FROM login_attempts
            WHERE ip_address = ? AND success = 0
            AND attempted_at > datetime('now', '-' || ? || ' minutes')
        `).get(ipAddress, minutes);
    },

    clearOldAttempts: () => {
        db.prepare(`
            DELETE FROM login_attempts WHERE attempted_at < datetime('now', '-1 day')
        `).run();
    }
};

// Review operations
const reviewModel = {
    getAll: (status = null, limit = 50, offset = 0) => {
        if (status) {
            return db.prepare(`
                SELECT * FROM reviews WHERE status = ?
                ORDER BY created_at DESC LIMIT ? OFFSET ?
            `).all(status, limit, offset);
        }
        return db.prepare(`
            SELECT * FROM reviews ORDER BY created_at DESC LIMIT ? OFFSET ?
        `).all(limit, offset);
    },

    getApproved: (limit = 50, offset = 0) => {
        return db.prepare(`
            SELECT id, author_name, rating, content, created_at
            FROM reviews WHERE status = 'approved'
            ORDER BY created_at DESC LIMIT ? OFFSET ?
        `).all(limit, offset);
    },

    getById: (id) => {
        return db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    },

    create: (authorName, email, rating, content, ipAddress) => {
        const result = db.prepare(`
            INSERT INTO reviews (author_name, email, rating, content, ip_address)
            VALUES (?, ?, ?, ?, ?)
        `).run(authorName, email, rating, content, ipAddress);
        return result.lastInsertRowid;
    },

    updateStatus: (id, status) => {
        db.prepare(`
            UPDATE reviews SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(status, id);
    },

    delete: (id) => {
        db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    },

    getStats: () => {
        return db.prepare(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                AVG(CASE WHEN status = 'approved' THEN rating ELSE NULL END) as avg_rating
            FROM reviews
        `).get();
    }
};

// Blog operations
const blogModel = {
    getAll: (status = null, limit = 50, offset = 0) => {
        if (status) {
            return db.prepare(`
                SELECT id, title, slug, excerpt, category, status, views, created_at
                FROM blog_posts WHERE status = ?
                ORDER BY created_at DESC LIMIT ? OFFSET ?
            `).all(status, limit, offset);
        }
        return db.prepare(`
            SELECT id, title, slug, excerpt, category, status, views, created_at
            FROM blog_posts ORDER BY created_at DESC LIMIT ? OFFSET ?
        `).all(limit, offset);
    },

    getPublished: (limit = 50, offset = 0) => {
        return db.prepare(`
            SELECT id, title, slug, excerpt, category, views, created_at
            FROM blog_posts WHERE status = 'published'
            ORDER BY created_at DESC LIMIT ? OFFSET ?
        `).all(limit, offset);
    },

    getById: (id) => {
        return db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
    },

    getBySlug: (slug) => {
        return db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(slug);
    },

    create: (title, slug, content, excerpt, category, authorId) => {
        const result = db.prepare(`
            INSERT INTO blog_posts (title, slug, content, excerpt, category, author_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(title, slug, content, excerpt, category, authorId);
        return result.lastInsertRowid;
    },

    update: (id, title, slug, content, excerpt, category, status) => {
        db.prepare(`
            UPDATE blog_posts
            SET title = ?, slug = ?, content = ?, excerpt = ?, category = ?,
                status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(title, slug, content, excerpt, category, status, id);
    },

    delete: (id) => {
        db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);
    },

    incrementViews: (id) => {
        db.prepare('UPDATE blog_posts SET views = views + 1 WHERE id = ?').run(id);
    },

    getStats: () => {
        return db.prepare(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
                SUM(views) as total_views
            FROM blog_posts
        `).get();
    }
};

// Site settings operations
const settingsModel = {
    get: (key) => {
        const result = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key);
        return result ? result.value : null;
    },

    getAll: () => {
        const rows = db.prepare('SELECT key, value FROM site_settings').all();
        return rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
    },

    set: (key, value) => {
        db.prepare(`
            INSERT INTO site_settings (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
        `).run(key, value, value);
    }
};

// Visitor stats operations
const statsModel = {
    recordVisit: (page, ipAddress, userAgent) => {
        db.prepare(`
            INSERT INTO visitor_stats (page, ip_address, user_agent) VALUES (?, ?, ?)
        `).run(page, ipAddress, userAgent);
    },

    getVisitorCount: (days = 30) => {
        return db.prepare(`
            SELECT COUNT(DISTINCT ip_address) as unique_visitors, COUNT(*) as total_visits
            FROM visitor_stats
            WHERE visited_at > datetime('now', '-' || ? || ' days')
        `).get(days);
    },

    getPageViews: (days = 30) => {
        return db.prepare(`
            SELECT page, COUNT(*) as views
            FROM visitor_stats
            WHERE visited_at > datetime('now', '-' || ? || ' days')
            GROUP BY page ORDER BY views DESC
        `).all(days);
    }
};

// Contact form operations
const contactModel = {
    create: (name, email, subject, message, ipAddress) => {
        const result = db.prepare(`
            INSERT INTO contact_submissions (name, email, subject, message, ip_address)
            VALUES (?, ?, ?, ?, ?)
        `).run(name, email, subject, message, ipAddress);
        return result.lastInsertRowid;
    },

    getAll: (status = null, limit = 50, offset = 0) => {
        if (status) {
            return db.prepare(`
                SELECT * FROM contact_submissions WHERE status = ?
                ORDER BY created_at DESC LIMIT ? OFFSET ?
            `).all(status, limit, offset);
        }
        return db.prepare(`
            SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT ? OFFSET ?
        `).all(limit, offset);
    },

    updateStatus: (id, status) => {
        db.prepare(`
            UPDATE contact_submissions SET status = ? WHERE id = ?
        `).run(status, id);
    }
};

module.exports = {
    db,
    initializeDatabase,
    userModel,
    loginAttemptModel,
    reviewModel,
    blogModel,
    settingsModel,
    statsModel,
    contactModel
};
