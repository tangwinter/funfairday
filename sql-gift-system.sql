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

-- 10 random gift codes for the promotion
-- Old sequential codes (STICKER-FREE-001 etc.) have been replaced with unguessable codes
DELETE FROM free_gift_codes WHERE claimed = false;

INSERT INTO free_gift_codes (code) VALUES
    ('GIFT-A7K2X9'),
    ('GIFT-M4P8Q3'),
    ('GIFT-R5T1W6'),
    ('GIFT-H9J3L0'),
    ('GIFT-C2V7N4'),
    ('GIFT-B6K8X1'),
    ('GIFT-D9F3M5'),
    ('GIFT-P4R7T2'),
    ('GIFT-W1Z6L8'),
    ('GIFT-Q5N9J3')
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
