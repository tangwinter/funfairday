// Cloudflare Pages Function: Admin Get Orders
import { verifyAdmin, supabaseGet, jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    try {
        var { request, env } = context;
        if (request.method !== 'GET') return errorResponse('Method not allowed', 405);

        var user = await verifyAdmin(request, env);
        if (!user) return errorResponse('Unauthorized', 401);

        var orders = await supabaseGet('orders', 'select=*,order_items(*)&order=created_at.desc', env, true);

        return jsonResponse({ success: true, orders: orders });

    } catch (error) {
        console.error('admin-get-orders error:', error);
        return errorResponse('Failed to get orders: ' + error.message);
    }
}
