/**
 * Public API Routes
 * 
 * No authentication required
 * - Newsletter subscription
 * - Event RSVP
 * - Product catalog
 * - Events list
 */

import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { validate, subscribeSchema, rsvpSchema } from '../lib/validate.js';
import { sendNewsletterWelcome, sendRSVPConfirmation } from '../lib/email.js';

const router = express.Router();

/**
 * POST /api/newsletter
 * Subscribe to newsletter
 */
router.post('/newsletter', async (req, res) => {
    // Honeypot check
    if (req.body._hp && req.body._hp !== '') {
        return res.status(200).json({ ok: true }); // Silent discard
    }

    // Validate input
    const validation = validate(subscribeSchema, req.body);
    if (!validation.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: validation.error
        });
    }

    const { email } = validation.data;

    try {
        // Insert subscriber (upsert to handle duplicates)
        const { data, error } = await supabaseAdmin
            .from('newsletter_subscribers')
            .upsert(
                { email, subscribed_at: new Date().toISOString() },
                { onConflict: 'email' }
            )
            .select()
            .single();

        if (error) {
            console.error('[Newsletter] Error inserting subscriber:', error);
            return res.status(500).json({
                error: 'Failed to subscribe',
                message: 'Please try again later'
            });
        }

        // Send welcome email (no-op if SMTP not configured)
        await sendNewsletterWelcome({ to: email });

        res.json({ ok: true, id: data.id });
    } catch (error) {
        console.error('[Newsletter] Unexpected error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to process subscription'
        });
    }
});

/**
 * POST /api/events/rsvp
 * RSVP to an event
 */
router.post('/events/rsvp', async (req, res) => {
    // Honeypot check
    if (req.body._hp && req.body._hp !== '') {
        return res.status(200).json({ ok: true }); // Silent discard
    }

    // Validate input
    const validation = validate(rsvpSchema, req.body);
    if (!validation.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: validation.error
        });
    }

    const { event_id, name, email, guests } = validation.data;

    try {
        // Verify event exists
        const { data: event, error: eventError } = await supabaseAdmin
            .from('events')
            .select('id, title, event_date')
            .eq('event_id', event_id)
            .single();

        if (eventError || !event) {
            return res.status(404).json({
                error: 'Event not found',
                message: 'Invalid event ID'
            });
        }

        // TODO: Check capacity if events.capacity is set
        // For now, allow unlimited RSVPs

        // Insert RSVP
        const { data, error } = await supabaseAdmin
            .from('event_rsvps')
            .insert({
                event_id,
                name,
                email,
                guests
            })
            .select()
            .single();

        if (error) {
            console.error('[RSVP] Error inserting RSVP:', error);
            return res.status(500).json({
                error: 'Failed to RSVP',
                message: 'Please try again later'
            });
        }

        // Send confirmation email
        await sendRSVPConfirmation({
            to: email,
            name,
            eventTitle: event.title,
            eventDate: event.event_date
        });

        res.json({ ok: true, id: data.id });
    } catch (error) {
        console.error('[RSVP] Unexpected error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to process RSVP'
        });
    }
});

/**
 * GET /api/products
 * Get product catalog (public read)
 */
router.get('/products', async (req, res) => {
    try {
        // Get products with images
        const { data: products, error: productsError } = await supabaseAdmin
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (productsError) {
            console.error('[Products] Error fetching products:', productsError);
            return res.status(500).json({
                error: 'Failed to fetch products',
                message: 'Please try again later'
            });
        }

        // Get images for each product
        const { data: images, error: imagesError } = await supabaseAdmin
            .from('product_images')
            .select('*')
            .order('display_order', { ascending: true });

        if (imagesError) {
            console.error('[Products] Error fetching images:', imagesError);
            // Continue without images
        }

        // Attach images to products
        const productsWithImages = (products || []).map(product => ({
            ...product,
            images: (images || []).filter(img => img.product_id === product.id)
        }));

        res.json(productsWithImages);
    } catch (error) {
        console.error('[Products] Unexpected error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch products'
        });
    }
});

/**
 * GET /api/events
 * Get list of events (public read)
 */
router.get('/events', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .order('event_date', { ascending: true });

        if (error) {
            console.error('[Events] Error fetching events:', error);
            return res.status(500).json({
                error: 'Failed to fetch events',
                message: 'Please try again later'
            });
        }

        res.json(data || []);
    } catch (error) {
        console.error('[Events] Unexpected error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch events'
        });
    }
});

export default router;

