// Cloudflare Pages Function: Admin - Add Product
import { verifyAdmin, jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var user = await verifyAdmin(context.request, context.env);
        if (!user) return errorResponse('Not authorized', 403);

        var { id, name, description, price, image_url, category_id, stripe_price_id, sort_order, model_id, case_style_id, case_color, option_choice, weight_grams } = await context.request.json();

        if (!id || !name || !category_id) {
            return errorResponse('id, name, and category_id are required', 400);
        }

        var url = context.env.SUPABASE_URL + '/rest/v1/products';
        var res = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': context.env.SUPABASE_SERVICE_KEY,
                'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                id, name, description: description || '', price: price || 0,
                image_url: image_url || null, category_id,
                stripe_price_id: stripe_price_id || null,
                sort_order: sort_order || 0,
                model_id: model_id || null,
                case_style_id: case_style_id || null,
                case_color: case_color || null,
                option_choice: option_choice || null,
                weight_grams: weight_grams || 50
            })
        });

        if (!res.ok) {
            var text = await res.text();
            throw new Error('HTTP ' + res.status + ' ' + text.slice(0, 200));
        }

        var data = await res.json();
        return jsonResponse({ success: true, product: Array.isArray(data) ? data[0] : data });

    } catch (error) {
        console.error('admin-add-product error:', error);
        return errorResponse('Failed to add product: ' + error.message, 500);
    }
}
