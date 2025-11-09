-- ============================================
-- RANI'S CALIFORNIA - BACKEND SCHEMA
-- Supabase Database Schema with RLS Policies
-- ============================================
-- Run this in your Supabase SQL Editor
-- All statements are idempotent (safe to re-run)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS & IMAGES (Public Read)
-- ============================================

-- Products table (assumes already exists, but ensure structure)
-- If not exists, create:
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    material TEXT,
    care_instructions TEXT,
    collection TEXT NOT NULL,
    made_to_measure BOOLEAN DEFAULT false,
    lead_time_days INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product images (assumes already exists)
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    alt_text TEXT,
    view_type TEXT, -- 'model', 'flatlay', 'detail'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EVENTS (Public Read)
-- ============================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL, -- e.g., 'sf-holiday'
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    capacity INTEGER, -- NULL = unlimited
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- NEWSLETTER SUBSCRIBERS (Public Insert)
-- ============================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    unsubscribed_at TIMESTAMPTZ,
    source TEXT, -- 'website', 'event', etc.
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EVENT RSVPs (Public Insert, No Public Select)
-- ============================================

CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    guests INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT valid_guests CHECK (guests > 0 AND guests <= 10)
);

-- ============================================
-- ORDERS & CUSTOM ORDERS (Authenticated/Admin Only)
-- ============================================

-- Main orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    country TEXT NOT NULL,
    shipping_address JSONB,
    total_amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'
    payment_intent_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_sku TEXT, -- denormalized for history
    product_title TEXT, -- denormalized
    quantity INTEGER NOT NULL,
    price_cents_each INTEGER NOT NULL,
    made_to_measure BOOLEAN DEFAULT false,
    selected_color TEXT,
    selected_size TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Custom order measurements
CREATE TABLE IF NOT EXISTS custom_order_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    garment_type TEXT NOT NULL,
    measurements JSONB NOT NULL, -- {chest_cm, waist_cm, hip_cm, sleeve_cm, length_cm}
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Custom order images (uploaded reference photos)
CREATE TABLE IF NOT EXISTS custom_order_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT, -- path in Supabase Storage
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- USER CARTS (Authenticated Users Only)
-- ============================================

CREATE TABLE IF NOT EXISTS carts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb, -- [{product_id, qty, price_cents_each, color?, size?}]
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_order_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_order_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Products: Public read
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

-- Product images: Public read
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;
CREATE POLICY "Product images are viewable by everyone" ON product_images
    FOR SELECT USING (true);

-- Events: Public read
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

-- Newsletter subscribers: Anyone can insert, no public select
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- No public select on subscribers (admin only via service role)

-- Event RSVPs: Anyone can insert, no public select
DROP POLICY IF EXISTS "Anyone can RSVP" ON event_rsvps;
CREATE POLICY "Anyone can RSVP" ON event_rsvps
    FOR INSERT WITH CHECK (true);

-- No public select on RSVPs (admin only via service role)

-- Orders: No public access (admin/service role only)
-- Users can view their own orders via authenticated endpoints

-- Order items: No public access

-- Custom order measurements: No public access

-- Custom order images: No public access

-- Carts: Users can only read/update their own cart
DROP POLICY IF EXISTS "Users can view their own cart" ON carts;
CREATE POLICY "Users can view their own cart" ON carts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cart" ON carts;
CREATE POLICY "Users can update their own cart" ON carts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cart" ON carts;
CREATE POLICY "Users can insert their own cart" ON carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RPC FUNCTION: create_custom_order
-- ============================================
-- Atomic function to create order + items + measurements in one transaction

CREATE OR REPLACE FUNCTION create_custom_order(
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_country TEXT,
    p_garment_type TEXT,
    p_measurements JSONB,
    p_items JSONB -- [{product_id, qty, price_cents_each}]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_total_cents INTEGER := 0;
    v_item JSONB;
BEGIN
    -- Calculate total from items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_total_cents := v_total_cents + ((v_item->>'qty')::INTEGER * (v_item->>'price_cents_each')::INTEGER);
    END LOOP;

    -- Create order
    INSERT INTO orders (
        customer_name,
        customer_email,
        country,
        total_amount_cents,
        status
    ) VALUES (
        p_customer_name,
        p_customer_email,
        p_country,
        v_total_cents,
        'pending'
    ) RETURNING id INTO v_order_id;

    -- Insert order items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            price_cents_each,
            made_to_measure
        ) VALUES (
            v_order_id,
            (v_item->>'product_id')::UUID,
            (v_item->>'qty')::INTEGER,
            (v_item->>'price_cents_each')::INTEGER,
            true
        );
    END LOOP;

    -- Insert measurements
    INSERT INTO custom_order_measurements (
        order_id,
        garment_type,
        measurements
    ) VALUES (
        v_order_id,
        p_garment_type,
        p_measurements
    );

    RETURN v_order_id;
END;
$$;

-- Grant execute to anon (for public API)
GRANT EXECUTE ON FUNCTION create_custom_order TO anon;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_custom_order_images_order_id ON custom_order_images(order_id);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE products IS 'Product catalog - public read access';
COMMENT ON TABLE orders IS 'Customer orders - admin/service role access only';
COMMENT ON TABLE carts IS 'User shopping carts - RLS protected by user_id';
COMMENT ON TABLE custom_order_images IS 'Reference photos uploaded for custom orders';
COMMENT ON FUNCTION create_custom_order IS 'Atomic RPC to create custom order with items and measurements';

