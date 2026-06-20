// Cloudflare Pages Function: Get Customer Orders
import { jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    try {
        var { request, env } = context;
        if (request.method !== 'GET') return errorResponse('Method not allowed', 405);

        var authHeader = request.headers.get('Authorization') || '';
        var token = authHeader.replace('Bearer ', '');
        if (!token) return errorResponse('Not authenticated', 401);

        // Verify token with Supabase Auth
        var authRes = await fetch(env.SUPABASE_URL + '/auth/v1/user', {
            headers: {
                'Authorization': 'Bearer ' + token,
                'apikey': env.SUPABASE_ANON_KEY
            }
        });
        if (!authRes.ok) return errorResponse('Invalid token', 401);
        var user = await authRes.json();
        if (!user || !user.id) return errorResponse('Invalid token', 401);

        // Fetch orders for this user with items
        var ordersRes = await fetch(
            env.SUPABASE_URL + '/rest/v1/orders?customer_id=eq.' + user.id + '&select=*,order_items(*)&order=created_at.desc',
            {
                headers: {
                    'apikey': env.SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                }
            }
        );
        if (!ordersRes.ok) throw new Error('Orders: HTTP ' + ordersRes.status);
        var orders = await ordersRes.json();

        return jsonResponse({ orders: orders || [] });

    } catch (error) {
        console.error('get-orders error:', error);
        return errorResponse('Failed to fetch orders: ' + error.message);
    }
}
