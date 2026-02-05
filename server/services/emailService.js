const nodemailer = require('nodemailer');
const { pool } = require('../models/db');

// Create transporter with SMTP settings
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

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
                                <a href="https://codeworks-lab.web.app" style="color: #667eea; text-decoration: none;">Visit our website</a>
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

// Send email to all users in batches
const sendAnnouncementEmail = async (announcement) => {
    const transporter = createTransporter();
    const emails = await getAllUserEmails();

    if (emails.length === 0) {
        return { success: true, sent: 0, message: 'No users to send email to' };
    }

    const batchSize = 10;
    let sentCount = 0;
    const errors = [];

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    const htmlContent = generateEmailTemplate(announcement);

    for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);

        const sendPromises = batch.map(async (email) => {
            try {
                await transporter.sendMail({
                    from: `"CodeWorks Lab" <${fromEmail}>`,
                    to: email,
                    subject: `[CodeWorks Lab] ${announcement.title}`,
                    html: htmlContent
                });
                sentCount++;
            } catch (error) {
                errors.push({ email, error: error.message });
            }
        });

        await Promise.all(sendPromises);

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < emails.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return {
        success: errors.length === 0,
        sent: sentCount,
        total: emails.length,
        errors: errors.length > 0 ? errors : undefined
    };
};

// Verify SMTP connection
const verifyConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendAnnouncementEmail,
    verifyConnection,
    generateEmailTemplate
};
