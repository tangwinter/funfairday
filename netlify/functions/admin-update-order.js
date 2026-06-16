// Netlify Function: Admin - Update Order (status, tracking)
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

        const authHeader = event.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };

        const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
        if (!roles || roles.length === 0) return { statusCode: 403, body: JSON.stringify({ error: 'Not authorized' }) };

        const { order_id, status, tracking_number, tracking_url } = JSON.parse(event.body);

        if (!order_id) {
            return { statusCode: 400, body: JSON.stringify({ error: 'order_id is required' }) };
        }

        var updateData = {};
        if (status !== undefined) updateData.status = status;
        if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
        if (tracking_url !== undefined) updateData.tracking_url = tracking_url;

        if (Object.keys(updateData).length === 0) {
            return { statusCode: 400, body: JSON.stringify({ error: 'No fields to update' }) };
        }

        const { data: order, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', order_id)
            .select()
            .single();

        if (error) throw error;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, order: order })
        };

    } catch (error) {
        console.error('admin-update-order error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update order', details: error.message })
        };
    }
};
