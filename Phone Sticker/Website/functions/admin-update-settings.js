// Cloudflare Pages Function: Admin - Update Site Settings
import { verifyAdmin, jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var user = await verifyAdmin(context.request, context.env);
        if (!user) return errorResponse('Not authorized', 403);

        var { settings } = await context.request.json();
        if (!settings || typeof settings !== 'object') {
            return errorResponse('Settings object required', 400);
        }

        // Upsert each setting
        for (var key of Object.keys(settings)) {
            var value = settings[key];
            // Check if setting exists
            var checkUrl = context.env.SUPABASE_URL + '/rest/v1/site_settings?key=eq.' + encodeURIComponent(key) + '&select=key';
            var checkRes = await fetch(checkUrl, {
                headers: {
                    'apikey': context.env.SUPABASE_SERVICE_KEY,
                    'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                    'Accept': 'application/json'
                }
            });
            var existing = await checkRes.json();

            var upsertUrl = context.env.SUPABASE_URL + '/rest/v1/site_settings';
            var upsertRes = await fetch(upsertUrl, {
                method: existing && existing.length > 0 ? 'PATCH' : 'POST',
                headers: {
                    'apikey': context.env.SUPABASE_SERVICE_KEY,
                    'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(existing && existing.length > 0
                    ? { value: value, updated_at: new Date().toISOString() }
                    : { key: key, value: value, updated_at: new Date().toISOString() }
                )
            });

            if (!upsertRes.ok) {
                var text = await upsertRes.text();
                throw new Error('Failed to update ' + key + ': ' + text.slice(0, 200));
            }

            // If PATCH, add query param
            if (existing && existing.length > 0) {
                var patchUrl = context.env.SUPABASE_URL + '/rest/v1/site_settings?key=eq.' + encodeURIComponent(key);
                var patchRes = await fetch(patchUrl, {
                    method: 'PATCH',
                    headers: {
                        'apikey': context.env.SUPABASE_SERVICE_KEY,
                        'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({ value: value, updated_at: new Date().toISOString() })
                });
                if (!patchRes.ok) {
                    var patchText = await patchRes.text();
                    throw new Error('Failed to update ' + key + ': ' + patchText.slice(0, 200));
                }
            } else {
                var postRes = await fetch(upsertUrl, {
                    method: 'POST',
                    headers: {
                        'apikey': context.env.SUPABASE_SERVICE_KEY,
                        'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({ key: key, value: value, updated_at: new Date().toISOString() })
                });
                if (!postRes.ok) {
                    var postText = await postRes.text();
                    throw new Error('Failed to insert ' + key + ': ' + postText.slice(0, 200));
                }
            }
        }

        // Return updated settings
        var getUrl = context.env.SUPABASE_URL + '/rest/v1/site_settings?select=key,value';
        var getRes = await fetch(getUrl, {
            headers: {
                'apikey': context.env.SUPABASE_SERVICE_KEY,
                'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                'Accept': 'application/json'
            }
        });
        var updated = await getRes.json();
        var result = {};
        (updated || []).forEach(function(s) { result[s.key] = s.value; });

        return jsonResponse({ success: true, settings: result });

    } catch (error) {
        console.error('admin-update-settings error:', error);
        return errorResponse('Failed to update settings: ' + error.message, 500);
    }
}
