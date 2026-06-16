// Netlify Function: Get All Public Data
// Returns categories, products, settings, phone case styles, and options
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials not configured');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch all public data in parallel
        const [
            categoriesResult,
            productsResult,
            settingsResult,
            caseStylesResult,
            optionsResult,
            categoryOptionsResult,
            phoneModelsResult
        ] = await Promise.all([
            supabase.from('categories').select('*').eq('hidden', false).order('id'),
            supabase.from('products').select('*').order('sort_order'),
            supabase.from('site_settings').select('*'),
            supabase.from('phone_case_styles').select('*').order('display_order'),
            supabase.from('options').select('*').order('key'),
            supabase.from('category_options').select('*'),
            supabase.from('phone_models').select('*').order('display_order')
        ]);

        // Check for errors
        if (categoriesResult.error) throw categoriesResult.error;
        if (productsResult.error) throw productsResult.error;
        if (settingsResult.error) throw settingsResult.error;
        if (caseStylesResult.error) throw caseStylesResult.error;
        if (optionsResult.error) throw optionsResult.error;
        if (categoryOptionsResult.error) throw categoryOptionsResult.error;
        if (phoneModelsResult.error) throw phoneModelsResult.error;

        // Convert settings to key-value map
        const settings = {};
        settingsResult.data.forEach(s => {
            settings[s.key] = s.value;
        });

        // Build category options map
        const categoryOptions = {};
        categoryOptionsResult.data.forEach(co => {
            if (!categoryOptions[co.category_id]) {
                categoryOptions[co.category_id] = [];
            }
            categoryOptions[co.category_id].push(co.option_key);
        });

        // Build category customization config matching existing frontend format
        const categoryCustomization = {};
        categoriesResult.data.forEach(cat => {
            categoryCustomization[cat.id] = {
                hasCaseSelection: cat.id !== 'stickers',
                options: categoryOptions[cat.id] || []
            };
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                categories: categoriesResult.data,
                products: productsResult.data,
                settings: settings,
                phoneCaseStyles: caseStylesResult.data,
                phoneModels: phoneModelsResult.data,
                options: optionsResult.data,
                categoryCustomization: categoryCustomization
            })
        };

    } catch (error) {
        console.error('get-public-data error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to fetch public data',
                details: error.message
            })
        };
    }
};
