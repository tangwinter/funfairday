-- Merge "Solid Color" into "Solid Color Frame" for all affected models
-- The "Solid Color" and "Solid Color Frame" should be one style called "Solid Color Frame"
-- Run this in Supabase SQL Editor

-- iPhone 15: add Green, Pink to Solid Color Frame
UPDATE phone_case_styles
SET colors = colors || '[{"label":"Green","type":"photo","value":"/images/Phone Case Style/Iphone 15/Solid Color/Green.jpeg"},{"label":"Pink","type":"photo","value":"/images/Phone Case Style/Iphone 15/Solid Color/Pink.jpeg"}]'::jsonb,
    display_order = 1
WHERE id = 'iphone-15-solid-color-frame';

DELETE FROM phone_case_styles WHERE id = 'iphone-15-solid-color';

-- iPhone 15 Plus: add Green, Pink to Solid Color Frame
UPDATE phone_case_styles
SET colors = colors || '[{"label":"Green","type":"photo","value":"/images/Phone Case Style/Iphone 15plus/Solid Color/Green.jpeg"},{"label":"Pink","type":"photo","value":"/images/Phone Case Style/Iphone 15plus/Solid Color/Pink.jpeg"}]'::jsonb,
    display_order = 2
WHERE id = 'iphone-15-plus-solid-color-frame';

DELETE FROM phone_case_styles WHERE id = 'iphone-15-plus-solid-color';

-- iPhone 15 Pro: add Green, Pink to Solid Color Frame
UPDATE phone_case_styles
SET colors = colors || '[{"label":"Green","type":"photo","value":"/images/Phone Case Style/Iphone 15pro/Solid Color/Green.jpeg"},{"label":"Pink","type":"photo","value":"/images/Phone Case Style/Iphone 15pro/Solid Color/Pink.jpeg"}]'::jsonb,
    display_order = 3
WHERE id = 'iphone-15-pro-solid-color-frame';

DELETE FROM phone_case_styles WHERE id = 'iphone-15-pro-solid-color';

-- iPhone 15 Pro Max: add Green, Pink to Solid Color Frame
UPDATE phone_case_styles
SET colors = colors || '[{"label":"Green","type":"photo","value":"/images/Phone Case Style/Iphone 15 promax/Solid Color/Green.jpeg"},{"label":"Pink","type":"photo","value":"/images/Phone Case Style/Iphone 15 promax/Solid Color/Pink.jpeg"}]'::jsonb,
    display_order = 4
WHERE id = 'iphone-15-pro-max-solid-color-frame';

DELETE FROM phone_case_styles WHERE id = 'iphone-15-pro-max-solid-color';

-- iPhone 16 Plus: add Green, Pink to Solid Color Frame
UPDATE phone_case_styles
SET colors = colors || '[{"label":"Green","type":"photo","value":"/images/Phone Case Style/Iphone 16plus/Solid Color/Green.jpeg"},{"label":"Pink","type":"photo","value":"/images/Phone Case Style/Iphone 16plus/Solid Color/Pink.jpeg"}]'::jsonb,
    display_order = 5
WHERE id = 'iphone-16-plus-solid-color-frame';

DELETE FROM phone_case_styles WHERE id = 'iphone-16-plus-solid-color';

-- iPhone 16 Pro: add Green, Pink to Solid Color Frame
UPDATE phone_case_styles
SET colors = colors || '[{"label":"Green","type":"photo","value":"/images/Phone Case Style/Iphone 16pro/Solid Color/Green.jpeg"},{"label":"Pink","type":"photo","value":"/images/Phone Case Style/Iphone 16pro/Solid Color/Pink.jpeg"}]'::jsonb,
    display_order = 6
WHERE id = 'iphone-16-pro-solid-color-frame';

DELETE FROM phone_case_styles WHERE id = 'iphone-16-pro-solid-color';

-- iPhone 16 Pro Max: add Green, Pink to Solid Color Frame
UPDATE phone_case_styles
SET colors = colors || '[{"label":"Green","type":"photo","value":"/images/Phone Case Style/Iphone 16 Promax/Solid Color/Green.jpeg"},{"label":"Pink","type":"photo","value":"/images/Phone Case Style/Iphone 16 Promax/Solid Color/Pink.jpeg"}]'::jsonb,
    display_order = 7
WHERE id = 'iphone-16-pro-max-solid-color-frame';

DELETE FROM phone_case_styles WHERE id = 'iphone-16-pro-max-solid-color';
