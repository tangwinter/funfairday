// Cloudflare Pages Function: Admin Update Order Status
import { verifyAdmin, supabasePost, jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    try {
        var { request, env } = context;
        if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

        var user = await verifyAdmin(request, env);
        if (!user) return errorResponse('Unauthorized', 401);

        var body = await request.json();
        var { order_id, status } = body;

        if (!order_id || !status) return errorResponse('order_id and status required', 400);

        var validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (validStatuses.indexOf(status) === -1) return errorResponse('Invalid status', 400);

        var result = await supabasePost('PATCH', 'orders?id=eq.' + order_id, { status: status, updated_at: new Date().toISOString() }, env);
        var order = result && result[0] ? result[0] : null;

        return jsonResponse({ success: true, order: order });

    } catch (error) {
        console.error('admin-update-order-status error:', error);
        return errorResponse('Failed to update order status: ' + error.message);
    }
}
