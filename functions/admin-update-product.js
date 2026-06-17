// Cloudflare Pages Function: Admin - Update Product
import { verifyAdmin, jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var user = await verifyAdmin(context.request, context.env);
        if (!user) return errorResponse('Not authorized', 403);

        var { id, name, description, price, image_url, category_id, sort_order, model_id, case_style_id, case_color, option_choice, weight_grams } = await context.request.json();

        if (!id) return errorResponse('Product ID required', 400);

        var updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (category_id !== undefined) updateData.category_id = category_id;
        if (sort_order !== undefined) updateData.sort_order = sort_order;
        if (model_id !== undefined) updateData.model_id = model_id;
        if (case_style_id !== undefined) updateData.case_style_id = case_style_id;
        if (case_color !== undefined) updateData.case_color = case_color;
        if (option_choice !== undefined) updateData.option_choice = option_choice;
        if (weight_grams !== undefined) updateData.weight_grams = weight_grams;

        var url = context.env.SUPABASE_URL + '/rest/v1/products?id=eq.' + encodeURIComponent(id);
        var res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': context.env.SUPABASE_SERVICE_KEY,
                'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(updateData)
        });

        if (!res.ok) {
            var text = await res.text();
            throw new Error('HTTP ' + res.status + ' ' + text.slice(0, 200));
        }

        var data = await res.json();
        return jsonResponse({ success: true, product: Array.isArray(data) ? data[0] : data });

    } catch (error) {
        console.error('admin-update-product error:', error);
        return errorResponse('Failed to update product: ' + error.message, 500);
    }
}
