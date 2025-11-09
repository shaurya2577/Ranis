/**
 * Custom Orders Routes
 * 
 * Handles made-to-measure custom orders with image uploads
 */

import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { validate, orderSchema } from '../lib/validate.js';
import { uploadMiddleware, validateUploadedFiles } from '../lib/upload.js';
import { sendOrderConfirmation } from '../lib/email.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const router = express.Router();

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'custom-order-images';

/**
 * POST /api/custom-orders
 * Create a custom made-to-measure order with optional image uploads
 * 
 * Accepts multipart/form-data:
 * - name, email, country, garmentType, notes (optional)
 * - measurements (JSON string)
 * - items (JSON string: [{product_id, qty, price_cents_each}])
 * - photos (files[], up to 5 images)
 */
router.post('/custom-orders', uploadMiddleware, async (req, res) => {
    // Honeypot check
    if (req.body._hp && req.body._hp !== '') {
        return res.status(200).json({ ok: true }); // Silent discard
    }

    try {
        // Validate uploaded files
        const fileErrors = validateUploadedFiles(req.files);
        if (fileErrors.length > 0) {
            return res.status(400).json({
                error: 'File validation failed',
                details: fileErrors
            });
        }

        // Parse JSON fields from form data
        let measurements = null;
        let items = null;

        if (req.body.measurements) {
            try {
                measurements = JSON.parse(req.body.measurements);
            } catch (e) {
                return res.status(400).json({
                    error: 'Invalid measurements JSON',
                    message: 'measurements must be valid JSON'
                });
            }
        }

        if (req.body.items) {
            try {
                items = JSON.parse(req.body.items);
            } catch (e) {
                return res.status(400).json({
                    error: 'Invalid items JSON',
                    message: 'items must be valid JSON'
                });
            }
        } else {
            return res.status(400).json({
                error: 'Missing items',
                message: 'At least one item is required'
            });
        }

        // Build order data for validation
        const orderData = {
            name: req.body.name,
            email: req.body.email,
            country: req.body.country,
            garmentType: req.body.garmentType,
            notes: req.body.notes || undefined,
            measurements: measurements || undefined,
            items: items
        };

        // Validate order data
        const validation = validate(orderSchema, orderData);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error
            });
        }

        const validated = validation.data;

        // Create order via RPC function (atomic)
        const { data: orderId, error: rpcError } = await supabaseAdmin.rpc(
            'create_custom_order',
            {
                p_customer_name: validated.name,
                p_customer_email: validated.email,
                p_country: validated.country,
                p_garment_type: validated.garmentType,
                p_measurements: validated.measurements || {},
                p_items: validated.items
            }
        );

        if (rpcError || !orderId) {
            console.error('[Custom Orders] RPC error:', rpcError);
            return res.status(500).json({
                error: 'Failed to create order',
                message: 'Please try again later'
            });
        }

        // Upload images to Supabase Storage
        const uploadedUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    // Generate unique filename
                    const timestamp = Date.now();
                    const random = Math.random().toString(36).substring(2, 15);
                    const extension = file.originalname.split('.').pop() || 'jpg';
                    const filename = `${orderId}/${timestamp}-${random}.${extension}`;

                    // Upload to Supabase Storage
                    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                        .from(STORAGE_BUCKET)
                        .upload(filename, file.buffer, {
                            contentType: file.mimetype,
                            upsert: false
                        });

                    if (uploadError) {
                        console.error('[Custom Orders] Upload error:', uploadError);
                        continue; // Skip this file, continue with others
                    }

                    // Get public URL
                    const { data: urlData } = supabaseAdmin.storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(filename);

                    const publicUrl = urlData.publicUrl;
                    uploadedUrls.push(publicUrl);

                    // Insert into custom_order_images table
                    await supabaseAdmin
                        .from('custom_order_images')
                        .insert({
                            order_id: orderId,
                            image_url: publicUrl,
                            storage_path: filename
                        });
                } catch (fileError) {
                    console.error('[Custom Orders] File processing error:', fileError);
                    // Continue with other files
                }
            }
        }

        // Send confirmation email
        await sendOrderConfirmation({
            to: validated.email,
            name: validated.name,
            orderId,
            garmentType: validated.garmentType
        });

        res.json({
            ok: true,
            order_id: orderId,
            photos: uploadedUrls
        });
    } catch (error) {
        console.error('[Custom Orders] Unexpected error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to process order'
        });
    }
});

export default router;

