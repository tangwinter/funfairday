// Cloudflare Pages Function: Create Stripe Checkout Session
import { jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    // Only allow POST
    if (context.request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var { items, cartItems, total, shippingFee, shippingMethod, successUrl, cancelUrl, useDynamicPrices } = await context.request.json();

        if (!items || items.length === 0) {
            return errorResponse('No items provided', 400);
        }

        // Build line items for Stripe
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
                    product_data: { name: shippingMethod || 'Speedpost Shipping' },
                    unit_amount: Math.round(shippingFee * 100)
                },
                quantity: 1
            });
        }

        // Generate a unique order reference
        var orderRef = 'ORD-' + Date.now().toString(36).toUpperCase();

        // Build metadata
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

        // Determine success/cancel URLs
        var referer = context.request.headers.get('referer') || 'https://funfairday.com';
        var successUrlFinal = (successUrl || referer + '/success.html') + '?session_id={CHECKOUT_SESSION_ID}&order_ref=' + orderRef;
        var cancelUrlFinal = cancelUrl || referer;

        // Build form body for Stripe REST API
        var stripeBody = new URLSearchParams();
        stripeBody.append('payment_method_types[]', 'card');
        stripeBody.append('mode', 'payment');
        stripeBody.append('success_url', successUrlFinal);
        stripeBody.append('cancel_url', cancelUrlFinal);

        // Add shipping address collection
        var allowedCountries = ['HK', 'US', 'CA', 'GB', 'AU', 'NZ', 'FR', 'DE', 'IT', 'ES', 'NL', 'CH', 'SE', 'NO', 'DK', 'BE', 'AT', 'IE', 'PT', 'GR', 'PL', 'CZ', 'JP', 'KR', 'SG', 'MY', 'TH', 'PH', 'ID', 'VN', 'CN', 'TW', 'AE', 'SA', 'ZA', 'MX', 'BR', 'AR'];
        allowedCountries.forEach(function(c) {
            stripeBody.append('shipping_address_collection[allowed_countries][]', c);
        });

        // Add line items to form body
        lineItems.forEach(function(item, index) {
            if (item.price) {
                stripeBody.append('line_items[' + index + '][price]', item.price);
                stripeBody.append('line_items[' + index + '][quantity]', String(item.quantity));
            } else if (item.price_data) {
                stripeBody.append('line_items[' + index + '][price_data][currency]', item.price_data.currency);
                stripeBody.append('line_items[' + index + '][price_data][product_data][name]', item.price_data.product_data.name);
                stripeBody.append('line_items[' + index + '][price_data][unit_amount]', String(item.price_data.unit_amount));
                stripeBody.append('line_items[' + index + '][quantity]', String(item.quantity));
            }
        });

        // Add metadata
        Object.keys(metadata).forEach(function(key) {
            stripeBody.append('metadata[' + key + ']', metadata[key]);
        });

        // Call Stripe REST API
        var stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + context.env.STRIPE_SECRET_KEY,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeBody.toString()
        });

        if (!stripeRes.ok) {
            var stripeText = await stripeRes.text();
            throw new Error('Stripe API error: HTTP ' + stripeRes.status + ' ' + stripeText.slice(0, 300));
        }

        var session = await stripeRes.json();

        return jsonResponse({ url: session.url });

    } catch (error) {
        console.error('Stripe error:', error);
        return errorResponse('Failed to create checkout session: ' + error.message, 500);
    }
}
