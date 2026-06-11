// Netlify Function: Admin - Get All Orders
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

        // Verify admin role
        const authHeader = event.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };

        const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
        if (!roles || roles.length === 0) return { statusCode: 403, body: JSON.stringify({ error: 'Not authorized' }) };

        // Fetch all orders with items, ordered by most recent
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders: orders || [] })
        };

    } catch (error) {
        console.error('admin-get-orders error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch orders', details: error.message })
        };
    }
};
