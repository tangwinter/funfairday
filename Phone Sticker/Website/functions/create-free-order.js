// Cloudflare Pages Function: Create Free Order (no Stripe payment)
// Validates user auth, saves order directly to Supabase
import { jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var supabaseUrl = context.env.SUPABASE_URL;
        var supabaseKey = context.env.SUPABASE_SERVICE_KEY;
        var supabaseAnon = context.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials not configured');
        }

        // Get auth token from Authorization header
        var authHeader = context.request.headers.get('Authorization') || '';
        var accessToken = authHeader.replace('Bearer ', '');
        if (!accessToken) {
            return errorResponse('Not authenticated', 401);
        }

        // Verify token and get user info
        var authRes = await fetch(supabaseUrl + '/auth/v1/user', {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'apikey': supabaseAnon
            }
        });
        if (!authRes.ok) {
            return errorResponse('Invalid authentication', 401);
        }
        var authUser = await authRes.json();
        if (!authUser || !authUser.id) {
            return errorResponse('Invalid authentication', 401);
        }

        var { items, cartItems, total, shipping_address, shipping_method, shipping_cost } = await context.request.json();

        if (!items || items.length === 0) {
            return errorResponse('No items provided', 400);
        }

        // Calculate total weight from items
        var totalWeight = items.reduce(function(sum, item) {
            return sum + ((item.weight || 50) * (item.quantity || 1));
        }, 0);

        var headers = {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + supabaseKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Prefer': 'return=representation'
        };

        // Create the order
        var orderUrl = supabaseUrl + '/rest/v1/orders';
        var orderRes = await fetch(orderUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                customer_id: authUser.id,
                customer_email: authUser.email || null,
                status: 'pending',
                total: total || 0,
                shipping_address: shipping_address || null,
                stripe_session_id: '',
                shipping_method: shipping_method || null,
                shipping_cost: shipping_cost || 0,
                weight_grams: totalWeight
            })
        });

        if (!orderRes.ok) {
            var orderText = await orderRes.text();
            throw new Error('Failed to create order: ' + orderText.slice(0, 200));
        }

        var orderData = await orderRes.json();
        var order = Array.isArray(orderData) ? orderData[0] : orderData;

        // Create order items
        var orderItems = items.map(function(item) {
            return {
                order_id: order.id,
                product_id: item.productId || item.id,
                product_name: item.name,
                price: item.price,
                quantity: item.quantity,
                case_style: item.caseStyle || null,
                case_color: item.caseColor || null,
                options_text: item.optionsText || null
            };
        });

        var itemsUrl = supabaseUrl + '/rest/v1/order_items';
        var itemsRes = await fetch(itemsUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(orderItems)
        });

        if (!itemsRes.ok) {
            var itemsText = await itemsRes.text();
            throw new Error('Failed to create order items: ' + itemsText.slice(0, 200));
        }

        return jsonResponse({
            success: true,
            order_id: order.id,
            order: order
        });

    } catch (error) {
        console.error('create-free-order error:', error);
        return errorResponse('Failed to create free order: ' + error.message, 500);
    }
}
