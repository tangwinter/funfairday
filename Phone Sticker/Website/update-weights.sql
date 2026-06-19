-- Update product weights (run in Supabase SQL Editor)
-- Based on: sticker=150g, phone case=250g, glue=500g, flower set=250g, paint set=400g

-- Stickers (all 150g each)
UPDATE products SET weight_grams = 150 WHERE category_id = 'stickers';

-- DIY Sticker Case
UPDATE products SET weight_grams = 250 WHERE id = 'diy-sticker-case-1';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-sticker-case-2';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-sticker-case-3';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-sticker-case-4';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-sticker-case-5';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-sticker-case-6';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-sticker-case-7';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-sticker-case-8';
UPDATE products SET weight_grams = 500 WHERE id = 'diy-sticker-case-9';   -- UV Glue Protection Kit
UPDATE products SET weight_grams = 750 WHERE id = 'diy-sticker-case-10';  -- Deluxe Kit (full bundle)
UPDATE products SET weight_grams = 150 WHERE id = 'diy-sticker-case-11';  -- Mini Sticker Add-On Pack
UPDATE products SET weight_grams = 250 WHERE id = 'diy-sticker-case-12';  -- Limited Edition

-- DIY Paint Case
UPDATE products SET weight_grams = 400 WHERE id = 'diy-paint-case-1';
UPDATE products SET weight_grams = 400 WHERE id = 'diy-paint-case-2';
UPDATE products SET weight_grams = 400 WHERE id = 'diy-paint-case-3';
UPDATE products SET weight_grams = 400 WHERE id = 'diy-paint-case-4';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-paint-case-5';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-paint-case-6';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-paint-case-7';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-paint-case-8';
UPDATE products SET weight_grams = 200 WHERE id = 'diy-paint-case-9';   -- Paint Brush Set
UPDATE products SET weight_grams = 500 WHERE id = 'diy-paint-case-10';  -- Deluxe Paint Kit
UPDATE products SET weight_grams = 200 WHERE id = 'diy-paint-case-11';  -- Sealant Spray
UPDATE products SET weight_grams = 250 WHERE id = 'diy-paint-case-12';  -- Limited Edition

-- DIY Epoxy Case
UPDATE products SET weight_grams = 500 WHERE id = 'diy-epoxy-case-1';
UPDATE products SET weight_grams = 500 WHERE id = 'diy-epoxy-case-2';
UPDATE products SET weight_grams = 500 WHERE id = 'diy-epoxy-case-3';
UPDATE products SET weight_grams = 500 WHERE id = 'diy-epoxy-case-4';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-epoxy-case-5';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-epoxy-case-6';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-epoxy-case-7';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-epoxy-case-8';
UPDATE products SET weight_grams = 250 WHERE id = 'diy-epoxy-case-9';   -- Extra Flower Pack (just flowers)
UPDATE products SET weight_grams = 500 WHERE id = 'diy-epoxy-case-10';  -- Epoxy Resin Refill
UPDATE products SET weight_grams = 750 WHERE id = 'diy-epoxy-case-11';  -- Deluxe Flower Kit (full bundle)
UPDATE products SET weight_grams = 250 WHERE id = 'diy-epoxy-case-12';  -- Limited Edition

-- Bundle product
UPDATE products SET weight_grams = 150 WHERE id = 'bundle-5pcs-stick';

-- Free sticker gift
UPDATE products SET weight_grams = 50 WHERE id = 'free-sticker-gift';
