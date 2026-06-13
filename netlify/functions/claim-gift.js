// Netlify Function: Claim a free gift code
// Validates, claims with 30min hold, auto-releases expired holds
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Supabase not configured' })
            };
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { code, session, fulfill } = JSON.parse(event.body);

        if (!code) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No gift code provided' })
            };
        }

        // If fulfill flag is set, mark the gift code as permanently fulfilled
        if (fulfill) {
            const { error: fulfillError } = await supabase
                .from('free_gift_codes')
                .update({ fulfilled: true, claimed: true })
                .eq('code', code);

            if (fulfillError) throw fulfillError;

            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, fulfilled: true })
            };
        }

        // Look up the gift code
        const { data: gift, error: findError } = await supabase
            .from('free_gift_codes')
            .select('*')
            .eq('code', code)
            .single();

        if (findError || !gift) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'invalid', message: 'Gift code not found' })
            };
        }

        const now = new Date().toISOString();

        // Already claimed and fulfilled (permanently taken)
        if (gift.fulfilled) {
            return {
                statusCode: 200,
                body: JSON.stringify({ error: 'claimed', message: 'This gift has already been claimed and fulfilled.' })
            };
        }

        // Currently claimed
        if (gift.claimed) {
            // Same session - they already claimed it
            if (gift.claimed_session === session) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ success: true, already_claimed_by_you: true })
                };
            }

            // Check if the hold has expired (30min)
            const expiresAt = new Date(gift.expires_at).getTime();
            const currentTime = Date.now();

            if (currentTime < expiresAt) {
                // Still within the 30min hold window - cannot claim
                return {
                    statusCode: 200,
                    body: JSON.stringify({ error: 'claimed', message: 'This gift is currently claimed by someone else.' })
                };
            }

            // Hold expired - release and re-claim for this user
            const newExpiresAt = new Date(currentTime + 30 * 60 * 1000).toISOString();
            const { error: updateError } = await supabase
                .from('free_gift_codes')
                .update({
                    claimed: true,
                    claimed_at: now,
                    claimed_session: session,
                    expires_at: newExpiresAt,
                    fulfilled: false
                })
                .eq('code', code);

            if (updateError) throw updateError;

            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, released: true })
            };
        }

        // Not claimed yet - claim it now with 30min hold
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        const { error: claimError } = await supabase
            .from('free_gift_codes')
            .update({
                claimed: true,
                claimed_at: now,
                claimed_session: session,
                expires_at: expiresAt,
                fulfilled: false
            })
            .eq('code', code);

        if (claimError) throw claimError;

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };

    } catch (error) {
        console.error('claim-gift error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server error', details: error.message })
        };
    }
};
