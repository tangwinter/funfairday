// Cloudflare Pages Function: Claim a free gift code
// Validates, claims with 30min hold, auto-releases expired holds
import { jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var supabaseUrl = context.env.SUPABASE_URL;
        var supabaseKey = context.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return errorResponse('Supabase not configured', 500);
        }

        const authHeaders = {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + supabaseKey,
            'Accept': 'application/json'
        };

        var { code, session, fulfill } = await context.request.json();

        if (!code) {
            return errorResponse('No gift code provided', 400);
        }

        // If fulfill flag is set, mark the gift code as permanently fulfilled
        if (fulfill) {
            var fulfillUrl = supabaseUrl + '/rest/v1/free_gift_codes?code=eq.' + encodeURIComponent(code);
            var fulfillRes = await fetch(fulfillUrl, {
                method: 'PATCH',
                headers: Object.assign({}, authHeaders, { 'Content-Type': 'application/json' }),
                body: JSON.stringify({ fulfilled: true, claimed: true })
            });

            if (!fulfillRes.ok) {
                var fulfillText = await fulfillRes.text();
                throw new Error('Failed to fulfill: ' + fulfillText.slice(0, 200));
            }

            return jsonResponse({ success: true, fulfilled: true });
        }

        // Look up the gift code
        var findUrl = supabaseUrl + '/rest/v1/free_gift_codes?code=eq.' + encodeURIComponent(code) + '&select=*';
        var findRes = await fetch(findUrl, { headers: authHeaders });

        if (!findRes.ok) {
            var findText = await findRes.text();
            throw new Error('Failed to lookup code: ' + findText.slice(0, 200));
        }

        var gifts = await findRes.json();
        var gift = gifts && gifts.length > 0 ? gifts[0] : null;

        if (!gift) {
            return jsonResponse({ error: 'invalid', message: 'Gift code not found' }, 404);
        }

        var now = new Date().toISOString();

        // Already claimed and fulfilled (permanently taken)
        if (gift.fulfilled) {
            return jsonResponse({ error: 'claimed', message: 'This gift has already been claimed and fulfilled.' });
        }

        // Currently claimed
        if (gift.claimed) {
            // Same session - they already claimed it
            if (gift.claimed_session === session) {
                return jsonResponse({ success: true, already_claimed_by_you: true });
            }

            // Check if the hold has expired (30min)
            var expiresAt = new Date(gift.expires_at).getTime();
            var currentTime = Date.now();

            if (currentTime < expiresAt) {
                // Still within the 30min hold window - cannot claim
                return jsonResponse({ error: 'claimed', message: 'This gift is currently claimed by someone else.' });
            }

            // Hold expired - release and re-claim for this user
            var newExpiresAt = new Date(currentTime + 30 * 60 * 1000).toISOString();
            var updateUrl = supabaseUrl + '/rest/v1/free_gift_codes?code=eq.' + encodeURIComponent(code);
            var updateRes = await fetch(updateUrl, {
                method: 'PATCH',
                headers: Object.assign({}, authHeaders, { 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    claimed: true,
                    claimed_at: now,
                    claimed_session: session,
                    expires_at: newExpiresAt,
                    fulfilled: false
                })
            });

            if (!updateRes.ok) {
                var updateText = await updateRes.text();
                throw new Error('Failed to update hold: ' + updateText.slice(0, 200));
            }

            return jsonResponse({ success: true, released: true });
        }

        // Not claimed yet - claim it now with 30min hold
        var expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        var claimUrl = supabaseUrl + '/rest/v1/free_gift_codes?code=eq.' + encodeURIComponent(code);
        var claimRes = await fetch(claimUrl, {
            method: 'PATCH',
            headers: Object.assign({}, authHeaders, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                claimed: true,
                claimed_at: now,
                claimed_session: session,
                expires_at: expiresAt,
                fulfilled: false
            })
        });

        if (!claimRes.ok) {
            var claimText = await claimRes.text();
            throw new Error('Failed to claim: ' + claimText.slice(0, 200));
        }

        return jsonResponse({ success: true });

    } catch (error) {
        console.error('claim-gift error:', error);
        return errorResponse('Server error: ' + error.message, 500);
    }
}
