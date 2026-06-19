// Cloudflare Pages Function: Get All Public Data
// Returns categories, products, settings, phone case styles, and options
export async function onRequest(context) {
    if (context.request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        var supabaseUrl = context.env.SUPABASE_URL;
        var supabaseKey = context.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials not configured');
        }

        var headers = {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + supabaseKey,
            'Accept': 'application/json'
        };

        // Fetch all public data in parallel
        var [categoriesRes, productsRes, settingsRes, caseStylesRes, optionsRes, categoryOptionsRes, phoneModelsRes] = await Promise.all([
            fetch(supabaseUrl + '/rest/v1/categories?select=*&hidden=eq.false&order=id', { headers }),
            fetch(supabaseUrl + '/rest/v1/products?select=*&order=sort_order', { headers }),
            fetch(supabaseUrl + '/rest/v1/site_settings?select=*', { headers }),
            fetch(supabaseUrl + '/rest/v1/phone_case_styles?select=*&order=display_order', { headers }),
            fetch(supabaseUrl + '/rest/v1/options?select=*&order=key', { headers }),
            fetch(supabaseUrl + '/rest/v1/category_options?select=*', { headers }),
            fetch(supabaseUrl + '/rest/v1/phone_models?select=*&order=display_order', { headers })
        ]);

        if (!categoriesRes.ok) throw new Error('categories: HTTP ' + categoriesRes.status);
        if (!productsRes.ok) throw new Error('products: HTTP ' + productsRes.status);
        if (!settingsRes.ok) throw new Error('settings: HTTP ' + settingsRes.status);
        if (!caseStylesRes.ok) throw new Error('caseStyles: HTTP ' + caseStylesRes.status);
        if (!optionsRes.ok) throw new Error('options: HTTP ' + optionsRes.status);
        if (!categoryOptionsRes.ok) throw new Error('categoryOptions: HTTP ' + categoryOptionsRes.status);
        if (!phoneModelsRes.ok) throw new Error('phoneModels: HTTP ' + phoneModelsRes.status);

        var categories = await categoriesRes.json();
        var products = await productsRes.json();
        var settingsData = await settingsRes.json();
        var phoneCaseStyles = await caseStylesRes.json();
        var options = await optionsRes.json();
        var categoryOptionsData = await categoryOptionsRes.json();
        var phoneModels = await phoneModelsRes.json();

        // Convert settings to key-value map
        var settings = {};
        settingsData.forEach(function(s) { settings[s.key] = s.value; });

        // Build category options map
        var categoryOptions = {};
        categoryOptionsData.forEach(function(co) {
            if (!categoryOptions[co.category_id]) {
                categoryOptions[co.category_id] = [];
            }
            categoryOptions[co.category_id].push(co.option_key);
        });

        // Build category customization config
        var categoryCustomization = {};
        categories.forEach(function(cat) {
            categoryCustomization[cat.id] = {
                hasCaseSelection: cat.id !== 'stickers',
                options: categoryOptions[cat.id] || []
            };
        });

        return new Response(JSON.stringify({
            categories: categories,
            products: products,
            settings: settings,
            phoneCaseStyles: phoneCaseStyles,
            phoneModels: phoneModels,
            options: options,
            categoryCustomization: categoryCustomization
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('get-public-data error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch public data',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
