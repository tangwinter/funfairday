// Cloudflare Pages Function: Get Supabase Config
import { jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    var env = context.env;
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        return jsonResponse({ configured: false, debug: { hasUrl: !!env.SUPABASE_URL, hasKey: !!env.SUPABASE_ANON_KEY } });
    }
    return jsonResponse({
        configured: true,
        url: env.SUPABASE_URL,
        anonKey: env.SUPABASE_ANON_KEY,
        working: true
    });
}
