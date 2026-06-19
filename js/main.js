// Main Application Logic
document.addEventListener('DOMContentLoaded', function() {

    const colorClasses = ['product-color-1', 'product-color-2', 'product-color-3', 'product-color-4'];
    const placeholderIcons = ['?嚙踝蕭', '?嚙踝蕭', '?嚙踝蕭', '??'];

    // --- Render Categories on Homepage ---
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (categoriesGrid) {
        function renderCategories() {
            categoriesGrid.innerHTML = categories.map((cat, index) => {
                const colorClass = colorClasses[index % colorClasses.length];
                const imageHtml = cat.image
                    ? `<img src="${cat.image}" alt="${cat.name}">`
                    : `<span class="placeholder-icon">${cat.emoji || placeholderIcons[index % placeholderIcons.length]}</span>`;

                return `
                    <a href="category.html?cat=${cat.id}" class="category-card" style="text-decoration:none;color:inherit;">
                        <div class="product-card">
                            <div class="product-image ${colorClass}">
                                ${imageHtml}
                                ${cat.badge ? `<span class="product-badge">${cat.badge}</span>` : ''}
                            </div>
                            <div class="product-info">
                                <h3 class="product-name">${cat.shortName || cat.name}</h3>
                                <p class="product-desc">${cat.longDescription || cat.description}</p>
                                <span class="product-btn" style="display:block;text-align:center;">Browse Collection</span>
                            </div>
                        </div>
                    </a>
                `;
            }).join('');
        }
    }

    // --- Render YouTube Channels ---
    const youtubeGrid = document.getElementById('youtubeGrid');
    const youtubeChannels = [
        {
            name: 'Natural Flow Studio',
            handle: '@naturalflowstudio26',
            url: 'https://www.youtube.com/@naturalflowstudio26',
            description: 'Creative flow and art tutorials'
        },
        {
            name: 'Beard Care',
            handle: '@Beard-care',
            url: 'https://www.youtube.com/@Beard-care',
            description: 'Beard grooming and styling tips'
        }
    ];

    if (youtubeGrid) {
        // Fetch latest video thumbnails
        (async function loadYouTubeThumbnails() {
            try {
                const response = await fetch('/get-latest-video', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ channels: youtubeChannels.map(c => c.handle) })
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.thumbnails) {
                        data.thumbnails.forEach((thumb, i) => {
                            if (youtubeChannels[i]) {
                                youtubeChannels[i].thumbnail = thumb;
                            }
                        });
                    }
                }
            } catch (e) {
                console.log('YouTube thumbnails unavailable, using fallback');
            }
            renderYouTubeChannels();
        })();

        function renderYouTubeChannels() {
            youtubeGrid.innerHTML = youtubeChannels.map(channel => `
                <a href="${channel.url}" target="_blank" rel="noopener" class="youtube-card"${channel.thumbnail ? ` style="background-image:url(${channel.thumbnail});background-size:cover;background-position:center;"` : ''}>
                    ${channel.thumbnail ? `<div class="youtube-overlay"></div>` : ''}
                    <div class="youtube-icon"${channel.thumbnail ? ` style="color:white;"` : ''}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                    </div>
                    <div class="youtube-info">
                        <span class="youtube-name"${channel.thumbnail ? ` style="color:white;"` : ''}>${channel.name}</span>
                        <span class="youtube-desc"${channel.thumbnail ? ` style="color:rgba(255,255,255,0.8);"` : ''}>${channel.description}</span>
                    </div>
                </a>
            `).join('');
        }
    }

    // --- Cart UI ---
    const cartPanel = document.getElementById('cartPanel');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    const cartBadge = document.getElementById('cartBadge');
    const checkoutBtn = document.getElementById('checkoutBtn');

    function openCart() {
        cartPanel.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        renderCartItems();
    }

    function closeCart() {
        cartPanel.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && cartPanel.classList.contains('active')) {
            closeCart();
        }
    });

    function renderCartItems() {
        const items = Cart.getItems();
        const emptyState = document.querySelector('.cart-empty');

        if (items.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'flex';
            } else {
                // Recreate empty state if it was destroyed by innerHTML
                cartItems.innerHTML = '<div class="cart-empty">' +
                    '<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                    '<circle cx="9" cy="21" r="1"></circle>' +
                    '<circle cx="20" cy="21" r="1"></circle>' +
                    '<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>' +
                    '</svg>' +
                    '<p>Your cart is empty</p></div>';
