// Netlify Function: Admin - Add (generate) a new gift code
const { createClient } = require('@supabase/supabase-js');

// Generate a random unguessable gift code
function generateGiftCode() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var code = 'GIFT-';
    for (var i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

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

        // Check if user provided a custom code
        var customCode = null;
        try {
            var body = JSON.parse(event.body);
            customCode = body.code || null;
        } catch (e) {}

        var code = customCode || generateGiftCode();
        var maxAttempts = 20;
        var attempt = 0;

        while (attempt < maxAttempts) {
            // Check if code already exists
            var { data: existing } = await supabase
                .from('free_gift_codes')
                .select('code')
                .eq('code', code)
                .maybeSingle();

            if (!existing) {
                // Code is available - insert it
                var { data, error: insertError } = await supabase
                    .from('free_gift_codes')
                    .insert({ code: code })
                    .select()
                    .single();

                if (insertError) throw insertError;

                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: true, code: data })
                };
            }

            // Code exists, generate a new one (only if auto-generated)
            if (customCode) {
                return {
                    statusCode: 409,
                    body: JSON.stringify({ error: 'Code already exists', code: customCode })
                };
            }
            code = generateGiftCode();
            attempt++;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate unique code after ' + maxAttempts + ' attempts' })
        };

    } catch (error) {
        console.error('admin-add-gift-code error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to add gift code', details: error.message })
        };
    }
};
