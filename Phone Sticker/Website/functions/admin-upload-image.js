// Cloudflare Pages Function: Admin - Upload Image to Supabase Storage
import { verifyAdmin, jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        var user = await verifyAdmin(context.request, context.env);
        if (!user) return errorResponse('Not authorized', 403);

        var { file_name, file_base64, folder } = await context.request.json();

        if (!file_name || !file_base64) {
            return errorResponse('file_name and file_base64 required', 400);
        }

        // Decode base64 using Workers-compatible approach
        var binaryStr = atob(file_base64);
        var bytes = new Uint8Array(binaryStr.length);
        for (var i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }

        var contentType = file_name.endsWith('.png') ? 'image/png'
            : file_name.endsWith('.jpg') || file_name.endsWith('.jpeg') ? 'image/jpeg'
            : file_name.endsWith('.webp') ? 'image/webp'
            : 'image/jpeg';

        var filePath = (folder ? folder + '/' : '') + Date.now() + '-' + file_name;

        // Upload to Supabase Storage REST API
        var uploadUrl = context.env.SUPABASE_URL + '/storage/v1/object/site-images/' + filePath;
        var uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + context.env.SUPABASE_SERVICE_KEY,
                'Content-Type': contentType
            },
            body: bytes
        });

        if (!uploadRes.ok) {
            var text = await uploadRes.text();
            throw new Error('Upload failed: HTTP ' + uploadRes.status + ' ' + text.slice(0, 200));
        }

        // Get public URL
        var publicUrl = context.env.SUPABASE_URL + '/storage/v1/object/public/site-images/' + filePath;

        return jsonResponse({ success: true, url: publicUrl, path: filePath });

    } catch (error) {
        console.error('admin-upload-image error:', error);
        return errorResponse('Failed to upload image: ' + error.message, 500);
    }
}
