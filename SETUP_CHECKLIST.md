# Backend Setup Checklist

## ✅ Completed

- [x] Backend code structure created
- [x] Dependencies installed
- [x] Environment template created
- [x] Frontend updated to use new API endpoints
- [x] Documentation created

## ⚠️ Required: Supabase Setup

### 1. Database Schema

**Action**: Run SQL schema in Supabase

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `sql/backend_schema.sql`
4. Copy and paste the entire SQL file
5. Click **Run** to execute

**Expected Result**: 
- Tables created: `products`, `product_images`, `events`, `newsletter_subscribers`, `event_rsvps`, `orders`, `order_items`, `custom_order_measurements`, `custom_order_images`, `carts`
- RLS policies enabled
- RPC function `create_custom_order` created

### 2. Storage Bucket

**Action**: Create storage bucket for custom order images

1. Navigate to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `custom-order-images`
4. Set to **Public** (or configure RLS policies)
5. Click **Create bucket**

**Expected Result**: Bucket `custom-order-images` exists and is accessible

### 3. Environment Variables

**Action**: Configure `.env.local` file

1. Copy `.env.local.example` to `.env.local`
2. Fill in Supabase credentials:
   - `SUPABASE_URL` - From Supabase dashboard → Settings → API → Project URL
   - `SUPABASE_ANON_KEY` - From Supabase dashboard → Settings → API → anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` - From Supabase dashboard → Settings → API → service_role key
   - `SUPABASE_STORAGE_BUCKET` - Set to `custom-order-images`
   - `PORT` - Set to `5173` (or your preferred port)

**Expected Result**: `.env.local` file exists with all required variables

## 🔧 Optional: Additional Configuration

### Email (Optional)

If you want email notifications:

1. Set up SMTP credentials in `.env.local`:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`

**Note**: If not configured, email functions will be no-ops (no errors, just no emails sent)

### Stripe (Optional)

If you want payment processing:

1. Get Stripe API keys from Stripe dashboard
2. Add to `.env.local`:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

**Note**: If not configured, payment endpoints return `501` (not implemented)

## 🧪 Testing

### 1. Start Server

```bash
npm run dev
```

**Expected**: Server starts on `http://localhost:5173`

### 2. Test Health Endpoint

```bash
curl http://localhost:5173/api/health
```

**Expected Response**:
```json
{
  "ok": true,
  "time": "2025-01-15T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### 3. Test Newsletter Subscription

```bash
curl -X POST http://localhost:5173/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response**:
```json
{
  "ok": true,
  "id": "uuid-here"
}
```

**Check**: Row appears in `newsletter_subscribers` table in Supabase

### 4. Test Products Endpoint

```bash
curl http://localhost:5173/api/products
```

**Expected Response**: `[]` (empty array if no products) or array of products

### 5. Test Custom Order (with file upload)

Use a tool like Postman or curl with file upload support:

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

**Expected Response**:
```json
{
  "ok": true,
  "order_id": "uuid-here",
  "photos": ["https://..."]
}
```

**Check**: 
- Row appears in `orders` table
- Row appears in `order_items` table
- Row appears in `custom_order_measurements` table
- Image uploaded to Supabase Storage bucket
- Row appears in `custom_order_images` table

## 🚨 Common Issues

### "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"

**Solution**: Check `.env.local` file exists and contains all required variables

### "RLS policy violation"

**Solution**: Ensure SQL schema was run correctly in Supabase

### "Storage bucket not found"

**Solution**: Create `custom-order-images` bucket in Supabase Storage

### "Cannot find module"

**Solution**: Run `npm install` to install dependencies

### Server won't start

**Solution**: 
1. Check Node.js version (requires 18+)
2. Check `.env.local` file exists
3. Check port 5173 is not in use
4. Check server logs for error messages

## 📝 Next Steps After Setup

1. **Seed Database**: Add products and events to Supabase
2. **Test All Endpoints**: Use `scripts/dev.http` for testing
3. **Configure Email**: Set up SMTP if you want email notifications
4. **Configure Stripe**: Add Stripe keys if you want payment processing
5. **Deploy**: Deploy to Vercel or your preferred platform

## 📚 Documentation

- **Backend Docs**: `docs/README_BACKEND.md`
- **Summary**: `BACKEND_SUMMARY.md`
- **Test Requests**: `scripts/dev.http`

