/**
 * Shop Routes (Cart Management)
 * 
 * Requires authentication
 * - GET /api/cart - Get user's cart
 * - POST /api/cart - Update user's cart
 */

import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { validate, cartUpsertSchema } from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/cart
 * Get user's shopping cart
 */
router.get('/cart', async (req, res) => {
    try {
        const userId = req.user.id;

        // Get cart (RLS will ensure user can only read their own cart)
        const { data, error } = await supabaseAdmin
            .from('carts')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // Cart doesn't exist yet - return empty cart
            if (error.code === 'PGRST116') {
                return res.json({
                    items: [],
                    updated_at: null
                });
            }

            console.error('[Cart] Error fetching cart:', error);
            return res.status(500).json({
                error: 'Failed to fetch cart',
                message: 'Please try again later'
            });
        }

        res.json({
            items: data.items || [],
            updated_at: data.updated_at
        });
    } catch (error) {
        console.error('[Cart] Unexpected error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch cart'
        });
    }
});

/**
 * POST /api/cart
 * Update user's shopping cart
 * 
 * Body: { items: [{product_id, qty, price_cents_each, color?, size?}] }
 */
router.post('/cart', async (req, res) => {
    // Validate input
    const validation = validate(cartUpsertSchema, req.body);
    if (!validation.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: validation.error
        });
    }

    const { items } = validation.data;
    const userId = req.user.id;

    try {
        // Upsert cart (RLS will ensure user can only update their own cart)
        const { data, error } = await supabaseAdmin
            .from('carts')
            .upsert(
                {
                    user_id: userId,
                    items: items,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id' }
            )
            .select()
            .single();

        if (error) {
            console.error('[Cart] Error updating cart:', error);
            return res.status(500).json({
                error: 'Failed to update cart',
                message: 'Please try again later'
            });
        }

        res.json({
            ok: true,
            items: data.items || [],
            updated_at: data.updated_at
        });
    } catch (error) {
        console.error('[Cart] Unexpected error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update cart'
        });
    }
});

export default router;

