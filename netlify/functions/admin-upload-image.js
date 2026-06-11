// Netlify Function: Admin - Upload Image
// Uploads an image to Supabase Storage and returns the public URL
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

        // Verify admin
        const authHeader = event.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };

        const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
        if (!roles || roles.length === 0) return { statusCode: 403, body: JSON.stringify({ error: 'Not authorized' }) };

        // Parse multipart form data
        const body = JSON.parse(event.body);
        const { file_name, file_base64, folder } = body;

        if (!file_name || !file_base64) {
            return { statusCode: 400, body: JSON.stringify({ error: 'file_name and file_base64 required' }) };
        }

        // Decode base64
        const buffer = Buffer.from(file_base64, 'base64');
        const contentType = file_name.endsWith('.png') ? 'image/png'
            : file_name.endsWith('.jpg') || file_name.endsWith('.jpeg') ? 'image/jpeg'
            : file_name.endsWith('.webp') ? 'image/webp'
            : 'image/jpeg';

        const filePath = (folder ? folder + '/' : '') + Date.now() + '-' + file_name;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('site-images')
            .upload(filePath, buffer, {
                contentType: contentType,
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('site-images')
            .getPublicUrl(filePath);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, url: publicUrl, path: filePath })
        };

    } catch (error) {
        console.error('admin-upload-image error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to upload image', details: error.message })
        };
    }
};
