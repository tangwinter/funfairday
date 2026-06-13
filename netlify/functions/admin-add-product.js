// Netlify Function: Admin - Add Product
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

        const { id, name, description, price, image_url, category_id, stripe_price_id, sort_order, model_id, case_style_id, case_color, option_choice } = JSON.parse(event.body);
        if (!id || !name || !category_id) {
            return { statusCode: 400, body: JSON.stringify({ error: 'id, name, and category_id are required' }) };
        }

        const { data, error } = await supabase.from('products').insert({
            id, name, description: description || '', price: price || 0,
            image_url: image_url || null, category_id,
            stripe_price_id: stripe_price_id || null,
            sort_order: sort_order || 0,
            model_id: model_id || null,
            case_style_id: case_style_id || null,
            case_color: case_color || null,
            option_choice: option_choice || null
        }).select().single();

        if (error) throw error;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, product: data })
        };

    } catch (error) {
        console.error('admin-add-product error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to add product', details: error.message })
        };
    }
};
