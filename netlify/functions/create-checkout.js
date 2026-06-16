// Netlify Function: Create Stripe Checkout Session
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { items, cartItems, total, shippingFee, shippingMethod, successUrl, cancelUrl, useDynamicPrices } = JSON.parse(event.body);

        if (!items || items.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No items provided' })
            };
        }

        // Build line items for Stripe
        // Filter out items without valid price IDs (free gifts, etc.)
        // When useDynamicPrices is set, use price_data with custom amounts (for 30% discount)
        var lineItems = items
            .filter(function(item) { return item.priceId || useDynamicPrices; })
            .map(function(item) {
                if (useDynamicPrices && item.unitAmount) {
                    return {
                        price_data: {
                            currency: 'usd',
                            product_data: { name: item.name },
                            unit_amount: item.unitAmount
                        },
                        quantity: item.quantity
                    };
                }
                return {
                    price: item.priceId,
                    quantity: item.quantity
                };
            });

        // Add shipping fee as a line item if present
        if (shippingFee && shippingFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: shippingMethod || 'HK Post Airmail Shipping' },
                    unit_amount: Math.round(shippingFee * 100)
                },
                quantity: 1
            });
        }

        // Generate a unique order reference
        const orderRef = 'ORD-' + Date.now().toString(36).toUpperCase();

        // Add gift info to metadata if present
        var metadata = {
            order_ref: orderRef,
            total: total || '0'
        };
        if (cartItems && cartItems._giftCode) {
            metadata.gift_code = cartItems._giftCode;
        }
        if (cartItems && cartItems._discount30) {
            metadata.discount30 = 'true';
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: (successUrl || (event.headers.referer || 'https://funfairday.com') + '/success.html') + '?session_id={CHECKOUT_SESSION_ID}&order_ref=' + orderRef,
            cancel_url: cancelUrl || (event.headers.referer || 'https://funfairday.com'),
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'FR', 'DE', 'IT', 'ES', 'NL', 'CH', 'SE', 'NO', 'DK', 'BE', 'AT', 'IE', 'PT', 'GR', 'PL', 'CZ', 'JP', 'KR', 'SG', 'MY', 'TH', 'PH', 'ID', 'VN', 'CN', 'TW', 'AE', 'SA', 'ZA', 'MX', 'BR', 'AR']
            },
            metadata: metadata
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: session.url })
        };

    } catch (error) {
        console.error('Stripe error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to create checkout session',
                details: error.message
            })
        };
    }
};
