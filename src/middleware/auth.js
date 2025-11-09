/**
 * Authentication Middleware
 * 
 * Verifies Supabase JWT tokens from Authorization header
 * Attaches user to req.user if valid
 */

import { supabaseAdmin } from '../lib/supabase.js';

/**
 * Verify Supabase JWT token
 * 
 * @param {string} token - JWT token from Authorization header
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
async function verifyToken(token) {
    try {
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        
        if (error) {
            return { user: null, error };
        }

        return { user: data.user, error: null };
    } catch (error) {
        return { user: null, error };
    }
}

/**
 * Authentication middleware
 * 
 * Expects: Authorization: Bearer <access_token>
 * Sets req.user if token is valid
 * Returns 401 if token is missing or invalid
 */
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header'
        });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    verifyToken(token)
        .then(({ user, error }) => {
            if (error || !user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid or expired token'
                });
            }

            req.user = user;
            next();
        })
        .catch((error) => {
            console.error('[Auth] Error verifying token:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to verify authentication'
            });
        });
}

/**
 * Optional authentication middleware
 * 
 * Sets req.user if token is valid, but doesn't require it
 * Always calls next()
 */
export function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // No auth, continue
    }

    const token = authHeader.substring(7);

    verifyToken(token)
        .then(({ user }) => {
            if (user) {
                req.user = user;
            }
            next();
        })
        .catch(() => {
            next(); // Continue even if token is invalid
        });
}

