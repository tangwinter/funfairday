// Netlify Function: Admin - Update Site Settings
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

        const { settings } = JSON.parse(event.body);
        // settings = { key: value, key2: value2, ... }
        if (!settings || typeof settings !== 'object') {
            return { statusCode: 400, body: JSON.stringify({ error: 'Settings object required' }) };
        }

        // Upsert each setting
        for (const [key, value] of Object.entries(settings)) {
            const { error } = await supabase.from('site_settings').upsert(
                { key, value, updated_at: new Date().toISOString() },
                { onConflict: 'key' }
            );
            if (error) throw error;
        }

        // Return updated settings
        const { data: updated } = await supabase.from('site_settings').select('*');
        const result = {};
        (updated || []).forEach(s => { result[s.key] = s.value; });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, settings: result })
        };

    } catch (error) {
        console.error('admin-update-settings error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update settings', details: error.message })
        };
    }
};
