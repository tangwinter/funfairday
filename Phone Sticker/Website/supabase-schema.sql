-- FunFairDay Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up all tables

-- ============================================
-- MIGRATIONS (run in order)
-- ============================================

-- 2026-06-08: Add phone-case customization fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_id TEXT REFERENCES phone_models(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS case_style_id TEXT REFERENCES phone_case_styles(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS case_color TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS option_choice TEXT;
-- Index for faster lookups by model
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model_id);

-- ============================================
-- TABLES
-- ============================================

-- Site settings (logo, banner, site name, slogan)
CREATE TABLE IF NOT EXISTS site_settings (
    id BIGSERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
    ('logo_url', '/images/FFD Logo.jpeg'),
    ('banner_url', '/images/FFD banner.jpeg'),
    ('site_name', 'FunFairDay'),
    ('slogan', 'Every day is a little carnival')
ON CONFLICT (key) DO NOTHING;

-- Product categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT,
    long_description TEXT,
    image_url TEXT,
    badge TEXT,
    emoji TEXT
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    stripe_price_id TEXT,
    sort_order INTEGER DEFAULT 0,
    model_id TEXT REFERENCES phone_models(id),
    case_style_id TEXT REFERENCES phone_case_styles(id),
    case_color TEXT,
    option_choice TEXT
);

-- Phone models
CREATE TABLE IF NOT EXISTS phone_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Insert phone models
INSERT INTO phone_models (id, name, display_order) VALUES
    ('iphone-15', 'iPhone 15', 1),
    ('iphone-15-plus', 'iPhone 15 Plus', 2),
    ('iphone-15-pro', 'iPhone 15 Pro', 3),
    ('iphone-15-pro-max', 'iPhone 15 Pro Max', 4),
    ('iphone-16', 'iPhone 16', 5),
    ('iphone-16-plus', 'iPhone 16 Plus', 6),
    ('iphone-16-pro', 'iPhone 16 Pro', 7),
    ('iphone-16-pro-max', 'iPhone 16 Pro Max', 8),
    ('iphone-17', 'iPhone 17', 9),
    ('iphone-17-plus', 'iPhone 17 Plus', 10),
    ('iphone-17-pro', 'iPhone 17 Pro', 11),
    ('iphone-17-pro-max', 'iPhone 17 Pro Max', 12)
ON CONFLICT (id) DO NOTHING;

-- Phone case styles (updated with model_id and image_url)
CREATE TABLE IF NOT EXISTS phone_case_styles (
    id TEXT PRIMARY KEY,
    model_id TEXT REFERENCES phone_models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    colors JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Index for model_id lookup
CREATE INDEX IF NOT EXISTS idx_case_styles_model ON phone_case_styles(model_id);


-- Options (A, B, C)
CREATE TABLE IF NOT EXISTS options (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Which options are available per category
CREATE TABLE IF NOT EXISTS category_options (
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    option_key TEXT NOT NULL REFERENCES options(key) ON DELETE CASCADE,
    PRIMARY KEY (category_id, option_key)
);

-- Customer orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_address JSONB,
    stripe_session_id TEXT,
    shipping_method TEXT DEFAULT '',
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    weight_grams INTEGER DEFAULT 0,
    tracking_number TEXT DEFAULT '',
    tracking_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual order items
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT,
    product_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    case_style TEXT,
    case_color TEXT,
    options_text TEXT
);

-- User roles (admin, customer)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_category_options_category ON category_options(category_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Categories
INSERT INTO categories (id, name, short_name, description, long_description, badge, emoji) VALUES
    ('stickers', 'Carousel''s Sticker Jar', 'Carousel''s Sticker Jar', 'Just the stickers pure joy. 30+ styles of stickers for you. Find the limited editional one.', 'Carousel loves to chase stickers across the floor. Now you can chase your creativity too!', 'Popular', '\u{1F3A0}'),
    ('diy-sticker-case', 'Tilly''s Sticky Carnival Kit', 'Tilly''s Sticky Carnival Kit', 'DIY Sticker Phone Case Set (per-sticked service is available)', 'Tilly is our busy little kitty always making a mess in the cutest way. Let her inspire your own sticky masterpiece!', 'Make to Order', '\u{1F36D}'),
    ('diy-paint-case', 'Pippin''s Paint & Paste Set', 'Pippin''s Paint & Paste Set', 'DIY Hand Paint Phone Case Set', 'Pippin has tiny paws but a big imagination. She paints with her tail but we recommend using the brush.', 'Make to Order', '\u{1F9F8}'),
    ('diy-epoxy-case', 'Dewey''s Dried Flower Magic Kit', 'Dewey''s Dried Flower Magic Kit', 'DIY Epoxy Flower Phone Case Set', 'Dewey loves to nap in the garden. This kit brings that peaceful, dewy feeling to your phone like pressed flowers from a happy day.', 'Make to Order', '\u{1F4A7}')
ON CONFLICT (id) DO NOTHING;

-- Options
INSERT INTO options (key, name, description, price) VALUES
    ('A', 'DIY Kit', 'I do it myself', 0),
    ('B', 'Make to Order', 'You make it for me', 10.00),
    ('C', 'UV Glue Protection', 'Add UV glue + UV light to seal stickers', 5.00)
ON CONFLICT (key) DO NOTHING;

-- Category-Option mappings
INSERT INTO category_options (category_id, option_key) VALUES
    ('diy-sticker-case', 'A'),
    ('diy-sticker-case', 'B'),
    ('diy-sticker-case', 'C'),
    ('diy-paint-case', 'A'),
    ('diy-paint-case', 'B'),
    ('diy-epoxy-case', 'A'),
    ('diy-epoxy-case', 'B')
ON CONFLICT DO NOTHING;

-- Phone case styles
INSERT INTO phone_case_styles (id, name, price, display_order, colors) VALUES
    ('clear-classic', 'Clear Classic', 0, 1, '["Clear","Black","White","Pink","Blue","Purple","Green","Red"]'::jsonb),
    ('glossy', 'Glossy Finish', 2, 2, '["Clear","Black","White","Pink","Blue","Purple","Green","Red"]'::jsonb),
    ('matte', 'Matte Finish', 3, 3, '["Black","White","Pink","Blue","Purple","Green","Red","Gray"]'::jsonb),
    ('glitter', 'Glitter Sparkle', 5, 4, '["Clear","Pink","Gold","Silver","Blue","Purple","Rainbow","Red"]'::jsonb),
    ('marble', 'Marble Swirl', 4, 5, '["White","Pink","Blue","Green","Purple","Gray","Gold","Black"]'::jsonb),
    ('frost', 'Transparent Frost', 2, 6, '["Clear","White","Pink","Blue","Purple","Green","Yellow","Lavender"]'::jsonb),
    ('mirror', 'Mirror Shine', 6, 7, '["Silver","Gold","Rose Gold","Black","Blue","Pink","Purple","Rainbow"]'::jsonb),
    ('gradient', 'Gradient Glow', 5, 8, '["Pink-Purple","Blue-Green","Orange-Yellow","Purple-Blue","Red-Orange","Green-Teal","Pink-Yellow","Blue-Purple"]'::jsonb),
    ('metallic', 'Metallic Edge', 4, 9, '["Gold","Silver","Rose Gold","Black","White","Blue","Pink","Purple"]'::jsonb),
    ('ultra-slim', 'Ultra Slim', 3, 10, '["Clear","Black","White","Pink","Blue","Purple","Green","Red"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE phone_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_case_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access" ON phone_models FOR SELECT USING (true);
CREATE POLICY "Public read access" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON phone_case_styles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON options FOR SELECT USING (true);
CREATE POLICY "Public read access" ON category_options FOR SELECT USING (true);

-- Customers can read their own orders
CREATE POLICY "Customer read own orders" ON orders
    FOR SELECT USING (auth.uid() = customer_id);

-- Customers can read their own order items
CREATE POLICY "Customer read own order items" ON order_items
    FOR SELECT USING (
        order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
    );

-- Admin full access policies
CREATE POLICY "Admin full access" ON site_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admin full access" ON categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admin full access" ON products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admin full access" ON phone_case_styles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admin full access" ON options
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admin full access" ON category_options
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admin full access" ON orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admin full access" ON order_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- AUTO-ASSIGN CUSTOMER ROLE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Trigger to auto-assign customer role on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
