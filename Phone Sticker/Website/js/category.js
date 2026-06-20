// Category Page Logic
document.addEventListener('DOMContentLoaded', function() {
    const colorClasses = ['product-color-1', 'product-color-2', 'product-color-3', 'product-color-4'];
    const placeholderIcons = ['🎨', '📱', '🎭', '💐'];

    // Read category from URL
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('cat');
    const groupParam = params.get('group');

    if (!categoryId) {
        document.getElementById('categoryTitle').textContent = 'Category Not Found';
        document.getElementById('productsGrid').innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;">Please select a category from the homepage.</p>';
        return;
    }

    // Find category info
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
        document.getElementById('categoryTitle').textContent = 'Category Not Found';
        document.getElementById('productsGrid').innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;">This category does not exist.</p>';
        return;
    }

    // Set page title and description
    document.title = category.name + ' - FunFairDay';
    document.getElementById('categoryTitle').textContent = category.shortName || category.name;
    document.getElementById('categoryDesc').textContent = category.longDescription || category.description;

    var productsGrid = document.getElementById('productsGrid');

    // Helper: render a single product card
    function renderProductCard(product, idx) {
        var colorClass = colorClasses[idx % colorClasses.length];
        var icon = placeholderIcons[idx % placeholderIcons.length];
        var imageHtml = product.image
            ? '<img src="' + product.image + '" alt="' + product.name + '">'
            : '<span class="placeholder-icon">' + icon + '</span>';
        return [
            '<div class="product-card" data-product-id="' + product.id + '">',
                '<div class="product-image ' + colorClass + '">',
                    imageHtml,
                '</div>',
                '<div class="product-info">',
                    '<h3 class="product-name">' + product.name + '</h3>',
                    '<p class="product-desc">' + product.description + '</p>',
                    '<div class="product-price">$' + product.price.toFixed(2) + '</div>',
                    '<button class="product-btn" data-product-id="' + product.id + '">Add to Cart</button>',
                '</div>',
            '</div>'
        ].join('');
    }

    // Check if this is the Sticker Jar main page (show sub-category cards)
    if (categoryId === 'stickers' && !groupParam && typeof STICKER_GROUPS !== 'undefined') {
        // Show sub-category cards for 3D Sticker and Fluffy Sticker
        document.getElementById('categoryDesc').textContent = 'Choose a sticker collection to browse';

        var groupKeys = Object.keys(STICKER_GROUPS).sort(function(a, b) {
            return STICKER_GROUPS[a].sortOrder - STICKER_GROUPS[b].sortOrder;
        });

        productsGrid.innerHTML = groupKeys.map(function(key, idx) {
            var group = STICKER_GROUPS[key];
            var colorClass = colorClasses[idx % colorClasses.length];
            return [
                '<a href="category.html?cat=stickers&group=' + key + '" class="category-card" style="text-decoration:none;color:inherit;">',
                    '<div class="product-card">',
                        '<div class="product-image ' + colorClass + '">',
                            '<img src="' + group.image + '" alt="' + group.name + '">',
                        '</div>',
                        '<div class="product-info">',
                            '<h3 class="product-name">' + group.name + '</h3>',
                            '<span class="product-btn" style="display:block;text-align:center;">Browse Collection</span>',
                        '</div>',
                    '</div>',
                '</a>'
            ].join('');
        }).join('');

        return; // Stop here - no product event listeners needed
    }

    // Check if viewing a specific sticker group
    if (categoryId === 'stickers' && groupParam && typeof STICKER_GROUPS !== 'undefined' && STICKER_GROUPS[groupParam]) {
        var group = STICKER_GROUPS[groupParam];
        document.title = group.name + ' - FunFairDay';
        document.getElementById('categoryTitle').textContent = group.name;
        document.getElementById('categoryDesc').textContent = 'Browse our ' + group.name + ' collection';

        // Filter products for this group
        var groupProducts = products.filter(function(p) {
            return p.category === 'stickers' && p.group === groupParam;
        });

        if (groupProducts.length === 0) {
            productsGrid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;">No products in this collection yet.</p>';
            return;
        }

        // Show back link + products grid
        productsGrid.innerHTML =
            '<a href="category.html?cat=stickers" class="back-link" style="display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-weight:600;font-size:0.95rem;margin-bottom:20px;text-decoration:none;">&larr; Back to Sticker Jar</a>' +
            '<div class="products-grid">' +
            groupProducts.map(function(product, idx) {
                return renderProductCard(product, idx);
            }).join('') +
            '</div>';

        // Add to cart event listeners
        document.querySelectorAll('.product-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var productId = this.dataset.productId;
                if (window.openCustomizationModal) {
                    window.openCustomizationModal(productId);
                }
            });
        });

        return;
    }

    // Get products for this category (other categories or fallback)
    var categoryProducts = products.filter(function(p) { return p.category === categoryId; });

    if (categoryProducts.length === 0) {
        document.getElementById('productsGrid').innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;">No products available in this category yet.</p>';
        return;
    }

    // Flat rendering for other categories
    productsGrid.innerHTML = categoryProducts.map(function(product, index) {
        return renderProductCard(product, index);
    }).join('');

    // Add to cart event listeners
    document.querySelectorAll('.product-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var productId = this.dataset.productId;
            if (window.openCustomizationModal) {
                window.openCustomizationModal(productId);
            }
        });
    });
});
