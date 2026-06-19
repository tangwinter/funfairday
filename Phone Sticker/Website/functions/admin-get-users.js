// Cloudflare Pages Function: Admin Get Users
import { verifyAdmin, jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    try {
        var { request, env } = context;
        if (request.method !== 'GET') return errorResponse('Method not allowed', 405);

        var user = await verifyAdmin(request, env);
        if (!user) return errorResponse('Unauthorized', 401);

        // List all users using Supabase Auth admin API
        var listRes = await fetch(env.SUPABASE_URL + '/auth/v1/admin/users', {
            headers: {
                'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
                'apikey': env.SUPABASE_SERVICE_KEY
            }
        });
        if (!listRes.ok) throw new Error('Failed to list users: HTTP ' + listRes.status);
        var usersData = await listRes.json();

        // Fetch all user roles
        var roleRes = await fetch(
            env.SUPABASE_URL + '/rest/v1/user_roles?select=user_id,role',
            {
                headers: {
                    'apikey': env.SUPABASE_SERVICE_KEY,
                    'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
                    'Accept': 'application/json'
                }
            }
        );
        var allRoles = await roleRes.json();

        var roleMap = {};
        if (allRoles && allRoles.length) {
            allRoles.forEach(function(r) {
                if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
                roleMap[r.user_id].push(r.role);
            });
        }

        var enrichedUsers = (usersData.users || []).map(function(u) {
            return {
                id: u.id,
                email: u.email,
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at,
                roles: roleMap[u.id] || ['customer']
            };
        });

        return jsonResponse({ users: enrichedUsers });

    } catch (error) {
        console.error('admin-get-users error:', error);
        return errorResponse(error.message);
    }
}
