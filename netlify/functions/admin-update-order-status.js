// Netlify Function: Admin - Update Order Status
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

        const { order_id, status } = JSON.parse(event.body);
        if (!order_id || !status) {
            return { statusCode: 400, body: JSON.stringify({ error: 'order_id and status required' }) };
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid status' }) };
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', order_id)
            .select()
            .single();

        if (error) throw error;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, order: data })
        };

    } catch (error) {
        console.error('admin-update-order-status error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update order status', details: error.message })
        };
    }
};
