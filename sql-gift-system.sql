-- Gift Links System
-- Run this in Supabase SQL Editor

-- Track one-time gift claims with 30min hold
CREATE TABLE IF NOT EXISTS free_gift_codes (
    code TEXT PRIMARY KEY,
    claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMPTZ,
    claimed_session TEXT,
    expires_at TIMESTAMPTZ,
    fulfilled BOOLEAN DEFAULT false
);

-- Gift codes for the promotion
INSERT INTO free_gift_codes (code) VALUES
    ('STICKER-FREE-001'),
    ('STICKER-FREE-002'),
    ('STICKER-FREE-003'),
    ('STICKER-FREE-004'),
    ('STICKER-FREE-005')
ON CONFLICT (code) DO NOTHING;

-- Products used by the gift + offer system
INSERT INTO products (id, category_id, name, description, price, sort_order) VALUES
    ('free-sticker-gift', 'stickers', 'Free Random Sticker Gift',
     'Free random sticker gift - claim now!', 0, 0),
    ('bundle-5pcs-stick', 'stickers', '5pcs Stick Bundle Pack',
     'Special offer: 5pcs stick bundle pack (50% off - was US$16, now US$8)', 8, 0)
ON CONFLICT (id) DO NOTHING;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gift_codes_claimed ON free_gift_codes(claimed);
CREATE INDEX IF NOT EXISTS idx_gift_codes_expires ON free_gift_codes(expires_at);
