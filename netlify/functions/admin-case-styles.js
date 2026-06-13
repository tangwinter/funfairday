// Netlify Function: Admin - Manage Case Styles
// Handles CRUD for phone models, styles, and their photo variants
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

        const body = JSON.parse(event.body);
        const { action } = body;

        if (action === 'list-models') {
            const { data, error } = await supabase.from('phone_models').select('*').order('display_order');
            if (error) throw error;
            return { statusCode: 200, body: JSON.stringify({ success: true, models: data }) };
        }

        if (action === 'list-styles') {
            const { model_id } = body;
            let query = supabase.from('phone_case_styles').select('*');
            if (model_id) query = query.eq('model_id', model_id);
            query = query.order('display_order');
            const { data, error } = await query;
            if (error) throw error;
            return { statusCode: 200, body: JSON.stringify({ success: true, styles: data }) };
        }

        if (action === 'add-style') {
            const { model_id, name, image_url, colors, display_order } = body;
            if (!model_id || !name) {
                return { statusCode: 400, body: JSON.stringify({ error: 'model_id and name are required' }) };
            }
            const id = model_id + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
            const { data, error } = await supabase.from('phone_case_styles').insert({
                id,
                model_id,
                name,
                image_url: image_url || null,
                colors: colors || [],
                display_order: display_order || 0
            }).select().single();
            if (error) throw error;
            return { statusCode: 200, body: JSON.stringify({ success: true, style: data }) };
        }

        if (action === 'update-style') {
            const { id, name, image_url, colors, display_order } = body;
            if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id is required' }) };

            const updates = {};
            if (name !== undefined) updates.name = name;
            if (image_url !== undefined) updates.image_url = image_url;
            if (colors !== undefined) updates.colors = colors;
            if (display_order !== undefined) updates.display_order = display_order;

            const { data, error } = await supabase.from('phone_case_styles').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return { statusCode: 200, body: JSON.stringify({ success: true, style: data }) };
        }

        if (action === 'delete-style') {
            const { id } = body;
            if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id is required' }) };
            const { error } = await supabase.from('phone_case_styles').delete().eq('id', id);
            if (error) throw error;
            return { statusCode: 200, body: JSON.stringify({ success: true }) };
        }

        return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };

    } catch (error) {
        console.error('admin-case-styles error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process request', details: error.message })
        };
    }
};
