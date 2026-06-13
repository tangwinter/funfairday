// Netlify Function: One-Time Admin Setup
// Creates an admin account and assigns admin role
// WARNING: This is a ONE-TIME setup function. Delete after use!
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { statusCode: 200, body: JSON.stringify({ error: 'Server not configured' }) };
    }

    try {
        const { email, password } = JSON.parse(event.body);
        if (!email || !password) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Email and password required' }) };
        }

        if (password.length < 6) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Password must be at least 6 characters' }) };
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find(u => u.email === email);
        if (existing) {
            // User exists, just add admin role
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert({ user_id: existing.id, role: 'admin' });

            if (roleError && !roleError.message.includes('duplicate')) {
                throw roleError;
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message: 'Admin role added to existing account!',
                    email,
                    next: 'Go to /admin/ to login'
                })
            };
        }

        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (createError) throw createError;

        // Add admin role
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: newUser.user.id, role: 'admin' });

        if (roleError) throw roleError;

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Admin account created successfully!',
                email,
                next: 'Go to /admin/ to login'
            })
        };

    } catch (error) {
        console.error('admin-setup error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
