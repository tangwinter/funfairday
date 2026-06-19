// Cloudflare Pages Function: Admin - Get All Gift Codes
import { verifyAdmin, jsonResponse, errorResponse, supabaseGet } from './_utils.js';

export async function onRequest(context) {
    if (context.request.method !== 'GET') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var user = await verifyAdmin(context.request, context.env);
        if (!user) return errorResponse('Not authorized', 403);

        var data = await supabaseGet('free_gift_codes', 'select=*&order=code', context.env, true);

        return jsonResponse({ success: true, codes: data || [] });

    } catch (error) {
        console.error('admin-get-gift-codes error:', error);
        return errorResponse('Failed to fetch gift codes: ' + error.message, 500);
    }
}
