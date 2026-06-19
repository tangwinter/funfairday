-- SQL: Shipping system, product weight, order tracking
-- Run this in Supabase SQL Editor

-- Add weight to products (grams, for shipping calculation)
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_grams NUMERIC DEFAULT 50;

-- Add shipping/tracking fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS weight_grams NUMERIC DEFAULT 0;
