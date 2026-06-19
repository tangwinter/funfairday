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
            if (emptyState) emptyState.style.display = 'flex';
            cartFooter.style.display = 'none';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        cartFooter.style.display = 'block';

        cartItems.innerHTML = items.map(item => {
            var isFreeGift = (item.id === 'free-sticker-gift');
            const colorIndex = products.findIndex(p => p.id === item.id) % colorClasses.length;
            const colorClass = colorClasses[colorIndex >= 0 ? colorIndex : 0];
            const icon = placeholderIcons[colorIndex >= 0 ? colorIndex : 0];

            var customDetails = '';
            if (item.caseStyle) {
                customDetails = '<div class="cart-item-custom">';
                if (item.phoneModel) {
                    customDetails += '<span>Model: ' + item.phoneModel + '</span>';
                }
                customDetails += '<span>Case: ' + item.caseStyle + ' (' + item.caseColor + ')</span>';
                if (item.optionsText) {
                    customDetails += '<span>Options: ' + item.optionsText + '</span>';
                }
                customDetails += '</div>';
            }

             return `
                <div class="cart-item" data-product-id="${item.id}">
                    <div class="cart-item-image ${colorClass}">
                        <span>${icon}</span>
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${Cart.isDiscountActive() ? '<span class="price-original">$' + item.price.toFixed(2) + '</span><span class="price-discounted">$' + Cart.getDiscountedPrice(item.price).toFixed(2) + '</span> each' : '$' + item.price.toFixed(2) + ' each'}</div>
                        ${customDetails}
                        <div class="cart-item-actions">
                            <button class="cart-qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                            <span class="cart-item-qty">${item.quantity}</span>
                            <button class="cart-qty-btn" data-action="increase" data-id="${item.id}"${isFreeGift ? ' disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>+</button>
                            <button class="cart-item-remove" data-action="remove" data-id="${item.id}">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="cart-item-total">${Cart.isDiscountActive() ? '<span class="price-original">$' + (item.price * item.quantity).toFixed(2) + '</span><span class="price-discounted">$' + Cart.getDiscountedPrice(item.price * item.quantity).toFixed(2) + '</span>' : '$' + (item.price * item.quantity).toFixed(2)}</div>
                </div>
            `;
        }).join('');

        var subtotal = Cart.getTotal();
        var shipCost = window._shippingCost || 0;
        var totalWithShipping = subtotal + shipCost;
        cartTotal.textContent = '$' + totalWithShipping.toFixed(2);
        var subEl = document.getElementById('cartSubtotal');
        if (subEl) subEl.textContent = '$' + subtotal.toFixed(2);

        // Show free shipping threshold banner
        var freeThresholdEl = document.getElementById('cartFreeThreshold');
        if (!freeThresholdEl) {
            var shippingSection = document.querySelector('.cart-shipping');
            if (shippingSection) {
                var banner = document.createElement('div');
                banner.id = 'cartFreeThreshold';
                banner.className = 'cart-free-threshold';
                shippingSection.parentNode.insertBefore(banner, shippingSection.nextSibling);
                freeThresholdEl = banner;
            }
        }
        if (freeThresholdEl) {
            var hasFreeGift2 = items.some(function(item) {
                return item.id === 'free-sticker-gift' || item.productId === 'free-sticker-gift';
            });
            if (hasFreeGift2 || subtotal >= SHIP_FREE_THRESHOLD) {
                freeThresholdEl.style.display = 'none';
            } else {
                var needed = (SHIP_FREE_THRESHOLD - subtotal).toFixed(2);
                freeThresholdEl.innerHTML = 'Add US$' + needed + ' more for <strong>Free Shipping</strong>!';
                freeThresholdEl.style.display = 'block';
            }
        }
    }

    // Event delegation for cart actions (more reliable than per-item listeners)
    cartItems.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;

        var id = btn.dataset.id;
        var action = btn.dataset.action;

        if (action === 'remove') {
            Cart.removeItem(id);
        } else if (action === 'increase') {
            var item = Cart.getItems().find(function(i) { return i.id === id; });
            if (!item) return;
            // Prevent increasing free sticker quantity
            if (item.id === 'free-sticker-gift') return;
            Cart.updateQuantity(id, item.quantity + 1);
        } else if (action === 'decrease') {
            var item = Cart.getItems().find(function(i) { return i.id === id; });
            if (!item) return;
            Cart.updateQuantity(id, item.quantity - 1);
        }

        // Mark shipping as stale so it recalculates on next checkout
        window._shippingCost = undefined;
        renderCartItems();
        updateCartBadge();

        // Recalculate shipping if country is selected
        var countrySelect = document.getElementById('shippingCountry');
        if (countrySelect && countrySelect.value) {
            window._calculateShipping(countrySelect.value);
        }
    });

    function updateCartBadge() {
        const count = Cart.getItemCount();
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    function updateCartUI() {
        updateCartBadge();
        if (cartPanel.classList.contains('active')) {
            renderCartItems();
        }
    }

    Cart.onUpdate = function() {
        updateCartUI();
    };

    updateCartBadge();

    // --- Checkout ---
    checkoutBtn.addEventListener('click', async function() {
        const items = Cart.getItems();
        if (items.length === 0) return;

        // Require shipping destination selection
        var countrySelect = document.getElementById('shippingCountry');
        var selectedCountry = countrySelect ? countrySelect.value : '';
        if (!selectedCountry) {
            showToast('Please select a shipping destination first.');
            this.disabled = false;
            this.textContent = 'Checkout';
            if (countrySelect) countrySelect.focus();
            return;
        }

        // Auto-calculate shipping if not yet done
        if (window._shippingCost === undefined) {
            try {
                await window._calculateShipping(selectedCountry);
            } catch(e) {
                console.error('Checkout shipping error:', e);
                showToast('Shipping error: ' + e.message);
                this.disabled = false;
                this.textContent = 'Checkout';
                return;
            }
        }

        this.disabled = true;
        this.textContent = 'Processing...';

        // Helper to proceed with actual checkout
        var proceedCheckout = async function() {
            try {
                const updatedItems = Cart.getItems();

                // Collect customization data for each item
                const cartItems = updatedItems.map(function(item) {
                    return {
                        id: item.id,
                        productId: item.productId || item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        caseStyle: item.caseStyle || null,
                        caseColor: item.caseColor || null,
                        phoneModel: item.phoneModel || null,
                        optionsText: item.optionsText || null
                    };
                });

                // Add gift code and discount info to cartItems for order tracking
                var giftCode = localStorage.getItem('funfairday_gift_code');
                if (giftCode) cartItems._giftCode = giftCode;
                if (Cart.isDiscountActive()) cartItems._discount30 = 'true';

                if (!CONFIG.stripeReady) {
                    showToast('Stripe payment not yet configured. Set up products in Stripe Dashboard first.');
                    checkoutBtn.disabled = false;
                    checkoutBtn.textContent = 'Checkout';
                    return;
                }

                var discountActive = Cart.isDiscountActive();
                // Determine if we need dynamic pricing (no pre-configured Stripe price IDs)
                var hasItemsWithoutPriceId = updatedItems.some(function(item) {
                    var prod = products.find(function(p) { return p.id === item.id; });
                    return prod && !prod.stripePriceId;
                });
                var useDynamicPrices = discountActive || hasItemsWithoutPriceId;

                // Build items for Stripe (exclude $0 free gift items without priceId)
                var stripeItems = updatedItems
                    .filter(function(item) {
                        var prod = products.find(function(p) { return p.id === item.id; });
                        return prod && (prod.stripePriceId || useDynamicPrices);
                    })
                    .map(function(item) {
                        var prod = products.find(function(p) { return p.id === item.id; });
                        var basePrice = prod ? prod.price : item.price;
                        var unitAmount = useDynamicPrices ? Math.round(basePrice * (discountActive ? 0.7 : 1.0) * 100) : null;
                        return {
                            priceId: prod ? prod.stripePriceId : null,
                            name: item.name,
                            unitAmount: unitAmount,
                            quantity: item.quantity
                        };
                    });

                if (stripeItems.length === 0) {
                    showToast('No payable items in cart.');
                    checkoutBtn.disabled = false;
                    checkoutBtn.textContent = 'Checkout';
                    return;
                }

                var response = await fetch('/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: stripeItems,
                        cartItems: cartItems,
                        total: Cart.getTotal(),
                        shippingFee: window._shippingCost || 0,
                        shippingMethod: window._shippingMethod || '',
                        successUrl: CONFIG.successUrl,
                        cancelUrl: CONFIG.cancelUrl,
                        useDynamicPrices: useDynamicPrices
                    })
                });

                if (!response.ok) throw new Error('Checkout request failed');
                var data = await response.json();

                if (data.url) {
                    // Store cart data in session for order creation after checkout
                    sessionStorage.setItem('checkout_cart', JSON.stringify(cartItems));
                    sessionStorage.setItem('checkout_total', Cart.getTotal().toString());
                    sessionStorage.setItem('checkout_shipping', JSON.stringify({
                        cost: window._shippingCost || 0,
                        method: window._shippingMethod || '',
                        methodId: window._selectedMethodId || '',
                        country: selectedCountry
                    }));
                    window.location.href = data.url;
                } else {
                    throw new Error('No checkout URL');
                }

            } catch (error) {
                console.error('Checkout error:', error);
                showToast('Unable to process checkout. Please try again later.');
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Checkout';
            }
        };

        // Check if bundle offer should be shown
        var bundleInCart = Cart.getItems().some(function(i) { return i.id === 'bundle-5pcs-stick' || i.productId === 'bundle-5pcs-stick'; });

        if (!bundleInCart) {
            // Show bundle offer popup
            var bundleProduct = products.find(function(p) { return p.id === 'bundle-5pcs-stick'; });
            if (bundleProduct) {
                var bundlePrice = Cart.isDiscountActive()
                    ? '$' + Cart.getDiscountedPrice(bundleProduct.price).toFixed(2)
                    : '$' + bundleProduct.price.toFixed(2);

                showPopup({
                    icon: '??',
                    title: 'Special Offer for You!',
                    text: 'Get 5pcs Stick Bundle Pack at ' + bundlePrice + ' only!\n(50% off - was US$16, now US$8)',
                    buttons: [
                        {
                            label: 'Add to Cart',
                            className: 'btn-primary',
                            action: function() {
                                Cart.addItem(bundleProduct, 1);
                                showToast('5pcs Stick Bundle Pack added to cart!');
                                updateCartUI();
                                openCart();
                                // Now proceed to checkout
                                setTimeout(function() { proceedCheckout(); }, 500);
                            }
                        },
                        {
                            label: 'Keep Checkout',
                            className: 'btn-secondary',
                            action: function() {
                                proceedCheckout();
                            }
                        }
                    ]
                });
                this.disabled = false;
                this.textContent = 'Checkout';
                return;
            }
        }

        // Check if free shipping popup should be shown
        var hasFreeGiftCheck = items.some(function(i) { return i.id === 'free-sticker-gift' || i.productId === 'free-sticker-gift'; });
        var subtotalCheck = Cart.getTotal();
        var isShippingFree = hasFreeGiftCheck || subtotalCheck >= SHIP_FREE_THRESHOLD;

        if (!isShippingFree && subtotalCheck < SHIP_FREE_THRESHOLD) {
            var needed = (SHIP_FREE_THRESHOLD - subtotalCheck).toFixed(2);
            this.disabled = false;
            this.textContent = 'Checkout';
            showPopup({
                icon: '??',
                title: 'Free Shipping Available!',
                text: 'Add US$' + needed + ' more to your order and get Free Shipping!',
                buttons: [
                    {
                        label: 'Continue to Checkout',
                        className: 'btn-primary',
                        action: function() {
                            proceedCheckout();
                        }
                    },
                    {
                        label: 'Keep Shopping',
                        className: 'btn-secondary',
                        action: function() {
                            closeCart();
                        }
                    }
                ]
            });
            return;
        }

        // No bundle offer needed, proceed directly
        proceedCheckout.call(this);
    });

    // --- Shipping ---
    var SHIPPING_COUNTRIES = [
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'AU', name: 'Australia' },
        { code: 'NZ', name: 'New Zealand' },
        { code: 'FR', name: 'France' },
        { code: 'DE', name: 'Germany' },
        { code: 'IT', name: 'Italy' },
        { code: 'ES', name: 'Spain' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'CH', name: 'Switzerland' },
        { code: 'SE', name: 'Sweden' },
        { code: 'NO', name: 'Norway' },
        { code: 'DK', name: 'Denmark' },
        { code: 'BE', name: 'Belgium' },
        { code: 'AT', name: 'Austria' },
        { code: 'IE', name: 'Ireland' },
        { code: 'PT', name: 'Portugal' },
        { code: 'GR', name: 'Greece' },
        { code: 'PL', name: 'Poland' },
        { code: 'CZ', name: 'Czech Republic' },
        { code: 'JP', name: 'Japan' },
        { code: 'KR', name: 'South Korea' },
        { code: 'SG', name: 'Singapore' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'TH', name: 'Thailand' },
        { code: 'PH', name: 'Philippines' },
        { code: 'ID', name: 'Indonesia' },
        { code: 'VN', name: 'Vietnam' },
        { code: 'CN', name: 'China' },
        { code: 'TW', name: 'Taiwan' },
        { code: 'AE', name: 'United Arab Emirates' },
        { code: 'SA', name: 'Saudi Arabia' },
        { code: 'ZA', name: 'South Africa' },
        { code: 'MX', name: 'Mexico' },
        { code: 'BR', name: 'Brazil' },
        { code: 'HK', name: 'Hong Kong' },
        { code: 'AR', name: 'Argentina' }
    ];

    // Global shipping state
    window._shippingMethods = [];
    window._selectedMethodId = '';
    window._shippingCost = undefined;
    window._shippingMethod = '';

    // Populate country dropdown
    (function populateCountries() {
        var select = document.getElementById('shippingCountry');
        if (!select) return;
        SHIPPING_COUNTRIES.forEach(function(c) {
            var opt = document.createElement('option');
            opt.value = c.code;
            opt.textContent = c.name;
            select.appendChild(opt);
        });
        // Country select starts empty ??user must choose
    })();

    // Render shipping method radio buttons (or fallback to old #shippingInfo)
    function renderShippingMethods(methods, freeGift) {
        var container = document.getElementById('shippingMethods');
        var infoEl = document.getElementById('shippingInfo');
        var freeEl = document.getElementById('shippingFree');

        // Fallback: if #shippingMethods not on page, use old #shippingInfo
        if (!container) {
            if (infoEl) {
                if (!methods || methods.length === 0) {
                    infoEl.style.display = 'none';
                } else {
                    var firstMethod = methods[0];
                    var methodEl = document.getElementById('shippingMethod');
                    var costEl = document.getElementById('shippingCost');
                    if (methodEl) methodEl.textContent = firstMethod.name;
                    if (costEl) costEl.textContent = '$' + firstMethod.cost.toFixed(2);
                    infoEl.style.display = 'flex';
                    window._selectedMethodId = firstMethod.id;
                    window._shippingCost = firstMethod.cost;
                    window._shippingMethod = firstMethod.name;
                    updateShippingLine();
                }
            }
            return;
        }

        if (freeGift || !methods || methods.length === 0) {
            container.style.display = 'none';
            if (infoEl) infoEl.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        if (infoEl) infoEl.style.display = 'none';
        container.innerHTML = '<div class="ship-methods-label">Shipping Method:</div>' +
            methods.map(function(m, idx) {
                var checked = idx === 0 ? ' checked' : '';
                return '<label class="ship-method-option' + (idx === 0 ? ' selected' : '') + '">' +
                    '<input type="radio" name="shippingMethod" value="' + m.id + '" data-cost="' + m.cost + '" data-name="' + m.name + '"' + checked + '>' +
                    '<div class="ship-method-info">' +
                        '<span class="ship-method-name">' + m.name + '</span>' +
                        '<span class="ship-method-cost">$' + m.cost.toFixed(2) + '</span>' +
                        '<span class="ship-method-time">' + m.deliveryTime + '</span>' +
                    '</div>' +
                '</label>';
            }).join('');

        // Auto-select first method
        var firstRadio = container.querySelector('input[type="radio"]');
        if (firstRadio) {
            firstRadio.checked = true;
            window._selectedMethodId = firstRadio.value;
            window._shippingCost = parseFloat(firstRadio.dataset.cost);
            window._shippingMethod = firstRadio.dataset.name;
            updateShippingLine();
        }

        // Listen for radio changes
        container.querySelectorAll('input[type="radio"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                if (!this.checked) return;
                window._selectedMethodId = this.value;
                window._shippingCost = parseFloat(this.dataset.cost);
                window._shippingMethod = this.dataset.name;
                // Highlight selected
                container.querySelectorAll('.ship-method-option').forEach(function(lbl) {
                    lbl.classList.remove('selected');
                });
                this.closest('.ship-method-option').classList.add('selected');
                updateShippingLine();
            });
        });
    }

    function updateShippingLine() {
        var lineEl = document.getElementById('shippingLine');
        var lineCostEl = document.getElementById('shippingLineCost');
        if (!lineEl) return;
        lineEl.style.display = 'flex';
        if (lineCostEl) lineCostEl.textContent = '$' + (window._shippingCost || 0).toFixed(2);
        updateCartUI();
    }

    // ----- Speedpost (overseas) & EC-GET (Hong Kong local) shipping -----
    // Speedpost rates from HK Post: https://webapp.hongkongpost.hk/en/postage_calculator2/speedpost.html
    // EC-GET rates from HK Post: https://www.hongkongpost.hk/en/sending_mail/local/ec_get/index.html
    var HKD_USD_RATE = 7.8;
    var SHIP_FREE_THRESHOLD = 50;

    // Speedpost 0.5kg base rates per country (HKD)
    var SHIP_SPEEDPOST_RATES = {
        'US': 375, 'CA': 265,
        'GB': 321, 'FR': 300, 'DE': 341, 'IT': 343, 'ES': 325,
        'NL': 303, 'BE': 272, 'CH': 350, 'SE': 383, 'NO': 392,
        'DK': 338, 'AT': 310, 'IE': 284, 'PT': 290, 'GR': 314,
        'PL': 352, 'CZ': 298,
        'AU': 247, 'NZ': 212,
        'JP': 209, 'KR': 260, 'SG': 191, 'MY': 200, 'TH': 180,
        'PH': 208, 'ID': 211, 'VN': 198,
        'CN': 168, 'TW': 237,
        'ZA': 284,
        'MX': 322, 'BR': 287, 'AR': 336
    };

    // EC-GET Hong Kong local rates (HKD) ??Special offer until Jun 2026
    var SHIP_ECGET_RATES = [
        { maxG: 500, cost: 10 },
        { maxG: 2000, cost: 13 },
        { maxG: 5000, cost: 20 },
        { maxG: 10000, cost: 30 },
        { maxG: 20000, cost: 45 }
    ];

    // Speedpost delivery time estimates (working days)
    var SHIP_SPEEDPOST_EDD = {
        'JP': '1-3 days', 'KR': '2-3 days', 'TW': '2-3 days',
        'SG': '1-3 days', 'MY': '2-3 days', 'TH': '2-3 days',
        'PH': '2-3 days', 'ID': '2-3 days', 'VN': '2-3 days',
        'CN': '1-3 days',
        'AU': '2-3 days', 'NZ': '2-3 days',
        'GB': '2-4 days', 'IE': '2-4 days', 'FR': '2-4 days',
        'DE': '2-4 days', 'IT': '2-4 days', 'ES': '2-4 days',
        'PT': '2-4 days', 'NL': '2-4 days', 'BE': '2-4 days',
        'CH': '2-4 days', 'AT': '2-4 days', 'SE': '2-4 days',
        'NO': '2-4 days', 'DK': '2-4 days',
        'GR': '2-4 days', 'PL': '2-4 days', 'CZ': '2-4 days',
        'ZA': '3-5 days',
        'US': '1-4 days', 'CA': '2-4 days',
        'MX': '2-5 days', 'BR': '3-5 days', 'AR': '3-5 days'
    };

    // Note: UAE (AE) and Saudi Arabia (SA) have no Speedpost service from HK Post.
    // They remain in the country list for reference but rates will use fallback pricing.

    function _shipGetSpeedpostRate(countryCode, totalGrams) {
        var code = countryCode.toUpperCase();
        var baseRateHkd = SHIP_SPEEDPOST_RATES[code];
        if (!baseRateHkd) baseRateHkd = 375; // fallback
        var rateHkd;
        if (totalGrams <= 500) {
            rateHkd = baseRateHkd;
        } else if (totalGrams <= 1000) {
            rateHkd = baseRateHkd * 1.3;
        } else if (totalGrams <= 2000) {
            rateHkd = baseRateHkd * 1.8;
        } else {
            rateHkd = baseRateHkd * 2.5;
        }
        return Math.round((rateHkd / HKD_USD_RATE) * 100) / 100;
    }

    function _shipGetECGETRate(totalGrams) {
        for (var i = 0; i < SHIP_ECGET_RATES.length; i++) {
            if (totalGrams <= SHIP_ECGET_RATES[i].maxG) {
                return Math.round((SHIP_ECGET_RATES[i].cost / HKD_USD_RATE) * 100) / 100;
            }
        }
        return Math.round((SHIP_ECGET_RATES[SHIP_ECGET_RATES.length - 1].cost / HKD_USD_RATE) * 100) / 100;
    }

    function _shipGetDeliveryTime(countryCode) {
        var code = countryCode.toUpperCase();
        return SHIP_SPEEDPOST_EDD[code] || '3-5 days';
    }

    window._calculateShipping = function(country) {
        var items = Cart.getItems().map(function(item) {
            var prod = products.find(function(p) { return p.id === item.id; });
            return {
                id: item.id,
                productId: item.productId || item.id,
                quantity: item.quantity,
                weight: (prod && prod.weight_grams) ? prod.weight_grams : 50
            };
        });

        var hasFreeGift = items.some(function(item) {
            return item.id === 'free-sticker-gift' || item.productId === 'free-sticker-gift';
        });
        var totalGrams = items.reduce(function(sum, item) {
            return sum + ((item.weight || 50) * (item.quantity || 1));
        }, 0);

        var subtotal = Cart.getTotal();
        var isHK = country.toUpperCase() === 'HK';
        var isFreeShipping = hasFreeGift || subtotal >= SHIP_FREE_THRESHOLD;

        var cost, name, deliveryTime, methodId;

        if (isHK) {
            // Hong Kong local: EC-GET only
            cost = _shipGetECGETRate(totalGrams);
            name = 'EC-GET (Post Office / 7-Eleven Collection)';
            deliveryTime = '2 working days';
            methodId = 'ec-get';
        } else {
            // Overseas: Speedpost only
            cost = _shipGetSpeedpostRate(country, totalGrams);
            name = 'Speedpost (Tracking included)';
            deliveryTime = _shipGetDeliveryTime(country);
            methodId = 'speedpost';
        }

        // Apply free shipping
        if (isFreeShipping) {
            cost = 0;
            name = 'Free Shipping';
            deliveryTime = '\u2014';
        }

        var methods = [{
            id: methodId,
            name: name,
            cost: cost,
            deliveryTime: deliveryTime
        }];

        window._shippingMethods = methods;

        // Update free shipping banner
        var freeEl = document.getElementById('shippingFree');
        if (isFreeShipping) {
            if (freeEl) {
                freeEl.style.display = 'block';
                if (hasFreeGift) {
                    freeEl.textContent = 'Free Shipping (Free Gift in cart!)';
                } else {
                    freeEl.textContent = 'Free Shipping (Order over US\$' + SHIP_FREE_THRESHOLD + ')';
                }
            }
        } else {
            if (freeEl) freeEl.style.display = 'none';
        }

        renderShippingMethods(methods, false);

        return Promise.resolve({ methods: methods, freeGift: isFreeShipping, weight: totalGrams });
    };

    // Country dropdown change
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'shippingCountry') {
            var country = e.target.value;
            var methodsEl = document.getElementById('shippingMethods');
            var freeEl = document.getElementById('shippingFree');
            if (country) {
                if (methodsEl) methodsEl.style.display = 'none';
                window._calculateShipping(country).catch(function(err) {
                    console.error('Shipping error detail:', err);
                    showToast('Shipping error: ' + err.message);
                });
            } else {
                if (methodsEl) methodsEl.style.display = 'none';
                if (freeEl) freeEl.style.display = 'none';
                window._shippingCost = undefined;
                window._shippingMethod = '';
                var lineEl = document.getElementById('shippingLine');
                if (lineEl) lineEl.style.display = 'none';
                updateCartUI();
            }
        }
    });

    // Recalculate shipping when cart changes
    Cart.onUpdate = (function(original) {
        return function() {
            if (typeof original === 'function') original();
            var countrySelect = document.getElementById('shippingCountry');
            if (countrySelect && countrySelect.value) {
                window._calculateShipping(countrySelect.value).catch(function(err) {
                    console.error('Shipping recalc error:', err);
                });
            }
        };
    })(Cart.onUpdate);

    // --- Modal ---
    const modalOverlay = document.getElementById('modalOverlay');
    const productModal = document.getElementById('productModal');
    const modalClose = document.getElementById('modalClose');
    const modalContent = document.getElementById('modalContent');

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && productModal.style.display !== 'none') {
            closeModal();
        }
    });

    // Customization state
    let customState = {
        product: null,
        selectedModel: null,
        selectedStyle: null,
        selectedColor: null,
        selectedOptions: []
    };

    window.openCustomizationModal = function(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const cat = categoryCustomization[product.category];

        // Reset state
        customState = {
            product: product,
            selectedModel: null,
            selectedStyle: null,
            selectedColor: null,
            selectedOptions: cat.options.length > 0 ? [cat.options[0]] : []
        };

        const idx = products.indexOf(product) % colorClasses.length;
        const icon = placeholderIcons[idx % placeholderIcons.length];

        if (!cat || !cat.hasCaseSelection) {
            // Simple modal for stickers (no case selection)
            modalContent.innerHTML = [
                '<div class="modal-product-image ' + colorClasses[idx] + '">',
                    '<span style="font-size:5rem;">' + icon + '</span>',
                '</div>',
                '<h2 class="modal-product-name">' + product.name + '</h2>',
                '<div class="modal-product-price">$' + product.price.toFixed(2) + '</div>',
                '<p class="modal-product-desc">' + product.description + '</p>',
                '<div class="modal-qty">',
                    '<label>Quantity:</label>',
                    '<div class="modal-qty-selector">',
                        '<button class="modal-qty-btn" id="modalQtyMinus">-</button>',
                        '<span class="modal-qty-input" id="modalQtyValue">1</span>',
                        '<button class="modal-qty-btn" id="modalQtyPlus">+</button>',
                    '</div>',
                '</div>',
                '<button class="btn btn-primary modal-add-btn" id="modalAddBtn">Add to Cart</button>'
            ].join('');

            let qty = 1;
            document.getElementById('modalQtyMinus').addEventListener('click', function() {
                if (qty > 1) { qty--; document.getElementById('modalQtyValue').textContent = qty; }
            });
            document.getElementById('modalQtyPlus').addEventListener('click', function() {
                qty++; document.getElementById('modalQtyValue').textContent = qty;
            });
            document.getElementById('modalAddBtn').addEventListener('click', function() {
                for (let i = 0; i < qty; i++) {
                    Cart.addItem(product, 1);
                }
                showToast(product.name + ' added to cart!');
                updateCartUI();
                closeModal();
            });
        } else {
            // Full customization modal for DIY categories
            renderCustomizationModal();
        }

        modalOverlay.style.display = 'block';
        productModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    function renderCustomizationModal() {
        const product = customState.product;
        const idx = products.indexOf(product) % colorClasses.length;
        const icon = placeholderIcons[idx % placeholderIcons.length];
        const cat = categoryCustomization[product.category];

        // Get selected model info
        var selectedModelId = customState.selectedModel;
        var selectedModelName = '';
        if (selectedModelId) {
            var modelObj = phoneModels.find(function(m) { return m.id === selectedModelId; });
            if (modelObj) selectedModelName = modelObj.name;
        }

        // Get styles for the selected model
        var availableStyles = selectedModelId
            ? phoneCaseStyles.filter(function(s) { return s.model_id === selectedModelId; })
            : [];

        // If selected style no longer valid for current model, reset
        if (customState.selectedStyle) {
            var styleStillValid = availableStyles.some(function(s) { return s.id === customState.selectedStyle.id; });
            if (!styleStillValid) {
                customState.selectedStyle = null;
                customState.selectedColor = null;
            }
        }

        // Calculate case price
        var casePrice = customState.selectedStyle ? customState.selectedStyle.price : 0;

        // Calculate options price
        var optionsPrice = 0;
        var optionsText = [];
        customState.selectedOptions.forEach(function(opt) {
            if (optionDetails[opt]) {
                optionsPrice += optionDetails[opt].price;
                optionsText.push(optionDetails[opt].name);
            }
        });
        var totalPrice = product.price + casePrice + optionsPrice;

        // Build model selector
        var modelsHtml = '<option value="">-- Select Phone Model --</option>';
        phoneModels.forEach(function(m) {
            var sel = m.id === selectedModelId ? ' selected' : '';
            modelsHtml += '<option value="' + m.id + '"' + sel + '>' + m.name + '</option>';
        });

        // Build style cards (filtered by model)
        var stylesHtml = '';
        if (selectedModelId) {
            stylesHtml = availableStyles.map(function(style) {
                var selected = customState.selectedStyle && customState.selectedStyle.id === style.id ? ' selected' : '';
                var previewHtml = style.image_url ? '<img src="' + style.image_url + '" class="case-style-preview-img" alt="' + style.name + '">' : '<div class="case-style-preview"></div>';
                return '<div class="case-style-card' + selected + '" data-style-id="' + style.id + '">' + previewHtml + '<span class="case-style-name">' + style.name + '</span>' + (style.price > 0 ? '<span class="case-style-price">+$' + style.price.toFixed(2) + '</span>' : '') + '</div>';
            }).join('');
        }

        // Build color swatches
        var colorsHtml = '';
        if (customState.selectedStyle) {
            colorsHtml = customState.selectedStyle.colors.map(function(color) {
                var label = typeof color === 'string' ? color : color.label;
                var imgUrl = typeof color === 'string' ? null : color.value;
                var selected = customState.selectedColor === label ? ' selected' : '';
                if (imgUrl) {
                    return '<div class="color-swatch' + selected + '" data-color="' + label + '" title="' + label + '"><img src="' + imgUrl + '" class="color-swatch-img"></div>';
                }
                return '<div class="color-swatch' + selected + '" data-color="' + label + '" title="' + label + '" style="background:' + getColorCSS(label) + ';"></div>';
            }).join('');
        }

        // Build options (A/B radio, C checkbox)
        var optionsHtml = cat.options.map(function(opt) {
            var detail = optionDetails[opt];
            if (!detail) return '';
            var checked = customState.selectedOptions.indexOf(opt) !== -1;
            if (opt === 'C') {
                return '<label class="option-checkbox"><input type="checkbox" class="option-input" data-option="C" ' + (checked ? 'checked' : '') + '><span class="option-info"><span class="option-name">Option C: ' + detail.name + '</span><span class="option-desc">' + detail.description + '</span><span class="option-price">' + (detail.price > 0 ? '+$' + detail.price.toFixed(2) : 'Included') + '</span></span></label>';
            }
            return '<label class="option-checkbox"><input type="radio" name="option-ab" class="option-input" data-option="' + opt + '" ' + (checked ? 'checked' : '') + '><span class="option-info"><span class="option-name">Option ' + opt + ': ' + detail.name + '</span><span class="option-desc">' + detail.description + '</span><span class="option-price">' + (detail.price > 0 ? '+$' + detail.price.toFixed(2) : 'Included') + '</span></span></label>';
        }).join('');

        modalContent.innerHTML = [
            '<div class="modal-product-image ' + colorClasses[idx] + '">',
                '<span style="font-size:4rem;">' + icon + '</span>',
            '</div>',
            '<h2 class="modal-product-name">' + product.name + '</h2>',
            '<p class="modal-product-desc">' + product.description + '</p>',
            '<div class="custom-section">',
                '<h3 class="custom-step-title">Step 1: Choose Your Phone Model</h3>',
                '<select id="modelSelector" class="model-selector">' + modelsHtml + '</select>',
            '</div>',
            '<div class="custom-section" id="styleSection" style="display:' + (selectedModelId ? 'block' : 'none') + ';">',
                '<h3 class="custom-step-title">Step 2: Choose Your Case Style</h3>',
                '<div class="case-styles-grid">' + stylesHtml + '</div>',
                '<div class="color-selector" id="colorSelector" style="display:' + (customState.selectedStyle ? 'block' : 'none') + ';">',
                    '<p class="color-label">Choose Color:</p>',
                    '<div class="color-swatches">' + colorsHtml + '</div>',
                '</div>',
            '</div>',
            '<div class="custom-section">',
                '<h3 class="custom-step-title">Step 3: Options</h3>',
                '<div class="options-list">' + optionsHtml + '</div>',
            '</div>',
            '<div class="custom-total">',
                '<div class="custom-total-breakdown">',
                    '<span>Base: $' + product.price.toFixed(2) + '</span>',
                    (casePrice > 0 ? '<span>Case: +$' + casePrice.toFixed(2) + '</span>' : '<span>Case: $0</span>'),
                    (optionsPrice > 0 ? '<span>Options: +$' + optionsPrice.toFixed(2) + '</span>' : ''),
                '</div>',
                '<div class="custom-total-row">',
                    '<span>Total:</span>',
                    '<span class="custom-total-price">$' + totalPrice.toFixed(2) + '</span>',
                '</div>',
            '</div>',
            '<div class="custom-selections" id="customSelections">',
                (selectedModelName ? '<span>Model: ' + selectedModelName + '</span>' : ''),
                (customState.selectedStyle ? '<span>Case: ' + customState.selectedStyle.name + ' (' + customState.selectedColor + ')</span>' : '<span class="text-muted">Please select your phone case</span>'),
                (optionsText.length > 0 ? '<span>Options: ' + optionsText.join(', ') + '</span>' : ''),
            '</div>',
            '<button class="btn btn-primary modal-add-btn" id="customAddBtn" ' + (customState.selectedStyle ? '' : 'disabled') + '>Add to Cart</button>'
        ].join('');

        // Bind model selector change
        var modelSel = document.getElementById('modelSelector');
        if (modelSel) {
            modelSel.addEventListener('change', function() {
                customState.selectedModel = this.value || null;
                customState.selectedStyle = null;
                customState.selectedColor = null;
                renderCustomizationModal();
            });
        }

        // Bind style selection events
        document.querySelectorAll('.case-style-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var styleId = this.dataset.styleId;
                var style = availableStyles.find(function(s) { return s.id === styleId; });
                if (!style) return;
                customState.selectedStyle = style;
                var firstColor = style.colors[0];
                customState.selectedColor = typeof firstColor === 'string' ? firstColor : firstColor.label;
                renderCustomizationModal();
            });
        });

        // Bind color selection events
        document.querySelectorAll('.color-swatch').forEach(function(swatch) {
            swatch.addEventListener('click', function() {
                customState.selectedColor = this.dataset.color;
                renderCustomizationModal();
            });
        });

        // Bind option events (A/B radio, C checkbox)
        document.querySelectorAll('.option-input').forEach(function(cb) {
            cb.addEventListener('change', function() {
                var opt = this.dataset.option;
                if (opt === 'C') {
                    if (this.checked) {
                        if (customState.selectedOptions.indexOf('C') === -1) {
                            customState.selectedOptions.push('C');
                        }
                    } else {
                        customState.selectedOptions = customState.selectedOptions.filter(function(o) { return o !== 'C'; });
                    }
                } else {
                    // A or B radio - replace A/B selection, keep C if present
                    var hadC = customState.selectedOptions.indexOf('C') !== -1;
                    customState.selectedOptions = hadC ? ['C'] : [];
                    customState.selectedOptions.push(opt);
                }
                renderCustomizationModal();
            });
        });

        // Bind add to cart
        document.getElementById('customAddBtn').addEventListener('click', function() {
            if (!customState.selectedStyle) return;

            var casePrice = customState.selectedStyle.price;
            var optionsPrice = 0;
            var optionsText = [];
            customState.selectedOptions.forEach(function(opt) {
                if (optionDetails[opt]) {
                    optionsPrice += optionDetails[opt].price;
                    optionsText.push(optionDetails[opt].name);
                }
            });

            var customization = {
                phoneModel: selectedModelName,
                caseStyle: customState.selectedStyle.name,
                caseColor: customState.selectedColor,
                options: customState.selectedOptions,
                optionsText: optionsText.join(', ')
            };

            var totalPrice = product.price + casePrice + optionsPrice;
            var customProduct = Object.assign({}, product, { price: totalPrice });

            Cart.addItem(customProduct, 1, customization);
            showToast(product.name + ' added to cart!');
            updateCartUI();
            closeModal();
        });

        // Bind lightbox for style preview images
        document.querySelectorAll('.case-style-preview-img').forEach(function(img) {
            img.addEventListener('click', function(e) {
                var styleCard = this.closest('.case-style-card');
                if (styleCard) {
                    var styleId = styleCard.dataset.styleId;
                    var style = availableStyles.find(function(s) { return s.id === styleId; });
                    if (style) {
                        window.openLightbox(style.image_url, style.name);
                    }
                }
            });
        });

        // Bind lightbox for color swatch images
        document.querySelectorAll('.color-swatch img').forEach(function(img) {
            img.addEventListener('click', function(e) {
                var swatch = this.closest('.color-swatch');
                if (swatch) {
                    window.openLightbox(this.src, swatch.title || 'Color');
                }
            });
        });
    }

    function getColorCSS(color) {
        var colorMap = {
            'Clear': 'rgba(200,200,200,0.3)',
            'Black': '#222',
            'White': '#f0f0f0',
            'Pink': '#FF69B4',
            'Blue': '#4A90D9',
            'Purple': '#9B59B6',
            'Green': '#2ECC71',
            'Red': '#E74C3C',
            'Gray': '#888',
            'Gold': '#FFD700',
            'Silver': '#C0C0C0',
            'Rose Gold': '#B76E79',
            'Rainbow': 'linear-gradient(90deg,red,orange,yellow,green,blue,purple)',
            'Yellow': '#FFE66D',
            'Lavender': '#E6E6FA',
            'Pink-Purple': 'linear-gradient(135deg,#FF69B4,#9B59B6)',
            'Blue-Green': 'linear-gradient(135deg,#4A90D9,#2ECC71)',
            'Orange-Yellow': 'linear-gradient(135deg,#FF8C00,#FFE66D)',
            'Purple-Blue': 'linear-gradient(135deg,#9B59B6,#4A90D9)',
            'Red-Orange': 'linear-gradient(135deg,#E74C3C,#FF8C00)',
            'Green-Teal': 'linear-gradient(135deg,#2ECC71,#1ABC9C)',
            'Pink-Yellow': 'linear-gradient(135deg,#FF69B4,#FFE66D)',
            'Blue-Purple': 'linear-gradient(135deg,#4A90D9,#9B59B6)'
        };
        return colorMap[color] || '#ccc';
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        productModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Keep old openProductModal as alias for backwards compatibility
    window.openProductModal = window.openCustomizationModal;

    // --- Lightbox (popup) ---
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<div class="lightbox-content"><span class="lightbox-close">&times;</span><img class="lightbox-img" src="" alt=""><div class="lightbox-caption"></div></div>';
    document.body.appendChild(lightbox);
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');

    window.openLightbox = function(src, caption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Click overlay (outside popup) to close
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    // Close button
    lightbox.querySelector('.lightbox-close').addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
    });
    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // ============================================
    // Gift / Offer Popup System
    // ============================================
    var popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.innerHTML = '<div class="popup-card"><span class="popup-icon"></span><div class="popup-title"></div><div class="popup-text"></div><div class="popup-actions"></div></div>';
    document.body.appendChild(popupOverlay);
    var popupCard = popupOverlay.querySelector('.popup-card');
    var popupIcon = popupOverlay.querySelector('.popup-icon');
    var popupTitle = popupOverlay.querySelector('.popup-title');
    var popupText = popupOverlay.querySelector('.popup-text');
    var popupActions = popupOverlay.querySelector('.popup-actions');

    // Close popup when clicking overlay outside card
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            popupOverlay.classList.remove('active');
        }
    });

    window.showPopup = function(opts) {
        popupIcon.textContent = opts.icon || '??';
        popupTitle.textContent = opts.title || '';
        popupText.textContent = opts.text || '';
        popupActions.innerHTML = '';
        if (opts.buttons) {
            opts.buttons.forEach(function(btn) {
                var el = document.createElement('button');
                el.className = 'btn ' + (btn.className || 'btn-primary');
                el.textContent = btn.label;
                el.addEventListener('click', function(e) {
                    // Close popup first, then run action (prevents stuck popups)
                    var shouldClose = btn.closeOnClick !== false;
                    if (shouldClose) popupOverlay.classList.remove('active');
                    if (btn.action) btn.action(e);
                });
                popupActions.appendChild(el);
            });
        }
        // Also close on Escape
        popupOverlay._keyHandler = function(e) {
            if (e.key === 'Escape') popupOverlay.classList.remove('active');
        };
        document.addEventListener('keydown', popupOverlay._keyHandler);
        popupOverlay.classList.add('active');
    };

    window.closePopup = function() {
        popupOverlay.classList.remove('active');
        if (popupOverlay._keyHandler) {
            document.removeEventListener('keydown', popupOverlay._keyHandler);
        }
    };

    // Generate a simple session ID for gift claiming
    var sessionId = localStorage.getItem('funfairday_session');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substr(2, 12);
        localStorage.setItem('funfairday_session', sessionId);
    }

    // Gift claim popup (triggered after redirect from free-sticker.html)
    var giftClaimedFlag = localStorage.getItem('funfairday_gift_claimed');
    if (giftClaimedFlag === 'true') {
        localStorage.removeItem('funfairday_gift_claimed');
        // Wait a moment for page to fully render
        setTimeout(function() {
            showPopup({
                icon: '??',
                title: 'Free Gift Added! ??',
                text: 'Please process the free sticker checkout within 30mins to claim your gift!',
                buttons: [
                    {
                        label: 'Check out Now',
                        className: 'btn-primary',
                        action: function() {
                            openCart();
                        }
                    },
                    {
                        label: 'Shop Around',
                        className: 'btn-secondary',
                        action: function() {
                            window.location.href = 'category.html?cat=stickers';
                        }
                    }
                ]
            });
        }, 500);
    }

    // Discount banner
    window.showDiscountBanner = function() {
        var existing = document.querySelector('.discount-banner');
        if (existing) return;
        var banner = document.createElement('div');
        banner.className = 'discount-banner';
        banner.innerHTML = '<span>30% OFF Applied - Special Support Offer</span>';
        var header = document.querySelector('.header');
        if (header) {
            header.parentNode.insertBefore(banner, header);
        } else {
            document.body.insertBefore(banner, document.body.firstChild);
        }
    };

    // Apply discount banner on page load if active
    if (localStorage.getItem('funfairday_discount30') === 'true') {
        showDiscountBanner();
    }

    // --- Toast ---
    const toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
    let toastTimeout;

    window.showToast = function(message) {
        toast.textContent = message;
        toast.classList.add('active');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function() {
            toast.classList.remove('active');
        }, 3000);
    };

    // --- Scroll Effect ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        header.classList.toggle('scrolled', window.pageYOffset > 50);
    });

    // --- Initialize ---
    if (typeof renderCategories === 'function') {
        renderCategories();
    }

    // --- Auth State ---
    const supabaseUrl = localStorage.getItem('supabase_url');
    const supabaseAnonKey = localStorage.getItem('supabase_anon_key');

    if (supabaseUrl && supabaseAnonKey && window.supabase) {
        const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

        supabase.auth.getSession().then(({ data: { session } }) => {
            const authLink = document.getElementById('authLink');
            if (authLink) {
                if (session) {
                    authLink.textContent = 'My Account';
                    authLink.href = 'account.html';
                } else {
                    authLink.textContent = 'Sign In';
                    authLink.href = 'login.html';
                }
            }
        });
    }

    // Listen for public data loaded event to update dynamic content
    document.addEventListener('publicDataLoaded', function(e) {
        const data = e.detail;
        // Update site name in header if available
        if (data.settings && data.settings.site_name) {
            const logoText = document.querySelector('.logo-text');
            if (logoText) logoText.textContent = data.settings.site_name;
        }
        // Re-render categories with API data
        if (typeof renderCategories === 'function') {
            renderCategories();
        }
    });
});
