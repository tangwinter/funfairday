// Netlify Function: Admin - Update Product
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

        // Verify admin
        const authHeader = event.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };

        const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
        if (!roles || roles.length === 0) return { statusCode: 403, body: JSON.stringify({ error: 'Not authorized' }) };

        const { id, name, description, price, image_url, category_id, sort_order, model_id, case_style_id, case_color, option_choice, weight_grams } = JSON.parse(event.body);
        if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Product ID required' }) };

        const updateData = {};
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

        const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().single();
        if (error) throw error;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, product: data })
        };

    } catch (error) {
        console.error('admin-update-product error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update product', details: error.message })
        };
    }
};
