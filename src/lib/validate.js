/**
 * Zod Validation Schemas
 * 
 * Input validation for all API endpoints
 */

import { z } from 'zod';

/**
 * Custom order schema
 */
export const orderSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    email: z.string().email('Invalid email address'),
    country: z.string().min(1, 'Country is required').max(100),
    garmentType: z.enum(['shawl', 'jacket', 'trousers', 'other'], {
        errorMap: () => ({ message: 'Invalid garment type' })
    }),
    notes: z.string().max(2000).optional(),
    measurements: z.object({
        chest_cm: z.number().min(20).max(200).optional(),
        waist_cm: z.number().min(20).max(200).optional(),
        hip_cm: z.number().min(20).max(200).optional(),
        sleeve_cm: z.number().min(15).max(100).optional(),
        length_cm: z.number().min(15).max(200).optional()
    }).optional(),
    items: z.array(z.object({
        product_id: z.string().uuid('Invalid product ID'),
        qty: z.number().int().positive('Quantity must be positive'),
        price_cents_each: z.number().int().positive('Price must be positive')
    })).min(1, 'At least one item is required')
});

/**
 * RSVP schema
 */
export const rsvpSchema = z.object({
    event_id: z.string().min(1, 'Event ID is required'),
    name: z.string().min(1, 'Name is required').max(200),
    email: z.string().email('Invalid email address'),
    guests: z.number().int().positive().max(10, 'Maximum 10 guests').default(1)
});

/**
 * Newsletter subscription schema
 */
export const subscribeSchema = z.object({
    email: z.string().email('Invalid email address')
});

/**
 * Cart upsert schema
 */
export const cartUpsertSchema = z.object({
    items: z.array(z.object({
        product_id: z.string().uuid('Invalid product ID'),
        qty: z.number().int().positive('Quantity must be positive'),
        price_cents_each: z.number().int().positive('Price must be positive'),
        color: z.string().optional(),
        size: z.string().optional()
    })).default([])
});

/**
 * Validate data against schema
 * Returns { success: true, data } or { success: false, error }
 */
export function validate(schema, data) {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => ({
                    path: e.path.join('.'),
                    message: e.message
                }))
            };
        }
        throw error;
    }
}

