-- FunFairDay Shipping Addresses Table
-- Run this in the Supabase SQL Editor

-- ============================================
-- SHIPPING ADDRESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT DEFAULT '',
    zip TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    country TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Users can read their own address
CREATE POLICY "User read own address" ON shipping_addresses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own address
CREATE POLICY "User insert own address" ON shipping_addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own address
CREATE POLICY "User update own address" ON shipping_addresses
    FOR UPDATE USING (auth.uid() = user_id);
