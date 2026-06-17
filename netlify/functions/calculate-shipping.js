// Netlify Function: Calculate Shipping (HK Post Normal, Registered, FedEx)
// Based on Hongkong Post published airmail rates with 15% markup

// HK Post Airmail Zones
var ZONES = {
    'zone1': { name: 'Asia', countries: ['JP','KR','TW','SG','MY','TH','PH','ID','VN','BN','KH','LA','MM','MN','CN','MO'] },
    'zone2': { name: 'Oceania & Middle East', countries: ['AU','NZ','PG','FJ','SB','VU','AE','SA','QA','KW','BH','OM','IL','TR','CY'] },
    'zone3': { name: 'Europe & Africa', countries: ['GB','IE','FR','DE','IT','ES','PT','NL','BE','LU','CH','AT','SE','NO','DK','FI','GR','PL','CZ','HU','RO','BG','HR','RS','SK','SI','LT','LV','EE','ZA','NG','KE','EG','MA','TN','DZ','GH','MU'] },
    'zone4': { name: 'Americas', countries: ['US','CA','MX','BR','AR','CL','CO','PE','EC','VE','CR','PA','DO','PR','JM','TT','BS','BB','GY','SR','BO','PY','UY','GT','SV','HN','NI','BZ'] }
};

// Base rates (normal airmail small packet) — before 15% markup
var BASE_RATES = [
    { maxG: 50,  z1: 1.74, z2: 2.17, z3: 2.61, z4: 3.04 },
    { maxG: 100, z1: 2.61, z2: 3.30, z3: 3.91, z4: 4.35 },
    { maxG: 200, z1: 3.48, z2: 4.35, z3: 5.22, z4: 5.65 },
    { maxG: 500, z1: 4.78, z2: 6.09, z3: 6.96, z4: 7.83 }
];

// Registered mail surcharge (before markup)
var REGISTERED_FEE = 2.60; // ~HK$20

// FedEx rates (before markup) — estimated for small packets from HK
var FEDEX_RATES = [
    { maxG: 50,  z1: 18.00, z2: 22.00, z3: 26.00, z4: 30.00 },
    { maxG: 100, z1: 22.00, z2: 27.00, z3: 32.00, z4: 36.00 },
    { maxG: 200, z1: 28.00, z2: 34.00, z3: 40.00, z4: 45.00 },
    { maxG: 500, z1: 36.00, z2: 44.00, z3: 52.00, z4: 58.00 }
];

var MARKUP = 0.15; // 15% safety markup

// Delivery time estimates
var DELIVERY = {
    'hk-post-normal': { z1: '7-14 days', z2: '7-21 days', z3: '7-21 days', z4: '10-21 days' },
    'hk-post-registered': { z1: '7-14 days with tracking', z2: '7-21 days with tracking', z3: '7-21 days with tracking', z4: '10-21 days with tracking' },
    'fedex': { z1: '2-4 business days', z2: '2-5 business days', z3: '2-5 business days', z4: '3-5 business days' }
};

function getZone(country) {
    var code = country.toUpperCase();
    for (var zone in ZONES) {
        if (ZONES[zone].countries.indexOf(code) !== -1) return zone;
    }
    return 'zone4';
}

function getBaseRate(rates, totalGrams, zone) {
    for (var i = 0; i < rates.length; i++) {
        if (totalGrams <= rates[i].maxG) {
            var r = rates[i];
            var rateMap = { 'zone1': r.z1, 'zone2': r.z2, 'zone3': r.z3, 'zone4': r.z4 };
            return rateMap[zone] || r.z4;
        }
    }
    return rates[rates.length - 1][zone]; // largest band
}

function getDelivery(method, zone) {
    if (DELIVERY[method] && DELIVERY[method][zone]) return DELIVERY[method][zone];
    return '7-21 days';
}

function applyMarkup(cost) {
    return Math.round(cost * (1 + MARKUP) * 100) / 100;
}

exports.handler = async (event) => {
    try {
        var body = JSON.parse(event.body || '{}');
        var items = body.items || [];
        var country = body.country || 'US';

        // Check if free sticker is in cart
        var hasFreeGift = items.some(function(item) {
            return item.id === 'free-sticker-gift' || item.productId === 'free-sticker-gift';
        });

        // Calculate total weight (needed for both free-gift and normal)
        var totalGrams = items.reduce(function(sum, item) {
            return sum + ((item.weight || 50) * (item.quantity || 1));
        }, 0);

        var zone = getZone(country);
        var baseNormal = getBaseRate(BASE_RATES, totalGrams, zone);
        var baseRegistered = baseNormal + REGISTERED_FEE;
        var baseFedex = getBaseRate(FEDEX_RATES, totalGrams, zone);

        if (hasFreeGift) {
            // Only HK Post Normal is free with gift; Registered and FedEx have normal cost
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    methods: [
                        { id: 'hk-post-normal', name: 'HK Post Normal Airmail', cost: 0, deliveryTime: 'Free with Gift', originalCost: 0, markupPercent: 0 },
                        { id: 'hk-post-registered', name: 'HK Post Registered Airmail', cost: applyMarkup(baseRegistered), deliveryTime: getDelivery('hk-post-registered', zone), originalCost: Math.round(baseRegistered * 100) / 100, markupPercent: 15 },
                        { id: 'fedex', name: 'FedEx International Priority', cost: applyMarkup(baseFedex), deliveryTime: getDelivery('fedex', zone), originalCost: Math.round(baseFedex * 100) / 100, markupPercent: 15 }
                    ],
                    freeGift: true,
                    weight: totalGrams,
                    zone: zone
                })
            };
        }

        var methods = [
            {
                id: 'hk-post-normal',
                name: 'HK Post Normal Airmail',
                cost: applyMarkup(baseNormal),
                deliveryTime: getDelivery('hk-post-normal', zone),
                originalCost: Math.round(baseNormal * 100) / 100,
                markupPercent: 15
            },
            {
                id: 'hk-post-registered',
                name: 'HK Post Registered Airmail',
                cost: applyMarkup(baseRegistered),
                deliveryTime: getDelivery('hk-post-registered', zone),
                originalCost: Math.round(baseRegistered * 100) / 100,
                markupPercent: 15
            },
            {
                id: 'fedex',
                name: 'FedEx International Priority',
                cost: applyMarkup(baseFedex),
                deliveryTime: getDelivery('fedex', zone),
                originalCost: Math.round(baseFedex * 100) / 100,
                markupPercent: 15
            }
        ];

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                methods: methods,
                freeGift: false,
                weight: totalGrams,
                zone: zone
            })
        };

    } catch (error) {
        console.error('Shipping error:', error.message, error.stack);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message || 'Failed to calculate shipping' })
        };
    }
};
