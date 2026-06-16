-- Gift Links System + Category Hide Feature
-- Run this in Supabase SQL Editor

-- ============================================
-- Part 1: free_gift_codes table (for gift links)
-- ============================================
CREATE TABLE IF NOT EXISTS free_gift_codes (
    code TEXT PRIMARY KEY,
    claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMPTZ,
    claimed_session TEXT,
    expires_at TIMESTAMPTZ,
    fulfilled BOOLEAN DEFAULT false
);

-- 10 gift codes for the promotion
INSERT INTO free_gift_codes (code) VALUES
    ('STICKER-FREE-001'),
    ('STICKER-FREE-002'),
    ('STICKER-FREE-003'),
    ('STICKER-FREE-004'),
    ('STICKER-FREE-005'),
    ('STICKER-FREE-006'),
    ('STICKER-FREE-007'),
    ('STICKER-FREE-008'),
    ('STICKER-FREE-009'),
    ('STICKER-FREE-010')
ON CONFLICT (code) DO NOTHING;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gift_codes_claimed ON free_gift_codes(claimed);
CREATE INDEX IF NOT EXISTS idx_gift_codes_expires ON free_gift_codes(expires_at);

-- ============================================
-- Part 2: Products used by the gift + offer system
-- ============================================
INSERT INTO products (id, category_id, name, description, price, sort_order) VALUES
    ('free-sticker-gift', 'stickers', 'Free Random Sticker Gift',
     'Free random sticker gift - claim now!', 0, 0),
    ('bundle-5pcs-stick', 'stickers', '5pcs Stick Bundle Pack',
     'Special offer: 5pcs stick bundle pack (50% off - was US$16, now US$8)', 8, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Part 3: Category hide/show feature
-- ============================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

-- Insert "Free Sticker" category for the gift product
INSERT INTO categories (id, name, short_name, description, long_description, emoji, hidden) VALUES
    ('free-sticker', '🎁 Free Sticker', 'Free Sticker',
     'Claim your free random sticker gift',
     'Free random sticker gift for our valued customers - no purchase necessary!',
     '🎁', false)
ON CONFLICT (id) DO NOTHING;

-- Move the free-sticker-gift product from 'stickers' to 'free-sticker' category
UPDATE products SET category_id = 'free-sticker' WHERE id = 'free-sticker-gift';

-- Update the free sticker product name and description (no image needed, just text)
UPDATE products SET name = 'FREE RANDOM STICKER', description = 'Free random sticker gift - claim now! No purchase necessary!' WHERE id = 'free-sticker-gift';
