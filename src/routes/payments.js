/**
 * Payment Routes (Stripe Stubs)
 * 
 * Payment processing endpoints
 * Returns 501 if Stripe is not configured
 */

import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: '.env.local' });

const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Stripe only if configured
let stripe = null;
if (STRIPE_SECRET_KEY) {
    try {
        stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2024-11-20.acacia'
        });
    } catch (error) {
        console.error('[Payments] Failed to initialize Stripe:', error);
    }
}

/**
 * POST /api/checkout/create-intent
 * Create a Stripe PaymentIntent
 * 
 * Body: { items: [{product_id, qty, price_cents_each}], currency?: 'USD' }
 * Returns: { client_secret, payment_intent_id }
 */
router.post('/checkout/create-intent', async (req, res) => {
    if (!stripe) {
        return res.status(501).json({
            error: 'Payments disabled',
            message: 'Stripe is not configured'
        });
    }

    try {
        const { items, currency = 'usd' } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'items array is required'
            });
        }

        // Calculate total in cents
        const totalCents = items.reduce((sum, item) => {
            return sum + (item.qty * item.price_cents_each);
        }, 0);

        if (totalCents <= 0) {
            return res.status(400).json({
                error: 'Invalid amount',
                message: 'Total must be greater than 0'
            });
        }

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalCents,
            currency: currency.toLowerCase(),
            metadata: {
                items: JSON.stringify(items)
            }
        });

        res.json({
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
        });
    } catch (error) {
        console.error('[Payments] Error creating PaymentIntent:', error);
        res.status(500).json({
            error: 'Failed to create payment intent',
            message: error.message || 'Please try again later'
        });
    }
});

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhooks
 * 
 * Verifies webhook signature and processes events
 * Currently a stub - returns 200 OK
 */
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
        return res.status(501).json({
            error: 'Webhooks disabled',
            message: 'Stripe webhooks are not configured'
        });
    }

    const sig = req.headers['stripe-signature'];

    if (!sig) {
        return res.status(400).json({
            error: 'Missing signature',
            message: 'Stripe signature header is required'
        });
    }

    try {
        // Verify webhook signature
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            STRIPE_WEBHOOK_SECRET
        );

        // TODO: Process webhook events
        // - payment_intent.succeeded: Update order status to 'paid'
        // - payment_intent.payment_failed: Update order status to 'failed'
        // - etc.

        console.log('[Payments] Webhook received:', event.type);

        res.json({ received: true });
    } catch (error) {
        console.error('[Payments] Webhook verification error:', error);
        res.status(400).json({
            error: 'Webhook verification failed',
            message: error.message
        });
    }
});

export default router;

