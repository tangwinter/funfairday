// Shared utilities for Cloudflare Pages Functions
// Supabase REST API helpers and admin auth verification

export async function supabaseGet(table, query, env, useServiceKey) {
    var key = useServiceKey ? env.SUPABASE_SERVICE_KEY : env.SUPABASE_ANON_KEY;
    var url = env.SUPABASE_URL + '/rest/v1/' + table + '?' + (query || '');
    var res = await fetch(url, {
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Accept': 'application/json'
        }
    });
    if (!res.ok) throw new Error(table + ': HTTP ' + res.status);
    return res.json();
}

export async function supabasePost(method, table, bodyData, env) {
    var url = env.SUPABASE_URL + '/rest/v1/' + table;
    var res = await fetch(url, {
        method: method,
        headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Prefer': 'return=representation'
        },
        body: bodyData ? JSON.stringify(bodyData) : undefined
    });
    if (!res.ok) {
        var text = await res.text();
        throw new Error(table + ': HTTP ' + res.status + ' ' + text.slice(0, 200));
    }
    return res.json();
}

export async function verifyAdmin(request, env) {
    var authHeader = request.headers.get('Authorization') || '';
    var token = authHeader.replace('Bearer ', '');
    if (!token) return null;

    // Verify token with Supabase Auth REST API
    var authRes = await fetch(env.SUPABASE_URL + '/auth/v1/user', {
        headers: {
            'Authorization': 'Bearer ' + token,
            'apikey': env.SUPABASE_ANON_KEY
        }
    });
    if (!authRes.ok) return null;
    var user = await authRes.json();
    if (!user || !user.id) return null;

    // Check admin role using service key
    var roleRes = await fetch(
        env.SUPABASE_URL + '/rest/v1/user_roles?user_id=eq.' + user.id + '&role=eq.admin&select=role',
        {
            headers: {
                'apikey': env.SUPABASE_SERVICE_KEY,
                'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
                'Accept': 'application/json'
            }
        }
    );
    var roles = await roleRes.json();
    if (!roles || roles.length === 0) return null;

    return user;
}

export function jsonResponse(data, status) {
    return new Response(JSON.stringify(data), {
        status: status || 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

export function errorResponse(message, status) {
    return new Response(JSON.stringify({ error: message }), {
        status: status || 500,
        headers: { 'Content-Type': 'application/json' }
    });
}
