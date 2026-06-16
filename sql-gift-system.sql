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
    ('GIFT-xK9mP2qR8z'),
    ('GIFT-A3bN7vW5cY'),
    ('GIFT-L4pQ6rT2sU'),
    ('GIFT-M8dF1hJ3kG'),
    ('GIFT-R5eX7wZ9aV'),
    ('GIFT-B2nM4lC6tH'),
    ('GIFT-D9yU1iO3pL'),
    ('GIFT-P7sE5jK8qW'),
    ('GIFT-W6gH0zR2vX'),
    ('GIFT-Q1mC8nF3bD')
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

-- Delete the Free Sticker category (gift links work directly without it)
DELETE FROM categories WHERE id = 'free-sticker';

-- Update the free sticker product name and description (no image needed, just text)
UPDATE products SET name = 'FREE RANDOM STICKER', description = 'Free random sticker gift - claim now! No purchase necessary!' WHERE id = 'free-sticker-gift';
