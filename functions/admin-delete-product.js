// Cloudflare Pages Function: Admin - Delete Product
import { verifyAdmin, jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var user = await verifyAdmin(context.request, context.env);
        if (!user) return errorResponse('Not authorized', 403);

        var { id } = await context.request.json();
        if (!id) return errorResponse('Product ID required', 400);

        var url = context.env.SUPABASE_URL + '/rest/v1/products?id=eq.' + encodeURIComponent(id);
        var res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'apikey': context.env.SUPABASE_SERVICE_KEY,
                'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            var text = await res.text();
            throw new Error('HTTP ' + res.status + ' ' + text.slice(0, 200));
        }

        return jsonResponse({ success: true });

    } catch (error) {
        console.error('admin-delete-product error:', error);
        return errorResponse('Failed to delete product: ' + error.message, 500);
    }
}
