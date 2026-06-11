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
    const categoryProducts = products.filter(p => p.category === categoryId);

    if (categoryProducts.length === 0) {
        document.getElementById('productsGrid').innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;">No products available in this category yet.</p>';
        return;
    }

    // Render products
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = categoryProducts.map((product, index) => {
        const colorClass = colorClasses[index % colorClasses.length];
        const icon = placeholderIcons[index % placeholderIcons.length];
        const imageHtml = product.image
            ? `<img src="${product.image}" alt="${product.name}">`
            : `<span class="placeholder-icon">${icon}</span>`;

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image ${colorClass}">
                    ${imageHtml}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="product-btn" data-product-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add to cart event listeners - open customization modal
    document.querySelectorAll('.product-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            if (window.openCustomizationModal) {
                window.openCustomizationModal(productId);
            }
        });
    });
});
