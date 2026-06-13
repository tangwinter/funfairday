// Netlify Function: Admin Get Users
// Returns all registered users from Supabase Auth
// Requires admin authentication
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const authHeader = event.headers.authorization;
    if (!authHeader) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { statusCode: 200, body: JSON.stringify({ error: 'Server not configured' }) };
    }

    try {
        // Create admin client with service_role key
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verify the caller is an admin
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
        }

        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

        if (!roleData) {
            return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
        }

        // Fetch all users from auth
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error('Error listing users:', listError);
            return { statusCode: 500, body: JSON.stringify({ error: listError.message }) };
        }

        // Fetch user roles for all users
        const { data: allRoles } = await supabase
            .from('user_roles')
            .select('user_id, role');

        const roleMap = {};
        if (allRoles) {
            allRoles.forEach(r => {
                if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
                roleMap[r.user_id].push(r.role);
            });
        }

        // Map users with their roles
        const enrichedUsers = (users.users || []).map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            roles: roleMap[u.id] || ['customer']
        }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: enrichedUsers })
        };

    } catch (error) {
        console.error('admin-get-users error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
