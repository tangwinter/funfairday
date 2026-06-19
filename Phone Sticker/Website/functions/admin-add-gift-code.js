// Cloudflare Pages Function: Admin - Add (generate) a new gift code
import { verifyAdmin, jsonResponse, errorResponse } from './_utils.js';

// Generate a random unguessable gift code (10 chars, mixed case + numbers)
function generateGiftCode() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var code = 'GIFT-';
    for (var i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var user = await verifyAdmin(context.request, context.env);
        if (!user) return errorResponse('Not authorized', 403);

        // Check if user provided a custom code
        var customCode = null;
        try {
            var body = await context.request.json();
            customCode = body.code || null;
        } catch (e) {}

        var code = customCode || generateGiftCode();
        var maxAttempts = 20;
        var attempt = 0;

        while (attempt < maxAttempts) {
            // Check if code already exists
            var checkUrl = context.env.SUPABASE_URL + '/rest/v1/free_gift_codes?code=eq.' + encodeURIComponent(code) + '&select=code';
            var checkRes = await fetch(checkUrl, {
                headers: {
                    'apikey': context.env.SUPABASE_SERVICE_KEY,
                    'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                    'Accept': 'application/json'
                }
            });
            var existing = await checkRes.json();

            if (!existing || existing.length === 0) {
                // Code is available - insert it
                var insertUrl = context.env.SUPABASE_URL + '/rest/v1/free_gift_codes';
                var insertRes = await fetch(insertUrl, {
                    method: 'POST',
                    headers: {
                        'apikey': context.env.SUPABASE_SERVICE_KEY,
                        'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({ code: code })
                });

                if (!insertRes.ok) {
                    var insertText = await insertRes.text();
                    throw new Error('Insert failed: ' + insertText.slice(0, 200));
                }

                var insertData = await insertRes.json();
                return jsonResponse({ success: true, code: Array.isArray(insertData) ? insertData[0] : insertData });
            }

            // Code exists, generate a new one (only if auto-generated)
            if (customCode) {
                return new Response(JSON.stringify({ error: 'Code already exists', code: customCode }), {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            code = generateGiftCode();
            attempt++;
        }

        return errorResponse('Failed to generate unique code after ' + maxAttempts + ' attempts', 500);

    } catch (error) {
        console.error('admin-add-gift-code error:', error);
        return errorResponse('Failed to add gift code: ' + error.message, 500);
    }
}
