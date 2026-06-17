// Cloudflare Pages Function: Admin - Toggle Category Visibility
import { verifyAdmin, jsonResponse, errorResponse, supabaseGet } from './_utils.js';

export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var user = await verifyAdmin(context.request, context.env);
        if (!user) return errorResponse('Not authorized', 403);

        var { category_id } = await context.request.json();
        if (!category_id) {
            return errorResponse('category_id is required', 400);
        }

        // Get current hidden status
        var cats = await supabaseGet('categories', 'id=eq.' + encodeURIComponent(category_id) + '&select=hidden', context.env, true);
        if (!cats || cats.length === 0) {
            return errorResponse('Category not found', 404);
        }

        var cat = cats[0];
        var newHidden = !cat.hidden;

        // Toggle the hidden status
        var url = context.env.SUPABASE_URL + '/rest/v1/categories?id=eq.' + encodeURIComponent(category_id);
        var res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': context.env.SUPABASE_SERVICE_KEY,
                'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ hidden: newHidden })
        });

        if (!res.ok) {
            var text = await res.text();
            throw new Error('HTTP ' + res.status + ' ' + text.slice(0, 200));
        }

        var data = await res.json();
        return jsonResponse({ success: true, category: Array.isArray(data) ? data[0] : data });

    } catch (error) {
        console.error('admin-toggle-category error:', error);
        return errorResponse('Failed to toggle category: ' + error.message, 500);
    }
}
