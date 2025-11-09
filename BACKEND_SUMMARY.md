# Backend Implementation Summary

## What Was Built

A complete Express.js backend for Rani's California e-commerce site with:

- **Express Server** with security middleware (helmet, CORS, rate limiting)
- **Supabase Integration** for database and storage
- **Modular Route Structure** (`/src/routes/`)
- **Authentication Middleware** (Supabase JWT verification)
- **Input Validation** (Zod schemas)
- **File Upload Handling** (multer for custom order images)
- **Email Service** (nodemailer - optional, no-op if not configured)
- **Payment Stubs** (Stripe - optional, returns 501 if not configured)

## Files Created

### Configuration
- `.env.local.example` - Environment variable template
- `package.json` - Updated with dependencies and scripts
- `.gitignore` - Updated to exclude `.env.local`

### Database
- `sql/backend_schema.sql` - Complete Supabase schema with RLS policies

### Source Code (`/src`)
- `server.js` - Main Express application
- `lib/supabase.js` - Supabase admin client
- `lib/validate.js` - Zod validation schemas
- `lib/upload.js` - Multer configuration for file uploads
- `lib/email.js` - Nodemailer email service
- `middleware/auth.js` - JWT authentication middleware
- `routes/public.js` - Public endpoints (newsletter, RSVP, products, events)
- `routes/orders.js` - Custom orders with image upload
- `routes/shop.js` - Cart management (authenticated)
- `routes/payments.js` - Stripe payment stubs

### Documentation
- `docs/README_BACKEND.md` - Complete backend documentation
- `scripts/dev.http` - HTTP test requests

### Frontend Updates
- `scripts.js` - Updated form handlers to use new API endpoints
- `index.html` - Updated form actions

## API Endpoints

### Public (No Auth)
- `GET /api/health` - Health check
- `POST /api/newsletter` - Newsletter subscription
- `POST /api/events/rsvp` - Event RSVP
- `GET /api/products` - Product catalog
- `GET /api/events` - Events list
- `POST /api/custom-orders` - Custom order with image upload

### Authenticated (Requires JWT)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Update user's cart

### Payments (Optional - Stripe)
- `POST /api/checkout/create-intent` - Create payment intent
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Security Features

- **Rate Limiting**: 60 req/min (general), 10 req/min (checkout/orders)
- **Helmet**: Security headers
- **CORS**: Configured for development and production
- **RLS**: Row Level Security on all Supabase tables
- **JWT Verification**: Supabase token verification
- **Input Validation**: Zod schemas for all endpoints
- **Honeypot**: Spam protection on forms
- **Service Role Key**: Never exposed to client

## Setup Checklist

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Run Supabase Schema
- Open Supabase SQL Editor
- Run `sql/backend_schema.sql`

### 4. Create Storage Bucket
- Create `custom-order-images` bucket in Supabase Storage
- Set to public (or configure RLS)

### 5. Start Server
```bash
npm run dev
```

## Testing

### Quick Test
```bash
# Health check
curl http://localhost:5173/api/health

# Newsletter subscription
curl -X POST http://localhost:5173/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

See `scripts/dev.http` for more test requests.

## Deployment to Vercel

### Steps

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables**:
   - Go to Vercel project dashboard
   - Settings → Environment Variables
   - Add all variables from `.env.local`

4. **No Code Changes Needed**:
   - Frontend uses relative URLs (`/api/...`)
   - Works automatically on same domain

### Environment Variables for Vercel

Required:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `PORT` (optional, defaults to 5173)

Optional:
- `SMTP_*` (for email)
- `STRIPE_SECRET_KEY` (for payments)
- `STRIPE_WEBHOOK_SECRET` (for webhooks)

## Known Limitations / TODOs

1. **Custom Order Form**: Currently uses placeholder product_id. Update `scripts.js` when product selection is added to the form.

2. **Product Catalog**: Frontend still uses `products.json`. Can switch to `/api/products` endpoint when products are in database.

3. **Cart Authentication**: Users need to authenticate via Supabase Auth to use cart endpoints. Frontend cart currently uses localStorage (can be enhanced to sync with backend).

4. **Payment Processing**: Stripe endpoints are stubs. Need to:
   - Implement order creation after successful payment
   - Handle webhook events (payment_intent.succeeded, etc.)
   - Update order status based on payment

5. **Email Templates**: Basic email templates in `lib/email.js`. Can be enhanced with HTML templates.

6. **Admin Endpoints**: Not implemented. Future: `/api/admin/*` routes with role-based access.

7. **Inventory Management**: Products don't have stock tracking yet. Future: Add `stock` column and decrement on order.

8. **Event Capacity**: Events don't check capacity limits. Future: Add `capacity` column and reject RSVPs beyond limit.

## Migration Notes

### From Static to Backend

The frontend was updated to use the new API endpoints:

1. **Newsletter**: Changed from Mailchimp form to JSON API
2. **RSVP**: Changed from FormData to JSON API
3. **Custom Orders**: Enhanced to send measurements and items as JSON strings in multipart form

### Backward Compatibility

- Frontend still works if backend is not running (forms will fail gracefully)
- Products still load from `products.json` (can switch to API later)
- Cart still uses localStorage (can sync with backend when user authenticates)

## Next Steps

1. **Seed Database**: Add products and events to Supabase
2. **Test Endpoints**: Use `scripts/dev.http` to test all endpoints
3. **Configure Email**: Set up SMTP for order confirmations
4. **Configure Stripe**: Add Stripe keys for payment processing
5. **Deploy**: Deploy to Vercel or your preferred platform

## Support

- See `docs/README_BACKEND.md` for detailed documentation
- Check server logs for error messages
- Verify environment variables are set correctly
- Ensure Supabase schema is applied

