// Netlify Function: Get Customer Orders
// Returns order history for a logged-in customer
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) throw new Error('Supabase credentials not configured');

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get auth token from Authorization header
        const authHeader = event.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
        }

        // Verify the user's token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
        }

        // Fetch orders for this user with their items
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders: orders || [] })
        };

    } catch (error) {
        console.error('get-orders error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch orders', details: error.message })
        };
    }
};
