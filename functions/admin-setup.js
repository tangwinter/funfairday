// Cloudflare Pages Function: One-Time Admin Setup
// Creates an admin account and assigns admin role
// WARNING: This is a ONE-TIME setup function. Delete after use!

export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    var supabaseUrl = context.env.SUPABASE_URL;
    var supabaseServiceKey = context.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return new Response(JSON.stringify({ error: 'Server not configured' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        var { email, password } = await context.request.json();
        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Email and password required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (password.length < 6) {
            return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Use Supabase Auth admin REST API instead of SDK
        // Check if user already exists by listing users
        var listUrl = supabaseUrl + '/auth/v1/admin/users';
        var listRes = await fetch(listUrl, {
            headers: {
                'Authorization': 'Bearer ' + supabaseServiceKey,
                'apikey': supabaseServiceKey
            }
        });
        var listData = await listRes.json();
        var users = listData.users || [];
        var existing = users.find(function(u) { return u.email === email; });

        if (existing) {
            // User exists, just add admin role
            var roleUrl = supabaseUrl + '/rest/v1/user_roles';
            var roleRes = await fetch(roleUrl, {
                method: 'POST',
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': 'Bearer ' + supabaseServiceKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ user_id: existing.id, role: 'admin' })
            });

            if (!roleRes.ok) {
                var roleText = await roleRes.text();
                // Ignore duplicate key errors
                if (!roleText.includes('duplicate') && !roleText.includes('unique')) {
                    throw new Error('Failed to add admin role: ' + roleText.slice(0, 200));
                }
            }

            return new Response(JSON.stringify({
                success: true,
                message: 'Admin role added to existing account!',
                email: email,
                next: 'Go to /admin/ to login'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create new user via Supabase Auth admin API
        var createUrl = supabaseUrl + '/auth/v1/admin/users';
        var createRes = await fetch(createUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + supabaseServiceKey,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                email_confirm: true
            })
        });

        if (!createRes.ok) {
            var createText = await createRes.text();
            throw new Error('Failed to create user: ' + createText.slice(0, 200));
        }

        var createData = await createRes.json();

        // Add admin role
        var roleUrl2 = supabaseUrl + '/rest/v1/user_roles';
        var roleRes2 = await fetch(roleUrl2, {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': 'Bearer ' + supabaseServiceKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ user_id: createData.user.id, role: 'admin' })
        });

        if (!roleRes2.ok) {
            var roleText2 = await roleRes2.text();
            throw new Error('Failed to add admin role: ' + roleText2.slice(0, 200));
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Admin account created successfully!',
            email: email,
            next: 'Go to /admin/ to login'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('admin-setup error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
