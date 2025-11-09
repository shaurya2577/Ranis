/**
 * Rani's California - Express Server
 * 
 * Production-ready Express server with:
 * - Security middleware (helmet, CORS, rate limiting)
 * - Supabase integration
 * - Modular routes
 * - Static file serving for frontend
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import publicRoutes from './routes/public.js';
import orderRoutes from './routes/orders.js';
import shopRoutes from './routes/shop.js';
import paymentRoutes from './routes/payments.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"]
        }
    }
}));

// CORS configuration
const corsOptions = {
    origin: NODE_ENV === 'development' 
        ? ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']
        : process.env.ALLOWED_ORIGINS?.split(',') || ['https://www.raniscalifornia.com'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

// JSON parser
app.use(express.json({ limit: '10mb' }));

// URL-encoded parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RATE LIMITING
// ============================================

// General API rate limiter: 60 requests per minute
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    message: {
        error: 'Too many requests',
        message: 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter rate limiter for checkout and custom orders: 10 requests per minute
const strictLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        error: 'Too many requests',
        message: 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Request logging middleware (for debugging)
app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.path}`);
    next();
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);
app.use('/api/checkout', strictLimiter);
app.use('/api/custom-orders', strictLimiter);

// ============================================
// API ROUTES
// ============================================

// Health check (before other routes)
app.get('/api/health', (req, res) => {
    console.log('[Server] Health check endpoint hit');
    res.json({
        ok: true,
        time: new Date().toISOString(),
        version: '1.0.0',
        environment: NODE_ENV
    });
});

// Public routes (no auth required)
app.use('/api', publicRoutes);

// Custom orders (multipart/form-data)
app.use('/api', orderRoutes);

// Shop routes (cart - requires auth)
app.use('/api', shopRoutes);

// Payment routes (Stripe stubs)
app.use('/api', paymentRoutes);

// ============================================
// STATIC FILE SERVING
// ============================================

// Serve static files from root (frontend)
// Note: Static middleware runs after route handlers, so API routes will match first
const rootPath = path.resolve(__dirname, '..');

// Serve images (only for /images path)
app.use('/images', express.static(path.join(rootPath, 'images')));

// Serve assets (only for /assets path)
app.use('/assets', express.static(path.join(rootPath, 'assets')));

// Serve other static files (but not index.html yet - that's handled by catch-all)
app.use(express.static(rootPath, {
    index: false, // Don't serve index.html automatically
    extensions: ['js', 'css', 'json', 'svg', 'png', 'jpg', 'webp']
}));

// Catch-all: serve index.html for SPA routing
// Express 5 doesn't support '*' wildcard, so we use a middleware approach
// This must be last, after all routes and static file serving
app.use((req, res, next) => {
    // Skip if response already sent
    if (res.headersSent) {
        return next();
    }

    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'API endpoint not found'
        });
    }

    // For all other routes, serve index.html (SPA routing)
    res.sendFile(path.join(rootPath, 'index.html'), (err) => {
        if (err) {
            console.error('[Server] Error serving index.html:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'Failed to serve page'
                });
            }
        }
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
    console.error('[Server] Error:', err);

    // Don't expose internal errors in production
    const message = NODE_ENV === 'development' 
        ? err.message 
        : 'Internal Server Error';

    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: message
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`[Server] Rani's California backend running on port ${PORT}`);
    console.log(`[Server] Environment: ${NODE_ENV}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Server] Frontend: http://localhost:${PORT}`);
});

export default app;

