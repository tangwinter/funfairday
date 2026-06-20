// Category Page Logic
document.addEventListener('DOMContentLoaded', function() {
    const colorClasses = ['product-color-1', 'product-color-2', 'product-color-3', 'product-color-4'];
    const placeholderIcons = ['🎨', '📱', '🎭', '💐'];

    // Read category from URL
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('cat');

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

    // Get products for this category
    var categoryProducts = products.filter(function(p) { return p.category === categoryId; });

    if (categoryProducts.length === 0) {
        document.getElementById('productsGrid').innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;">No products available in this category yet.</p>';
        return;
    }

    // Render products
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

    // Check if this category has sub-category grouping
    if (categoryId === 'stickers' && typeof STICKER_GROUPS !== 'undefined') {
        // Group products by their group field
        var groups = {};
        var ungrouped = [];
        categoryProducts.forEach(function(p) {
            if (p.group && STICKER_GROUPS[p.group]) {
                if (!groups[p.group]) groups[p.group] = [];
                groups[p.group].push(p);
            } else {
                ungrouped.push(p);
            }
        });

        var html = '';
        var globalIdx = 0;

        // Render groups in sortOrder
        var groupKeys = Object.keys(STICKER_GROUPS).sort(function(a, b) {
            return STICKER_GROUPS[a].sortOrder - STICKER_GROUPS[b].sortOrder;
        });

        groupKeys.forEach(function(key) {
            var group = STICKER_GROUPS[key];
            var groupProducts = groups[key] || [];
            if (groupProducts.length === 0) return;

            html += '<div class="sticker-section">';
            html += '<div class="sticker-section-header">';
            html += '<img src="' + group.image + '" alt="' + group.name + '" class="sticker-section-img">';
            html += '<h3 class="sticker-section-title">' + group.name + '</h3>';
            html += '</div>';
            html += '<div class="products-grid">';
            groupProducts.forEach(function(product) {
                html += renderProductCard(product, globalIdx);
                globalIdx++;
            });
            html += '</div></div>';
        });

        // Render ungrouped products at the bottom
        if (ungrouped.length > 0) {
            html += '<div class="sticker-section">';
            html += '<div class="products-grid">';
            ungrouped.forEach(function(product) {
                html += renderProductCard(product, globalIdx);
                globalIdx++;
            });
            html += '</div></div>';
        }

        productsGrid.innerHTML = html;
    } else {
        // Flat rendering for other categories
        productsGrid.innerHTML = categoryProducts.map(function(product, index) {
            return renderProductCard(product, index);
        }).join('');
    }

    // Add to cart event listeners - open customization modal
    document.querySelectorAll('.product-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var productId = this.dataset.productId;
            if (window.openCustomizationModal) {
                window.openCustomizationModal(productId);
            }
        });
    });
});
