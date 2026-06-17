// Cloudflare Pages Function: Admin Update Order (status, tracking)
import { verifyAdmin, supabasePost, jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    try {
        var { request, env } = context;
        if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

        var user = await verifyAdmin(request, env);
        if (!user) return errorResponse('Unauthorized', 401);

        var body = await request.json();
        var { order_id, status, tracking_number, tracking_url } = body;

        if (!order_id) return errorResponse('order_id is required', 400);

        var updateData = {};
        if (status !== undefined) updateData.status = status;
        if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
        if (tracking_url !== undefined) updateData.tracking_url = tracking_url;

        if (Object.keys(updateData).length === 0) {
            return errorResponse('No fields to update', 400);
        }

        var result = await supabasePost('PATCH', 'orders?id=eq.' + order_id, updateData, env);
        var order = result && result[0] ? result[0] : null;

        return jsonResponse({ success: true, order: order });

    } catch (error) {
        console.error('admin-update-order error:', error);
        return errorResponse('Failed to update order: ' + error.message);
    }
}
