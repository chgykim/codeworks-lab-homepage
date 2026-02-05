const { pool } = require('../models/db');

// Resend API endpoint
const RESEND_API_URL = 'https://api.resend.com/emails';

// Get all registered users' emails
const getAllUserEmails = async () => {
    const result = await pool.query(
        'SELECT email FROM users WHERE deleted_at IS NULL AND email IS NOT NULL'
    );
    return result.rows.map(row => row.email);
};

// Generate HTML email template
const generateEmailTemplate = (announcement) => {
    const typeLabels = {
        new_app: 'New App',
        update: 'Update',
        announcement: 'Announcement'
    };

    const typeColors = {
        new_app: '#22c55e',
        update: '#3b82f6',
        announcement: '#f59e0b'
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${announcement.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">CodeWorks Lab</h1>
                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Safe Way 10</p>
                        </td>
                    </tr>

                    <!-- Type Badge -->
                    <tr>
                        <td style="padding: 24px 40px 0;">
                            <span style="display: inline-block; padding: 6px 16px; background-color: ${typeColors[announcement.type]}; color: #ffffff; font-size: 12px; font-weight: 600; border-radius: 20px; text-transform: uppercase;">
                                ${typeLabels[announcement.type]}
                            </span>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 24px 40px;">
                            <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px; font-weight: 600; line-height: 1.4;">
                                ${announcement.title}
                            </h2>
                            <div style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                                ${announcement.content.replace(/\n/g, '<br>')}
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px 32px; border-top: 1px solid #eaeaea;">
                            <p style="margin: 0; color: #888888; font-size: 12px; text-align: center;">
                                &copy; ${new Date().getFullYear()} CodeWorks Lab. All rights reserved.<br>
                                <a href="https://rustic-sage.web.app" style="color: #667eea; text-decoration: none;">Visit our website</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};

// Send email using Resend API
const sendEmailWithResend = async (to, subject, html) => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not set');
    }

    const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'CodeWorks Lab <onboarding@resend.dev>',
            to: to,
            subject: subject,
            html: html
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
    }

    return await response.json();
};

// Send email to all users in batches
const sendAnnouncementEmail = async (announcement) => {
    const emails = await getAllUserEmails();

    if (emails.length === 0) {
        return { success: true, sent: 0, total: 0, message: 'No users to send email to' };
    }

    const htmlContent = generateEmailTemplate(announcement);
    const subject = `[CodeWorks Lab] ${announcement.title}`;

    let sentCount = 0;
    const errors = [];

    // Send emails one by one (Resend free tier limit)
    for (const email of emails) {
        try {
            await sendEmailWithResend(email, subject, htmlContent);
            sentCount++;
            console.log(`Email sent successfully to: ${email}`);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Failed to send email to ${email}:`, error.message);
            errors.push({ email, error: error.message });
        }
    }

    return {
        success: errors.length === 0,
        sent: sentCount,
        total: emails.length,
        errors: errors.length > 0 ? errors : undefined
    };
};

// Verify Resend API connection
const verifyConnection = async () => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        return { success: false, error: 'RESEND_API_KEY is not set' };
    }

    try {
        // Test API key by getting domains (lightweight request)
        const response = await fetch('https://api.resend.com/domains', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.ok) {
            return { success: true };
        } else {
            const error = await response.json();
            return { success: false, error: error.message || 'API key invalid' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendAnnouncementEmail,
    verifyConnection,
    generateEmailTemplate
};
