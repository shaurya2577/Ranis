# Rani's California - Backend Documentation

Complete backend API documentation for the Rani's California e-commerce site.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Supabase Setup](#supabase-setup)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase project created
- `.env.local` file configured (see [Environment Setup](#environment-setup))

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5173` (or the port specified in `.env.local`).

### Run Production Server

```bash
npm start
```

## Environment Setup

### 1. Copy Environment Template

```bash
cp .env.local.example .env.local
```

### 2. Configure `.env.local` File

Required variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_STORAGE_BUCKET=custom-order-images

# Server Configuration
PORT=5173
NODE_ENV=development
```

Optional variables (for email and payments):

```env
# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@raniscalifornia.com

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: Never expose the `SUPABASE_SERVICE_ROLE_KEY` in client-side code. It bypasses RLS and should only be used server-side.

## Supabase Setup

### 1. Run Database Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `sql/backend_schema.sql`
4. Copy and paste the entire SQL file
5. Click **Run** to execute

This will create:
- Tables: `products`, `product_images`, `events`, `newsletter_subscribers`, `event_rsvps`, `orders`, `order_items`, `custom_order_measurements`, `custom_order_images`, `carts`
- RLS policies for security
- RPC function: `create_custom_order`

### 2. Create Storage Bucket

1. Navigate to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `custom-order-images`
4. Set to **Public** (or configure RLS policies for authenticated access)
5. Click **Create bucket**

### 3. Seed Initial Data (Optional)

You can manually insert products and events via the Supabase dashboard, or use the SQL editor:

```sql
-- Example: Insert a product
INSERT INTO products (sku, title, description, price, collection, made_to_measure)
VALUES ('RAN-A12-IND', 'Indigo Block-Print Shawl', 'Hand-loomed cotton shawl...', 185.00, 'shawls', false);

-- Example: Insert an event
INSERT INTO events (event_id, title, description, location, event_date)
VALUES ('sf-holiday', 'Holiday Trunk Show', 'Browse our holiday collection...', 'San Francisco, CA', '2025-12-15T18:00:00Z');
```

## API Endpoints

### Health Check

```
GET /api/health
```

Returns server status and version.

**Response:**
```json
{
  "ok": true,
  "time": "2025-01-15T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### Public Endpoints (No Auth Required)

#### Newsletter Subscription

```
POST /api/newsletter
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "ok": true,
  "id": "uuid-here"
}
```

#### Event RSVP

```
POST /api/events/rsvp
Content-Type: application/json

{
  "event_id": "sf-holiday",
  "name": "John Doe",
  "email": "john@example.com",
  "guests": 2
}
```

**Response:**
```json
{
  "ok": true,
  "id": "uuid-here"
}
```

#### Get Products

```
GET /api/products
```

**Response:**
```json
[
  {
    "id": "uuid",
    "sku": "RAN-A12-IND",
    "title": "Indigo Block-Print Shawl",
    "price": 185.00,
    "images": [...]
  }
]
```

#### Get Events

```
GET /api/events
```

**Response:**
```json
[
  {
    "id": "uuid",
    "event_id": "sf-holiday",
    "title": "Holiday Trunk Show",
    "location": "San Francisco, CA",
    "event_date": "2025-12-15T18:00:00Z"
  }
]
```

### Custom Orders (No Auth Required)

#### Create Custom Order

```
POST /api/custom-orders
Content-Type: multipart/form-data

Fields:
- name: string
- email: string
- country: string
- garmentType: "shawl" | "jacket" | "trousers" | "other"
- notes: string (optional)
- measurements: JSON string (optional)
- items: JSON string (required)
- photos: File[] (optional, up to 5 images)

Example measurements JSON:
{
  "chest_cm": 100,
  "waist_cm": 85,
  "hip_cm": 95,
  "sleeve_cm": 60,
  "length_cm": 70
}

Example items JSON:
[
  {
    "product_id": "uuid",
    "qty": 1,
    "price_cents_each": 18500
  }
]
```

**Response:**
```json
{
  "ok": true,
  "order_id": "uuid",
  "photos": ["https://...", "https://..."]
}
```

### Authenticated Endpoints (Requires JWT)

#### Get Cart

```
GET /api/cart
Authorization: Bearer <supabase_access_token>
```

**Response:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "qty": 1,
      "price_cents_each": 18500,
      "color": "Indigo",
      "size": "M"
    }
  ],
  "updated_at": "2025-01-15T10:00:00.000Z"
}
```

#### Update Cart

```
POST /api/cart
Authorization: Bearer <supabase_access_token>
Content-Type: application/json

{
  "items": [
    {
      "product_id": "uuid",
      "qty": 2,
      "price_cents_each": 18500,
      "color": "Indigo",
      "size": "M"
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "items": [...],
  "updated_at": "2025-01-15T10:00:00.000Z"
}
```

### Payment Endpoints (Stripe - Optional)

#### Create Payment Intent

```
POST /api/checkout/create-intent
Content-Type: application/json

{
  "items": [
    {
      "product_id": "uuid",
      "qty": 1,
      "price_cents_each": 18500
    }
  ],
  "currency": "usd"
}
```

**Response:**
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

**Note**: Returns `501` if Stripe is not configured.

#### Stripe Webhook

```
POST /api/webhooks/stripe
Stripe-Signature: <signature>
Content-Type: application/json

<raw webhook payload>
```

**Note**: Currently a stub. Returns `501` if Stripe is not configured.

## Testing

### Using curl

See `scripts/dev.http` for ready-to-use HTTP requests.

### Example: Newsletter Subscription

```bash
curl -X POST http://localhost:5173/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Example: Custom Order (with file upload)

```bash
curl -X POST http://localhost:5173/api/custom-orders \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "country=USA" \
  -F "garmentType=jacket" \
  -F "measurements={\"chest_cm\":100,\"waist_cm\":85}" \
  -F "items=[{\"product_id\":\"00000000-0000-0000-0000-000000000000\",\"qty\":1,\"price_cents_each\":42000}]" \
  -F "photos=@/path/to/image.jpg"
```

### Example: Get Cart (with auth)

```bash
# First, get a Supabase access token (via Supabase Auth)
# Then:
curl -X GET http://localhost:5173/api/cart \
  -H "Authorization: Bearer <your_access_token>"
```

## Deployment

### Vercel Deployment

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
   - Navigate to **Settings** → **Environment Variables**
   - Add all variables from `.env.local`

4. **Update API URLs** (if needed):
   - The frontend uses relative URLs (`/api/...`)
   - No changes needed if deploying to same domain

### Other Platforms

The backend is a standard Express app and can be deployed to:
- Railway
- Render
- Fly.io
- AWS Elastic Beanstalk
- Google Cloud Run
- Any Node.js hosting platform

**Important**: Ensure environment variables are set in your hosting platform.

## Security

### Rate Limiting

- General API: 60 requests/minute
- Checkout/Custom Orders: 10 requests/minute

### CORS

- Development: Allows `localhost:5173`, `localhost:3000`
- Production: Configure `ALLOWED_ORIGINS` in environment

### Authentication

- Uses Supabase JWT tokens
- Tokens verified via `Authorization: Bearer <token>` header
- Service role key never exposed to client

### Row Level Security (RLS)

- All tables have RLS enabled
- Public read: `products`, `product_images`, `events`
- Public insert: `newsletter_subscribers`, `event_rsvps`
- Authenticated only: `carts` (users can only access their own)
- Admin only: `orders`, `order_items`, `custom_order_*`

### Honeypot

Forms include a hidden `_hp` field. If filled, the request is silently discarded (spam protection).

## Troubleshooting

### "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"

- Ensure `.env.local` exists and contains all required variables
- Check that variable names match exactly (case-sensitive)

### "RLS policy violation"

- Check that RLS policies are correctly set up in Supabase
- Verify user authentication for protected endpoints

### "Storage bucket not found"

- Create the `custom-order-images` bucket in Supabase Storage
- Ensure bucket is public or RLS policies allow access

### Email not sending

- Email functions are no-ops if SMTP is not configured
- Check console logs for email status
- Configure SMTP variables in `.env.local` to enable email

### Stripe endpoints return 501

- This is expected if `STRIPE_SECRET_KEY` is not set
- Configure Stripe variables to enable payment processing

## Rotating Keys

### Supabase Keys

1. Go to Supabase dashboard → **Settings** → **API**
2. Click **Reset** next to the key you want to rotate
3. Update `.env.local` with the new key
4. Restart the server

### Stripe Keys

1. Go to Stripe dashboard → **Developers** → **API keys**
2. Create a new secret key
3. Update `STRIPE_SECRET_KEY` in `.env.local`
4. Restart the server

## Support

For issues or questions:
- Check the [Supabase documentation](https://supabase.com/docs)
- Review server logs for error messages
- Ensure all environment variables are set correctly

