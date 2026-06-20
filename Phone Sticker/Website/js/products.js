// Product Data Configuration
const CONFIG = {
    stripeReady: true,
    currency: 'usd',
    successUrl: window.location.origin + '/success.html',
    cancelUrl: window.location.origin + '/'
};

const categories = [
    {
        id: 'stickers',
        name: "Carousel's Sticker Jar",
        shortName: "Carousel's Sticker Jar",
        description: 'Just the stickers pure joy. 30+ styles of stickers for you. Find the limited editional one.',
        longDescription: "Carousel loves to chase stickers across the floor. Now you can chase your creativity too!",
        image: null,
        badge: 'Popular',
        emoji: '\u{1F3A0}'
    }
];

const productTemplates = {
    'stickers': {
        priceBase: 5.00,
        items: [
            { name: 'Carousel Dreams Sticker', desc: 'A whimsical carousel horse sticker with rainbow ribbons.' },
            { name: 'Carnival Stripes Sticker', desc: 'Classic red and white carnival tent stripes.' },
            { name: 'Cotton Candy Cloud Sticker', desc: 'Fluffy pink cotton candy with sparkles.' },
            { name: 'Ferris Wheel Glow Sticker', desc: 'A glowing ferris wheel under the night sky.' },
            { name: 'Ticket to Fun Sticker', desc: 'Vintage carnival ticket design.' },
            { name: 'Ring Toss Star Sticker', desc: 'A golden star from the ring toss game.' },
            { name: 'Ballerina Bear Sticker', desc: 'A dancing bear in a tutu.' },
            { name: 'Lucky Clover Sticker', desc: 'Find your luck with this four-leaf clover.' },
            { name: 'Popcorn Party Sticker', desc: 'A bucket of popcorn ready to party.' },
            { name: 'Lemonade Smile Sticker', desc: 'A cheerful glass of lemonade.' },
            { name: 'Balloon Bouquet Sticker', desc: 'A cluster of colorful balloons.' },
            { name: 'Midnight Carnival Sticker', desc: 'Limited edition carnival at midnight with glowing lights.' }
        ]
    },
    'diy-sticker-case': {
        priceBase: 15.00,
        items: [
            { name: 'DIY Kit - Classic Carnival', desc: 'Option A: 1 phone case + 50+ carnival stickers. DIY your own magic!' },
            { name: 'DIY Kit - Sweet Treats', desc: 'Option A: 1 phone case + 50+ dessert-themed stickers.' },
            { name: 'DIY Kit - Animal Parade', desc: 'Option A: 1 phone case + 50+ animal carnival stickers.' },
            { name: 'DIY Kit - Ocean Carnival', desc: 'Option A: 1 phone case + 50+ underwater carnival stickers.' },
            { name: 'Make to Order - Classic', desc: 'Option B: I stick it for you! Custom carnival design, ready to ship.' },
            { name: 'Make to Order - Floral', desc: 'Option B: I stick it for you! Floral carnival design, ready to ship.' },
            { name: 'Make to Order - Galaxy', desc: 'Option B: I stick it for you! Galaxy carnival design, ready to ship.' },
            { name: 'Make to Order - Vintage', desc: 'Option B: I stick it for you! Vintage carnival design, ready to ship.' },
            { name: 'UV Glue Protection Kit', desc: 'Option C: UV glue + UV light to seal and protect your stickers.' },
            { name: 'Deluxe Kit - Sticker Party', desc: 'Full set: DIY kit + Make to Order + UV protection bundle.' },
            { name: 'Mini Sticker Add-On Pack', desc: 'Extra 20 carnival stickers to expand your collection.' },
            { name: 'Limited Edition - Golden Carnival', desc: 'Limited edition sticker set with gold foil accents.' }
        ],
        prices: [15.00, 15.00, 15.00, 15.00, 25.00, 25.00, 25.00, 25.00, 20.00, 50.00, 8.00, 30.00]
    },
    'diy-paint-case': {
        priceBase: 25.00,
        items: [
            { name: 'DIY Kit - Carnival Scene', desc: 'Option A: 1 clear case + 3 acrylic paint colors. Paint your own carnival!' },
            { name: 'DIY Kit - Sunset Sky', desc: 'Option A: 1 clear case + 3 sunset acrylic paint colors.' },
            { name: 'DIY Kit - Ocean Waves', desc: 'Option A: 1 clear case + 3 ocean acrylic paint colors.' },
            { name: 'DIY Kit - Enchanted Forest', desc: 'Option A: 1 clear case + 3 forest acrylic paint colors.' },
            { name: 'Make to Order - Tiny Carnival', desc: 'Option B: I hand-paint a tiny carnival scene for you!' },
            { name: 'Make to Order - Flower Garden', desc: 'Option B: I hand-paint a flower garden scene for you.' },
            { name: 'Make to Order - Starry Night', desc: 'Option B: I hand-paint a starry night scene for you.' },
            { name: 'Make to Order - Rainbow Magic', desc: 'Option B: I hand-paint a rainbow magic scene for you.' },
            { name: 'Paint Brush Set - Pro', desc: 'Professional fine-tip brushes for detailed painting.' },
            { name: 'Deluxe Paint Kit', desc: 'DIY Kit + extra 6 paint colors + 2 brushes.' },
            { name: 'Sealant Spray', desc: 'Waterproof sealant to protect your hand-painted design.' },
            { name: 'Limited Edition - Carnival Queen', desc: 'Limited edition hand-painted carnival queen design.' }
        ],
        prices: [25.00, 25.00, 25.00, 25.00, 40.00, 40.00, 40.00, 40.00, 12.00, 55.00, 10.00, 60.00]
    },
    'diy-epoxy-case': {
        priceBase: 35.00,
        items: [
            { name: 'DIY Kit - Garden Mix', desc: 'Option A: 1 phone case + mixed dried flowers + epoxy resin.' },
            { name: 'DIY Kit - Rose Garden', desc: 'Option A: 1 phone case + dried rose petals + epoxy resin.' },
            { name: 'DIY Kit - Lavender Fields', desc: 'Option A: 1 phone case + dried lavender + epoxy resin.' },
            { name: 'DIY Kit - Wild Meadow', desc: 'Option A: 1 phone case + wildflower mix + epoxy resin.' },
            { name: 'Make to Order - Custom Floral', desc: 'Option B: I arrange and seal the flowers for you. Custom design!' },
            { name: 'Make to Order - Rose Romance', desc: 'Option B: I arrange dried roses in a romantic pattern.' },
            { name: 'Make to Order - Butterfly Garden', desc: 'Option B: I arrange flowers with dried butterfly accents.' },
            { name: 'Make to Order - Minimal Elegance', desc: 'Option B: I arrange a minimalist floral design.' },
            { name: 'Extra Flower Pack', desc: 'Additional mixed dried flowers for extra creativity.' },
            { name: 'Epoxy Resin Refill', desc: 'Extra epoxy resin for larger projects.' },
            { name: 'Deluxe Flower Kit', desc: 'DIY Kit + extra flowers + epoxy + tools bundle.' },
            { name: 'Limited Edition - Deweys Garden', desc: 'Limited edition arrangement inspired by Deweys favorite garden.' }
        ],
        prices: [35.00, 35.00, 35.00, 35.00, 55.00, 55.00, 55.00, 55.00, 10.00, 15.00, 65.00, 70.00]
    }
};

const products = [];
Object.entries(productTemplates).forEach(([categoryId, template]) => {
    template.items.forEach((item, index) => {
        const price = template.prices ? template.prices[index] : template.priceBase;
        products.push({
            id: categoryId + '-' + (index + 1),
            name: item.name,
            price: price,
            description: item.desc,
            category: categoryId,
            image: null,
            stripePriceId: null
        });
    });
});

// Phone Case Styles (10 styles x 8 colors each)
// Bundle product (stick pack special offer - fallback if Supabase unavailable)
products.push({
    id: 'bundle-5pcs-stick',
    name: '5pcs Stick Bundle Pack',
    price: 8.00,
    description: 'Get 5pcs Stick Bundle Pack at $8.00 only! (50% off - was US$16, now US$8)',
    category: 'stickers',
    image: null,
    stripePriceId: null
});

// Phone Case Styles (10 styles x 8 colors each)
const phoneCaseStyles = [
    { id: 'clear-classic', name: 'Clear Classic', price: 0, colors: ['Clear', 'Black', 'White', 'Pink', 'Blue', 'Purple', 'Green', 'Red'] },
    { id: 'glossy', name: 'Glossy Finish', price: 2, colors: ['Clear', 'Black', 'White', 'Pink', 'Blue', 'Purple', 'Green', 'Red'] },
    { id: 'matte', name: 'Matte Finish', price: 3, colors: ['Black', 'White', 'Pink', 'Blue', 'Purple', 'Green', 'Red', 'Gray'] },
    { id: 'glitter', name: 'Glitter Sparkle', price: 5, colors: ['Clear', 'Pink', 'Gold', 'Silver', 'Blue', 'Purple', 'Rainbow', 'Red'] },
    { id: 'marble', name: 'Marble Swirl', price: 4, colors: ['White', 'Pink', 'Blue', 'Green', 'Purple', 'Gray', 'Gold', 'Black'] },
    { id: 'frost', name: 'Transparent Frost', price: 2, colors: ['Clear', 'White', 'Pink', 'Blue', 'Purple', 'Green', 'Yellow', 'Lavender'] },
    { id: 'mirror', name: 'Mirror Shine', price: 6, colors: ['Silver', 'Gold', 'Rose Gold', 'Black', 'Blue', 'Pink', 'Purple', 'Rainbow'] },
    { id: 'gradient', name: 'Gradient Glow', price: 5, colors: ['Pink-Purple', 'Blue-Green', 'Orange-Yellow', 'Purple-Blue', 'Red-Orange', 'Green-Teal', 'Pink-Yellow', 'Blue-Purple'] },
    { id: 'metallic', name: 'Metallic Edge', price: 4, colors: ['Gold', 'Silver', 'Rose Gold', 'Black', 'White', 'Blue', 'Pink', 'Purple'] },
    { id: 'ultra-slim', name: 'Ultra Slim', price: 3, colors: ['Clear', 'Black', 'White', 'Pink', 'Blue', 'Purple', 'Green', 'Red'] }
];

const phoneModels = [];

// Available options per category
const categoryCustomization = {
    'stickers': { hasCaseSelection: false, options: [] },
    'diy-sticker-case': { hasCaseSelection: true, options: ['A', 'B', 'C'] },
    'diy-paint-case': { hasCaseSelection: true, options: ['A', 'B'] },
    'diy-epoxy-case': { hasCaseSelection: true, options: ['A', 'B'] }
};

const optionDetails = {
    'A': { name: 'DIY Kit', description: 'I do it myself', price: 0 },
    'B': { name: 'Make to Order', description: 'You make it for me', price: 10.00 },
    'C': { name: 'UV Glue Protection', description: 'Add UV glue + UV light to seal stickers', price: 5.00 }
};

// ============================================
// Dynamic Data Loading from Supabase (Direct)
// ============================================
// Supabase is configured to allow anon public read access to these tables
// The anon key is safe for client-side use (Row Level Security restricts it)

var SUPABASE_URL = 'https://hcqmwoxgmezkpapawtqv.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcW13b3hnbWV6a3BhcGF3dHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDExMjgsImV4cCI6MjA5NjcxNzEyOH0._Ezf4UKtYQDDAdi2qEy7VvVXVZt_G_FmayXYqT75wpY';

async function supabaseFetch(table, query) {
    var url = SUPABASE_URL + '/rest/v1/' + table + '?' + (query || '');
    var res = await fetch(url, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Accept': 'application/json'
        }
    });
    if (!res.ok) throw new Error(table + ': HTTP ' + res.status);
    return res.json();
}

(async function loadPublicData() {
    try {
        var [
            categoriesData,
            productsData,
            settingsData,
            caseStylesData,
            optionsData,
            categoryOptionsData,
            phoneModelsData
        ] = await Promise.all([
            supabaseFetch('categories', 'select=*&hidden=eq.false&order=id.asc'),
            supabaseFetch('products', 'select=*&order=sort_order.asc'),
            supabaseFetch('site_settings', 'select=*'),
            supabaseFetch('phone_case_styles', 'select=*&order=display_order.asc'),
            supabaseFetch('options', 'select=*&order=key.asc'),
            supabaseFetch('category_options', 'select=*'),
            supabaseFetch('phone_models', 'select=*&order=display_order.asc')
        ]);

        if (categoriesData && categoriesData.length > 0) {
            categories.length = 0;
            categoriesData.forEach(function(c) { 
                // Only keep Sticker Jar category visible
                if (c.id === 'stickers') {
                    categories.push(c);
                }
            });
        }

        if (productsData && productsData.length > 0) {
            products.length = 0;
            productsData.forEach(function(p) {
                products.push({
                    id: p.id,
                    name: p.name,
                    price: parseFloat(p.price),
                    description: p.description || '',
                    category: p.category_id,
                    image: p.image_url || null,
                    stripePriceId: p.stripe_price_id || null,
                    badge: null
                });
            });
            products.forEach(function(p) {
                var cat = categoriesData.find(function(c) { return c.id === p.category; });
                if (cat) p.badge = cat.badge || null;
            });
        }

        if (caseStylesData && caseStylesData.length > 0) {
            phoneCaseStyles.length = 0;
            caseStylesData.forEach(function(s) { phoneCaseStyles.push(s); });
        }

        if (phoneModelsData && phoneModelsData.length > 0) {
            phoneModels.length = 0;
            phoneModelsData.forEach(function(m) { phoneModels.push(m); });
        }

        if (optionsData && optionsData.length > 0) {
            optionsData.forEach(function(o) {
                optionDetails[o.key] = { name: o.name, description: o.description, price: parseFloat(o.price) };
            });
        }

        var categoryOptions = {};
        if (categoryOptionsData && categoryOptionsData.length > 0) {
            categoryOptionsData.forEach(function(co) {
                if (!categoryOptions[co.category_id]) categoryOptions[co.category_id] = [];
                categoryOptions[co.category_id].push(co.option_key);
            });
        }

        if (categoriesData) {
            categoriesData.forEach(function(cat) {
                categoryCustomization[cat.id] = {
                    hasCaseSelection: cat.id !== 'stickers',
                    options: categoryOptions[cat.id] || []
                };
            });
        }

        // Store settings globally
        var settings = {};
        if (settingsData && settingsData.length > 0) {
            settingsData.forEach(function(s) { settings[s.key] = s.value; });
        }
        if (Object.keys(settings).length > 0) {
            window.__siteSettings = settings;
        }
        window.__publicDataLoaded = true;
        document.dispatchEvent(new CustomEvent('publicDataLoaded', { detail: {
            categories: categoriesData,
            products: productsData,
            phoneCaseStyles: caseStylesData,
            phoneModels: phoneModelsData,
            settings: settings
        }}));

    } catch (e) {
        console.log('Using fallback data (Supabase unavailable): ' + e.message);
        window.__publicDataLoaded = false;
    }
})();

