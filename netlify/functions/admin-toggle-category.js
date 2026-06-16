// Netlify Function: Admin - Toggle Category Visibility
// Toggles the `hidden` field on a category
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

        const { category_id } = JSON.parse(event.body);
        if (!category_id) {
            return { statusCode: 400, body: JSON.stringify({ error: 'category_id is required' }) };
        }

        // Get current hidden status
        const { data: cat, error: findError } = await supabase
            .from('categories')
            .select('hidden')
            .eq('id', category_id)
            .single();

        if (findError || !cat) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Category not found' }) };
        }

        // Toggle the hidden status
        const newHidden = !cat.hidden;
        const { data, error: updateError } = await supabase
            .from('categories')
            .update({ hidden: newHidden })
            .eq('id', category_id)
            .select()
            .single();

        if (updateError) throw updateError;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, category: data })
        };

    } catch (error) {
        console.error('admin-toggle-category error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to toggle category', details: error.message })
        };
    }
};
