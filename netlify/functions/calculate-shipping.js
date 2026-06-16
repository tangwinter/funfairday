// Netlify Function: Calculate HK Post Airmail Shipping
// Based on Hongkong Post published airmail rates for small packets (up to 2kg)

// HK Post Airmail Zones for small packets
// Rates in USD (approximate, based on HKD rates ÷ 7.8)
var ZONES = {
    'zone1': { name: 'Asia', countries: ['JP','KR','TW','SG','MY','TH','PH','ID','VN','BN','KH','LA','MM','MN','CN','MO'] },
    'zone2': { name: 'Oceania & Middle East', countries: ['AU','NZ','PG','FJ','SB','VU','AE','SA','QA','KW','BH','OM','IL','TR','CY'] },
    'zone3': { name: 'Europe & Africa', countries: ['GB','IE','FR','DE','IT','ES','PT','NL','BE','LU','CH','AT','SE','NO','DK','FI','GR','PL','CZ','HU','RO','BG','HR','RS','SK','SI','LT','LV','EE','ZA','NG','KE','EG','MA','TN','DZ','GH','MU'] },
    'zone4': { name: 'Americas', countries: ['US','CA','MX','BR','AR','CL','CO','PE','EC','VE','CR','PA','DO','PR','JM','TT','BS','BB','GY','SR','BO','PY','UY','GT','SV','HN','NI','BZ'] }
};

// Rate table: [weight_band_g, zone1, zone2, zone3, zone4]
var RATES = [
    { maxG: 50,  z1: 2.00, z2: 2.50, z3: 3.00, z4: 3.50 },
    { maxG: 100, z1: 3.00, z2: 3.80, z3: 4.50, z4: 5.00 },
    { maxG: 200, z1: 4.00, z2: 5.00, z3: 6.00, z4: 6.50 },
    { maxG: 500, z1: 5.50, z2: 7.00, z3: 8.00, z4: 9.00 }
];

// Estimated weight per item type (in grams)
var ITEM_WEIGHTS = {
    'free-sticker-gift': 10,
    'bundle-5pcs-stick': 30,
    'stick-*': 20,        // generic stickers
    'case-*': 60,         // phone cases with packaging
    'magnet-*': 30,
    'default': 50
};

function getItemWeight(itemId) {
    for (var key in ITEM_WEIGHTS) {
        if (key.endsWith('*')) {
            var prefix = key.slice(0, -1);
            if (itemId.startsWith(prefix)) return ITEM_WEIGHTS[key];
        } else {
            if (itemId === key) return ITEM_WEIGHTS[key];
        }
    }
    return ITEM_WEIGHTS['default'];
}

function getZone(country) {
    var code = country.toUpperCase();
    for (var zone in ZONES) {
        if (ZONES[zone].countries.indexOf(code) !== -1) return zone;
    }
    return 'zone4'; // default to most expensive (Americas)
}

function calculateShipping(totalGrams, zone) {
    for (var i = 0; i < RATES.length; i++) {
        if (totalGrams <= RATES[i].maxG) {
            var r = RATES[i];
            var rateMap = { 'zone1': r.z1, 'zone2': r.z2, 'zone3': r.z3, 'zone4': r.z4 };
            return rateMap[zone] || r.z4;
        }
    }
    // Over 500g — use flat rate
    return 12.00;
}

exports.handler = async (event) => {
    try {
        var body = JSON.parse(event.body || '{}');
        var items = body.items || [];
        var country = body.country || 'US';

        // Check if free sticker is in cart → free shipping
        var hasFreeGift = items.some(function(item) {
            return item.id === 'free-sticker-gift' || item.productId === 'free-sticker-gift';
        });

        if (hasFreeGift) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    cost: 0,
                    method: 'Free HK Post Airmail (Free Gift in cart)',
                    weight: 0,
                    zone: 'N/A',
                    freeGift: true
                })
            };
        }

        // Calculate total weight
        var totalGrams = items.reduce(function(sum, item) {
            return sum + (getItemWeight(item.productId || item.id) * (item.quantity || 1));
        }, 0);

        var zone = getZone(country);
        var cost = calculateShipping(totalGrams, zone);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                cost: cost,
                method: 'HK Post Airmail (' + ZONES[zone].name + ')',
                weight: totalGrams,
                zone: zone,
                freeGift: false
            })
        };

    } catch (error) {
        console.error('Shipping error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to calculate shipping' })
        };
    }
};
