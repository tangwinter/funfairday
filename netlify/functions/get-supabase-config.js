// Netlify Function: Get Supabase Client Config
// Returns the public URL and anon key from environment variables
// This prevents exposing credentials in browser storage or hardcoded in HTML
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return {
                statusCode: 200,
                body: JSON.stringify({ configured: false })
            };
        }

        // Verify the credentials work by making a simple query
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { error } = await supabase.from('site_settings').select('key').limit(1);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                configured: true,
                url: supabaseUrl,
                anonKey: supabaseAnonKey,
                working: !error
            })
        };

    } catch (error) {
        console.error('get-supabase-config error:', error);
        return {
            statusCode: 200,
            body: JSON.stringify({ configured: false, error: error.message })
        };
    }
};
