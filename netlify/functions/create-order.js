// Netlify Function: Create Order
// Saves a completed order to Supabase after Stripe checkout
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials not configured');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { customer_id, customer_email, items, total, shipping_address, stripe_session_id } = JSON.parse(event.body);

        if (!items || items.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No items provided' })
            };
        }

        // Create the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_id: customer_id || null,
                customer_email: customer_email || null,
                status: 'pending',
                total: total,
                shipping_address: shipping_address || null,
                stripe_session_id: stripe_session_id || null
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.productId || item.id,
            product_name: item.name,
            price: item.price,
            quantity: item.quantity,
            case_style: item.caseStyle || null,
            case_color: item.caseColor || null,
            options_text: item.optionsText || null
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                order_id: order.id,
                order: order
            })
        };

    } catch (error) {
        console.error('create-order error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to create order',
                details: error.message
            })
        };
    }
};
