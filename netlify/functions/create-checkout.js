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
        const { items, cartItems, total, successUrl, cancelUrl } = JSON.parse(event.body);

        if (!items || items.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No items provided' })
            };
        }

        // Build line items for Stripe
        const lineItems = items.map(item => ({
            price: item.priceId,
            quantity: item.quantity
        }));

        // Generate a unique order reference
        const orderRef = 'ORD-' + Date.now().toString(36).toUpperCase();

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: (successUrl || (event.headers.referer || 'https://funfairday.com') + '/success.html') + '?session_id={CHECKOUT_SESSION_ID}&order_ref=' + orderRef,
            cancel_url: cancelUrl || (event.headers.referer || 'https://funfairday.com'),
            shipping_address_collection: {
                allowed_countries: ['US', 'CA']
            },
            metadata: {
                order_ref: orderRef,
                total: total || '0'
            }
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
