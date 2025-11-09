/**
 * Email Service (Nodemailer)
 * 
 * Pluggable email service - no-op if SMTP not configured
 * Used for order confirmations, RSVP confirmations, etc.
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

let transporter = null;

/**
 * Initialize email transporter if SMTP is configured
 */
function initTransporter() {
    if (transporter) return transporter;

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        console.log('[Email] SMTP not configured - email functions will be no-ops');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: smtpPort === '465', // true for 465, false for other ports
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    return transporter;
}

/**
 * Send email (no-op if SMTP not configured)
 * 
 * @param {Object} options - { to, subject, html, text }
 * @returns {Promise<boolean>} - true if sent, false if skipped
 */
export async function sendEmail({ to, subject, html, text }) {
    const emailTransporter = initTransporter();
    
    if (!emailTransporter) {
        console.log(`[Email] Skipped sending to ${to} (SMTP not configured)`);
        return false;
    }

    try {
        const info = await emailTransporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '') // Strip HTML if no text provided
        });

        console.log(`[Email] Sent to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email] Failed to send to ${to}:`, error.message);
        return false;
    }
}

/**
 * Send custom order confirmation email
 */
export async function sendOrderConfirmation({ to, name, orderId, garmentType }) {
    const subject = `Custom Order Confirmation - Rani's California`;
    const html = `
        <h2>Thank you for your custom order, ${name}!</h2>
        <p>We've received your request for a made-to-measure <strong>${garmentType}</strong>.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p>We'll send you a detailed measurement guide within 24 hours.</p>
        <p>If you have any questions, please email us at hello@raniscalifornia.com</p>
    `;

    return sendEmail({ to, subject, html });
}

/**
 * Send RSVP confirmation email
 */
export async function sendRSVPConfirmation({ to, name, eventTitle, eventDate }) {
    const subject = `RSVP Confirmed - ${eventTitle}`;
    const html = `
        <h2>Your RSVP is confirmed, ${name}!</h2>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
        <p>We look forward to seeing you there!</p>
    `;

    return sendEmail({ to, subject, html });
}

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcome({ to }) {
    const subject = `Welcome to Rani's California Newsletter`;
    const html = `
        <h2>Welcome!</h2>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You'll receive updates about new collections, pop-up events, and stories from our workshop.</p>
    `;

    return sendEmail({ to, subject, html });
}

