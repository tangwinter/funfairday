// Main Application Logic
document.addEventListener('DOMContentLoaded', function() {

    // Auth state flags
    window._isLoggedIn = false;
    window._authChecked = false;

    const colorClasses = ['product-color-1', 'product-color-2', 'product-color-3', 'product-color-4'];
    const placeholderIcons = ['🎨', '📱', '🎭', '💐'];

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
            name: 'FunFairDay',
            handle: '@funfairday',
            url: 'https://www.youtube.com/@funfairday',
            description: 'FunFairDay - DIY stickers and accessories'
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
            }
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
                    <div class="cart-item-total">${Cart.isDiscountActive() ? '<span class="price-original">$' + (item.price * item.quantity).toFixed(2) + '</span><span class="price-discounted">$' + (Cart.getDiscountedPrice(item.price) * item.quantity).toFixed(2) + '</span>' : '$' + (item.price * item.quantity).toFixed(2)}</div>
                </div>
            `;
        }).join('');

        var subtotal = Cart.getTotal();
        var shipCost = window._shippingCost || 0;
        var totalWithShipping = subtotal + (shipCost / 7.8);
        cartTotal.textContent = '$' + totalWithShipping.toFixed(2);
        var subEl = document.getElementById('cartSubtotal');
        if (subEl) subEl.textContent = '$' + subtotal.toFixed(2);

        // Show free shipping threshold banner
        var freeThresholdEl = document.getElementById('cartFreeThreshold');
        if (!freeThresholdEl) {
            // Create the banner element if not present
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
            var hasFreeGift = items.some(function(item) {
                return item.id === 'free-sticker-gift' || item.productId === 'free-sticker-gift';
            });
            if (hasFreeGift || subtotal >= SHIP_FREE_THRESHOLD) {
                freeThresholdEl.style.display = 'none';
            } else {
                var needed = (SHIP_FREE_THRESHOLD - subtotal).toFixed(2);
                freeThresholdEl.innerHTML = 'Add US$' + needed + ' more for <strong>Free Shipping</strong>!';
                freeThresholdEl.style.display = 'block';
            }
        }

        // Show free shipping message above total
        var freeShipMsg = document.getElementById('cartFreeShippingMsg');
        if (freeShipMsg) {
            var hasFreeGiftMsg = items.some(function(item) {
                return item.id === 'free-sticker-gift' || item.productId === 'free-sticker-gift';
            });
            if (hasFreeGiftMsg || subtotal >= SHIP_FREE_THRESHOLD) {
                freeShipMsg.style.display = 'block';
                if (hasFreeGiftMsg) {
                    freeShipMsg.textContent = '🚚 Free Shipping (Free Gift in cart!)';
                } else {
                    freeShipMsg.textContent = '🚚 Free Shipping (Order over US$' + SHIP_FREE_THRESHOLD + ')';
                }
            } else {
                freeShipMsg.style.display = 'none';
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
                    var prodId = item.productId || item.id;
                    var prod = products.find(function(p) { return p.id === prodId; });
                    return prod && !prod.stripePriceId;
                });
                var useDynamicPrices = discountActive || hasItemsWithoutPriceId;

                // Build items for Stripe (exclude $0 free gift items without priceId)
                var stripeItems = updatedItems
                    .filter(function(item) {
                        var prodId = item.productId || item.id;
                        var prod = products.find(function(p) { return p.id === prodId; });
                        return prod && (prod.stripePriceId || useDynamicPrices);
                    })
                    .map(function(item) {
                        var prodId = item.productId || item.id;
                        var prod = products.find(function(p) { return p.id === prodId; });
                        // For customized items (caseStyle set), use stored item.price which includes case + options
                        // For regular items, use the product's current price for consistency
                        var basePrice = item.caseStyle ? item.price : (prod ? prod.price : item.price);
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

                // Fulfill gift code before Stripe redirect
                if (giftCode) {
                    try {
                        var sid = localStorage.getItem('funfairday_session') || '';
                        await fetch('/claim-gift', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code: giftCode, session: sid, fulfill: true })
                        });
                    } catch(e) {
                        console.log('Gift fulfill note:', e.message);
                    }
                }

                var response = await fetch('/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: stripeItems,
                        cartItems: cartItems,
                        total: Cart.getTotal(),
                        shippingFee: Math.round((window._shippingCost || 0) / 7.8 * 100) / 100,
                        shippingMethod: window._shippingMethod || '',
                        successUrl: CONFIG.successUrl,
                        cancelUrl: CONFIG.cancelUrl,
                        useDynamicPrices: useDynamicPrices,
                        shippingAddress: JSON.parse(sessionStorage.getItem('funfairday_shipping_address') || 'null')
                    })
                });

                if (!response.ok) throw new Error('Checkout request failed');
                var data = await response.json();

                if (data.url) {
                    // Store cart data in session for order creation after checkout
                    sessionStorage.setItem('checkout_cart', JSON.stringify(cartItems));
                    sessionStorage.setItem('checkout_total', Cart.getTotal().toString());
                    sessionStorage.setItem('checkout_shipping', JSON.stringify({
                        cost: Math.round((window._shippingCost || 0) / 7.8 * 100) / 100,
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

        // ============ NEW CHECKOUT FLOW ============

        // Helper: find country name from code
        function getCountryName(code) {
            var found = SHIPPING_COUNTRIES.find(function(c) { return c.code === code; });
            return found ? found.name : code;
        }

        // Step: Auth popup (Sign In / Register / Stranger)
        function showAuthPopup() {
            // If already signed in, skip auth popup
            if (window._isLoggedIn) {
                showAddressForm();
                return;
            }
            showPopup({
                icon: '🔐',
                title: 'Almost there!',
                text: 'Please sign in to save your address, or continue as a guest.',
                buttons: [
                    {
                        label: 'Buy as Stranger',
                        className: 'btn-primary',
                        action: function() {
                            showAddressForm();
                        }
                    },
                    {
                        label: 'Sign In / Register',
                        className: 'btn-secondary',
                        action: function() {
                            // Save checkout state so we can resume after login
                            var returnUrl = window.location.href;
                            var separator = returnUrl.indexOf('?') !== -1 ? '&' : '?';
                            returnUrl += separator + 'checkout=1';
                            sessionStorage.setItem('funfairday_checkout_state', JSON.stringify({
                                country: selectedCountry,
                                shippingCost: window._shippingCost,
                                shippingMethod: window._shippingMethod,
                                methodId: window._selectedMethodId
                            }));
                            window.location.href = 'login.html?return_to=' + encodeURIComponent(returnUrl);
                        }
                    }
                ]
            });
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Checkout';
        }

        // Step: Shipping address form
        function showAddressForm() {
            var overlay = document.getElementById('addressFormOverlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'addressFormOverlay';
                overlay.className = 'popup-overlay';
                overlay.innerHTML = '<div class="popup-card address-form-card">'
                    + '<div class="addr-header">'
                    + '<span class="addr-icon">📦</span>'
                    + '<h3 class="addr-title">Shipping Address</h3>'
                    + '<p class="addr-subtitle">Fill in your shipping details to continue</p>'
                    + '</div>'
                    + '<form id="addressForm" class="addr-form">'
                    + '<div class="form-group"><label>Full Name <span class="required">*</span></label><input type="text" id="addrFullName" required placeholder="e.g. John Smith"></div>'
                    + '<div class="form-group"><label>Street Address <span class="required">*</span></label><input type="text" id="addrStreet" required placeholder="e.g. 123 Main St, Apt 4B"></div>'
                    + '<div class="form-row">'
                    + '<div class="form-group"><label>City <span class="required">*</span></label><input type="text" id="addrCity" required placeholder="Hong Kong"></div>'
                    + '<div class="form-group"><label>State / Province</label><input type="text" id="addrState" placeholder="Optional"></div>'
                    + '</div>'
                    + '<div class="form-row">'
                    + '<div class="form-group"><label>ZIP / Postal Code</label><input type="text" id="addrZip" placeholder="Optional"></div>'
                    + '<div class="form-group"><label>Phone</label><input type="tel" id="addrPhone" placeholder="Optional"></div>'
                    + '</div>'
                    + '<div class="form-group"><label>Country <span class="required">*</span></label><select id="addrCountry" class="addr-select"></select></div>'
                    + '<div class="addr-actions">'
                    + '<button type="submit" class="btn btn-primary addr-btn">Continue to Payment →</button>'
                    + '<button type="button" class="btn btn-secondary addr-btn" id="addrBackBtn">← Back</button>'
                    + '</div>'
                    + '</form>'
                    + '</div>';
                document.body.appendChild(overlay);

                // Populate country dropdown
                var countrySelectEl = overlay.querySelector('#addrCountry');
                SHIPPING_COUNTRIES.forEach(function(c) {
                    var opt = document.createElement('option');
                    opt.value = c.code;
                    opt.textContent = c.name;
                    countrySelectEl.appendChild(opt);
                });

                // Handle form submit
                overlay.querySelector('#addressForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    var name = document.getElementById('addrFullName').value.trim();
                    var street = document.getElementById('addrStreet').value.trim();
                    var city = document.getElementById('addrCity').value.trim();
                    var state = document.getElementById('addrState').value.trim();
                    var zip = document.getElementById('addrZip').value.trim();
                    var phone = document.getElementById('addrPhone').value.trim();
                    var countryCode = document.getElementById('addrCountry').value;

                    if (!name || !street || !city || !countryCode) {
                        showToast('Please fill in all required fields.');
                        return;
                    }

                    // Store address in sessionStorage
                    sessionStorage.setItem('funfairday_shipping_address', JSON.stringify({
                        name: name,
                        street: street,
                        city: city,
                        state: state,
                        zip: zip,
                        phone: phone,
                        country: countryCode
                    }));

                    overlay.classList.remove('active');
                    showFinalSteps();
                });

                // Handle back button
                overlay.querySelector('#addrBackBtn').addEventListener('click', function() {
                    overlay.classList.remove('active');
                    showAuthPopup();
                });

                // Close on overlay click
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) {
                        overlay.classList.remove('active');
                    }
                });
            }

            // Pre-select country from current shipping selection
            var countryEl = overlay.querySelector('#addrCountry');
            if (selectedCountry && countryEl) {
                countryEl.value = selectedCountry;
            }

            // Clear form fields
            overlay.querySelector('#addrFullName').value = '';
            overlay.querySelector('#addrStreet').value = '';
            overlay.querySelector('#addrCity').value = '';
            overlay.querySelector('#addrState').value = '';
            overlay.querySelector('#addrZip').value = '';
            overlay.querySelector('#addrPhone').value = '';

            overlay.classList.add('active');
        }

        // Step: Bundle offer + free shipping check + proceed
        function showFinalSteps() {
            var bundleInCart = items.some(function(i) { return i.id === 'bundle-5pcs-stick' || i.productId === 'bundle-5pcs-stick'; });

            if (!bundleInCart) {
                var bundleProduct = products.find(function(p) { return p.id === 'bundle-5pcs-stick'; });
                if (bundleProduct) {
                    var bundlePrice = Cart.isDiscountActive()
                        ? '$' + Cart.getDiscountedPrice(bundleProduct.price).toFixed(2)
                        : '$' + bundleProduct.price.toFixed(2);

                    showPopup({
                        icon: '🎉',
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
                                    setTimeout(function() { showFreeShippingCheck(); }, 500);
                                }
                            },
                            {
                                label: 'Keep Checkout',
                                className: 'btn-secondary',
                                action: function() {
                                    showFreeShippingCheck();
                                }
                            }
                        ]
                    });
                    return;
                }
            }

            showFreeShippingCheck();
        }

        // Step: Free shipping threshold check
        function showFreeShippingCheck() {
            var hasFreeGiftCheck = items.some(function(i) { return i.id === 'free-sticker-gift' || i.productId === 'free-sticker-gift'; });
            var subtotalCheck = Cart.getTotal();
            var isShippingFree = hasFreeGiftCheck || subtotalCheck >= SHIP_FREE_THRESHOLD;

            if (!isShippingFree && subtotalCheck < SHIP_FREE_THRESHOLD) {
                var needed = (SHIP_FREE_THRESHOLD - subtotalCheck).toFixed(2);
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Checkout';
                showPopup({
                    icon: '🚚',
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

            // Proceed directly
            proceedCheckout();
        }

        // ===== START CHECKOUT FLOW =====
        // If gift code in use, show fluffy sticker upsell first
        var hasGiftCode = !!localStorage.getItem('funfairday_gift_code');

        if (hasGiftCode) {
            var fluffyProduct = products.find(function(p) { return p.id === 'sticker-fluffy-pack-8'; });
            showPopup({
                icon: '🎁',
                title: 'Add a Fluffy Sticker Pack?',
                text: 'Add 8pcs Assorted Fluffy Sticker Pack ($9.62) to your gift order?',
                buttons: [
                    {
                        label: 'Add to Cart ($9.62)',
                        className: 'btn-primary',
                        action: function() {
                            if (fluffyProduct) {
                                Cart.addItem(fluffyProduct, 1);
                                showToast('Fluffy Sticker Pack added!');
                                updateCartUI();
                                openCart();
                            }
                            setTimeout(showAuthPopup, 300);
                        }
                    },
                    {
                        label: 'No thanks, keep checking out',
                        className: 'btn-secondary',
                        action: function() {
                            showAuthPopup();
                        }
                    }
                ]
            });
        } else {
            showAuthPopup();
        }
    });

    // --- Shipping ---
    var SHIPPING_COUNTRIES = [
        { code: 'AR', name: 'Argentina' },
        { code: 'AU', name: 'Australia' },
        { code: 'AT', name: 'Austria' },
        { code: 'BE', name: 'Belgium' },
        { code: 'BR', name: 'Brazil' },
        { code: 'CA', name: 'Canada' },
        { code: 'CN', name: 'China' },
        { code: 'CZ', name: 'Czech Republic' },
        { code: 'DK', name: 'Denmark' },
        { code: 'FR', name: 'France' },
        { code: 'DE', name: 'Germany' },
        { code: 'GR', name: 'Greece' },
        { code: 'HK', name: 'Hong Kong' },
        { code: 'ID', name: 'Indonesia' },
        { code: 'IE', name: 'Ireland' },
        { code: 'IT', name: 'Italy' },
        { code: 'JP', name: 'Japan' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'MX', name: 'Mexico' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'NZ', name: 'New Zealand' },
        { code: 'NO', name: 'Norway' },
        { code: 'PH', name: 'Philippines' },
        { code: 'PL', name: 'Poland' },
        { code: 'PT', name: 'Portugal' },
        { code: 'SA', name: 'Saudi Arabia' },
        { code: 'SG', name: 'Singapore' },
        { code: 'ZA', name: 'South Africa' },
        { code: 'KR', name: 'South Korea' },
        { code: 'ES', name: 'Spain' },
        { code: 'SE', name: 'Sweden' },
        { code: 'CH', name: 'Switzerland' },
        { code: 'TW', name: 'Taiwan' },
        { code: 'TH', name: 'Thailand' },
        { code: 'AE', name: 'United Arab Emirates' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'US', name: 'United States' },
        { code: 'VN', name: 'Vietnam' },
        { code: 'OTHERS', name: 'Others (Non-listed country)' }
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
        // Country select starts empty — user must choose
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
                    if (costEl) costEl.textContent = '$' + (firstMethod.cost / 7.8).toFixed(2);
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
                        '<span class="ship-method-cost">$' + (m.cost / 7.8).toFixed(2) + '</span>' +
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
        if (lineCostEl) lineCostEl.textContent = '$' + ((window._shippingCost || 0) / 7.8).toFixed(2);
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

    // EC-GET Hong Kong local rates (HKD) — Special offer until Jun 2026
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

    // Registered Air Mail 0.5kg packet base rates per country (HKD) — from HK Post calculator
    var SHIP_AIRMAIL_RATES = {
        'US': 114.10, 'CA': 114.10,
        'GB': 114.10, 'FR': 114.10, 'DE': 114.10, 'IT': 114.10, 'ES': 114.10,
        'NL': 114.10, 'BE': 114.10, 'CH': 114.10, 'SE': 114.10, 'NO': 114.10,
        'DK': 114.10, 'AT': 114.10, 'IE': 114.10, 'PT': 114.10, 'GR': 114.10,
        'PL': 114.10, 'CZ': 114.10,
        'AU': 114.10, 'NZ': 114.10,
        'JP': 114.10, 'KR': 114.10, 'SG': 114.10, 'MY': 114.10, 'TH': 114.10,
        'PH': 114.10, 'ID': 114.10, 'VN': 114.10,
        'CN': 91.80, 'TW': 114.10,
        'ZA': 114.10,
        'MX': 114.10, 'BR': 114.10, 'AR': 114.10,
        'AE': 114.10, 'SA': 114.10
    };
    // Registration surcharge (adds tracking)
    var SHIP_AIRMAIL_REG_FEE = 15.50;

    // Airmail delivery time estimates (working days) — from HK Post
    var SHIP_AIRMAIL_EDD = {
        'US': '7-16 days', 'CA': '9-14 days',
        'GB': '10-11 days', 'FR': '10-12 days', 'DE': '10-12 days',
        'IT': '10-14 days', 'ES': '10-14 days',
        'NL': '10-12 days', 'BE': '10-12 days', 'CH': '10-12 days',
        'SE': '10-14 days', 'NO': '10-14 days', 'DK': '10-12 days',
        'AT': '10-12 days', 'IE': '10-14 days', 'PT': '10-14 days',
        'GR': '10-14 days', 'PL': '10-14 days', 'CZ': '10-12 days',
        'AU': '9-14 days', 'NZ': '10-14 days',
        'JP': '8-10 days', 'KR': '8-12 days', 'SG': '7-10 days',
        'MY': '8-12 days', 'TH': '8-12 days', 'PH': '8-14 days',
        'ID': '8-14 days', 'VN': '8-14 days',
        'CN': '7-14 days', 'TW': '8-12 days',
        'ZA': '10-18 days',
        'MX': '10-18 days', 'BR': '12-20 days', 'AR': '12-20 days',
        'AE': '10-18 days', 'SA': '10-18 days'
    };

    // Local Mail Packet rates (HKD) — Hong Kong home delivery, up to 2kg
    var SHIP_LOCALMAIL_RATES = [
        { maxG: 1000, cost: 15.80 },
        { maxG: 2000, cost: 30.40 }
    ];

    // Local Parcel rates (HKD) — for items over 2kg
    var SHIP_LOCALPARCEL_RATES = [
        { maxG: 3000, cost: 77.00 },
        { maxG: 4000, cost: 93.00 },
        { maxG: 5000, cost: 109.00 },
        { maxG: 7000, cost: 129.00 },
        { maxG: 10000, cost: 151.00 },
        { maxG: 20000, cost: 177.00 }
    ];
    function _shipGetSpeedpostRate(countryCode, totalGrams) {
        var code = countryCode.toUpperCase();
        var baseRateHkd = SHIP_SPEEDPOST_RATES[code];
        if (!baseRateHkd) baseRateHkd = 392; // highest (Norway) for Others
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
        return Math.round(rateHkd * 100) / 100;
    }

    function _shipGetECGETRate(totalGrams) {
        for (var i = 0; i < SHIP_ECGET_RATES.length; i++) {
            if (totalGrams <= SHIP_ECGET_RATES[i].maxG) {
                return Math.round(SHIP_ECGET_RATES[i].cost * 100) / 100;
            }
        }
        return Math.round(SHIP_ECGET_RATES[SHIP_ECGET_RATES.length - 1].cost * 100) / 100;
    }

    function _shipGetDeliveryTime(countryCode) {
        var code = countryCode.toUpperCase();
        return SHIP_SPEEDPOST_EDD[code] || '3-5 days';
    }

    function _shipGetAirmailRate(countryCode, totalGrams) {
        var code = countryCode.toUpperCase();
        var baseRate = SHIP_AIRMAIL_RATES[code] || 114.10;
        if (totalGrams <= 500) {
            return Math.round((baseRate + SHIP_AIRMAIL_REG_FEE) * 100) / 100;
        } else if (totalGrams <= 1000) {
            return Math.round((baseRate * 2 + SHIP_AIRMAIL_REG_FEE) * 100) / 100;
        } else if (totalGrams <= 2000) {
            return Math.round((baseRate * 4 + SHIP_AIRMAIL_REG_FEE) * 100) / 100;
        } else {
            return Math.round((baseRate * 4 + SHIP_AIRMAIL_REG_FEE) * 100) / 100;
        }
    }

    function _shipGetAirmailDeliveryTime(countryCode) {
        var code = countryCode.toUpperCase();
        return SHIP_AIRMAIL_EDD[code] || '7-24 days';
    }

    function _shipGetLocalMailRate(totalGrams) {
        for (var i = 0; i < SHIP_LOCALMAIL_RATES.length; i++) {
            if (totalGrams <= SHIP_LOCALMAIL_RATES[i].maxG) {
                return Math.round(SHIP_LOCALMAIL_RATES[i].cost * 100) / 100;
            }
        }
        // Over 2kg — use Local Parcel rates
        for (var j = 0; j < SHIP_LOCALPARCEL_RATES.length; j++) {
            if (totalGrams <= SHIP_LOCALPARCEL_RATES[j].maxG) {
                return Math.round(SHIP_LOCALPARCEL_RATES[j].cost * 100) / 100;
            }
        }
        return Math.round(SHIP_LOCALPARCEL_RATES[SHIP_LOCALPARCEL_RATES.length - 1].cost * 100) / 100;
    }

    function _shipGetLocalRegisteredRate(totalGrams) {
        return Math.round((_shipGetLocalMailRate(totalGrams) + SHIP_AIRMAIL_REG_FEE) * 100) / 100;
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

        var methods = [];

        if (isFreeShipping) {
            // Free shipping — single option
            methods.push({
                id: 'free',
                name: 'Free Shipping',
                cost: 0,
                deliveryTime: '—'
            });
        } else if (isHK) {
            // Hong Kong: offer EC-GET + Local Mail options
            methods.push({
                id: 'ec-get',
                name: 'EC-GET (Post Office / 7-Eleven Collection)',
                cost: _shipGetECGETRate(totalGrams),
                deliveryTime: '2 working days'
            });
            if (totalGrams <= 2000) {
                methods.push({
                    id: 'local-mail',
                    name: 'Local Mail (Home Delivery)',
                    cost: _shipGetLocalMailRate(totalGrams),
                    deliveryTime: '2 working days'
                });
                methods.push({
                    id: 'local-registered',
                    name: 'Local Registered (Home Delivery, Tracking)',
                    cost: _shipGetLocalRegisteredRate(totalGrams),
                    deliveryTime: '2 working days'
                });
            } else {
                // Over 2kg, use Local Parcel (tracked)
                methods.push({
                    id: 'local-parcel',
                    name: 'Local Parcel (Home Delivery, Tracking)',
                    cost: _shipGetLocalMailRate(totalGrams),
                    deliveryTime: '2-3 working days'
                });
            }
        } else {
            // Overseas: offer Speedpost + Registered Air Mail
            methods.push({
                id: 'speedpost',
                name: 'Speedpost Express (Tracking, 1-5 days)',
                cost: _shipGetSpeedpostRate(country, totalGrams),
                deliveryTime: _shipGetDeliveryTime(country)
            });
            methods.push({
                id: 'airmail',
                name: 'Registered Air Mail (Tracking, 7-24 days)',
                cost: _shipGetAirmailRate(country, totalGrams),
                deliveryTime: _shipGetAirmailDeliveryTime(country)
            });
        }

        window._shippingMethods = methods;

        // Set first method as default
        if (methods.length > 0) {
            window._selectedMethodId = methods[0].id;
            window._shippingCost = methods[0].cost;
            window._shippingMethod = methods[0].name;
        }

        // Update free shipping banner
        var freeEl = document.getElementById('shippingFree');
        if (isFreeShipping) {
            if (freeEl) {
                freeEl.style.display = 'block';
                if (hasFreeGift) {
                    freeEl.textContent = 'Free Shipping (Free Gift in cart!)';
                } else {
                    freeEl.textContent = 'Free Shipping (Order over US$' + SHIP_FREE_THRESHOLD + ')';
                }
            }
        } else {
            if (freeEl) freeEl.style.display = 'none';
        }

        renderShippingMethods(methods, isFreeShipping);
        updateShippingLine();

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
            var productImageHtml = product.image
                ? '<img src="' + product.image + '" alt="' + product.name + '" style="max-width:100%;max-height:100%;object-fit:contain;cursor:pointer;" onclick="window.openLightbox(\'' + product.image + '\', \'' + product.name + '\')">'
                : '<span style="font-size:5rem;">' + icon + '</span>';
            modalContent.innerHTML = [
                '<div class="modal-product-image ' + colorClasses[idx] + '">',
                    productImageHtml,
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
        popupIcon.textContent = opts.icon || '🎉';
        popupTitle.textContent = opts.title || '';
        popupText.textContent = opts.text || '';
        popupActions.innerHTML = '';
        if (opts.buttons) {
            opts.buttons.forEach(function(btn) {
                var el = document.createElement('button');
                el.className = 'btn ' + (btn.className || 'btn-primary');
                el.textContent = btn.label;
                el.addEventListener('click', function(e) {
                    if (btn.action) btn.action(e);
                    if (btn.closeOnClick !== false) {
                        popupOverlay.classList.remove('active');
                    }
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

    // Gift timer banner (check if user has an active gift claim)
    var giftExpires = localStorage.getItem('funfairday_gift_expires');
    if (giftExpires) {
        var remaining = parseInt(giftExpires) - Date.now();
        if (remaining > 0) {
            var mins = Math.floor(remaining / 60000);
            var secs = Math.floor((remaining % 60000) / 1000);
            var timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
            setTimeout(function() {
                showPopup({
                    icon: '🎁',
                    title: 'Free Gift Added!',
                    text: 'You have ' + timeStr + ' remaining to checkout with your free gift!',
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
                            action: function() {}
                        }
                    ]
                });
            }, 500);
        } else {
            // Expired - clean up
            localStorage.removeItem('funfairday_gift_expires');
            localStorage.removeItem('funfairday_gift_code');
        }
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
            window._authChecked = true;
            const authLink = document.getElementById('authLink');
            if (authLink) {
                if (session) {
                    window._isLoggedIn = true;
                    authLink.textContent = 'My Account';
                    authLink.href = 'account.html';
                } else {
                    authLink.textContent = 'Sign In';
                    authLink.href = 'login.html';
                }
            }
        });
    }

    // --- Checkout Resume After Login ---
    (function() {
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('checkout') === '1') {
            // Clean URL (remove checkout param)
            if (window.history && window.history.replaceState) {
                var cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
                window.history.replaceState({}, '', cleanUrl);
            }
            // Wait for auth state to resolve, then restore state and trigger checkout
            var resumeCheckout = function() {
                var savedState = sessionStorage.getItem('funfairday_checkout_state');
                if (!savedState) return;
                sessionStorage.removeItem('funfairday_checkout_state');
                try {
                    var state = JSON.parse(savedState);
                    var countrySelect = document.getElementById('shippingCountry');
                    if (countrySelect && state.country) {
                        countrySelect.value = state.country;
                    }
                    if (state.shippingCost !== undefined) {
                        window._shippingCost = state.shippingCost;
                    }
                    if (state.shippingMethod) {
                        window._shippingMethod = state.shippingMethod;
                    }
                    if (state.methodId) {
                        window._selectedMethodId = state.methodId;
                    }
                    // Recalculate shipping and then start checkout
                    if (typeof window._calculateShipping === 'function' && state.country) {
                        window._calculateShipping(state.country).then(function() {
                            setTimeout(function() {
                                var btn = document.getElementById('checkoutBtn');
                                if (btn) btn.click();
                            }, 300);
                        }).catch(function() {
                            // If shipping recalc fails, still try to start checkout
                            setTimeout(function() {
                                var btn = document.getElementById('checkoutBtn');
                                if (btn) btn.click();
                            }, 300);
                        });
                    } else {
                        setTimeout(function() {
                            var btn = document.getElementById('checkoutBtn');
                            if (btn) btn.click();
                        }, 500);
                    }
                } catch(e) {
                    console.log('Resume checkout error:', e);
                }
            };
            // Wait for auth check to complete (poll _authChecked up to 5 seconds)
            var pollCount = 0;
            var pollInterval = setInterval(function() {
                pollCount++;
                if (pollCount > 50) { // 5 second timeout
                    clearInterval(pollInterval);
                    resumeCheckout();
                    return;
                }
                if (window._authChecked === true) {
                    clearInterval(pollInterval);
                    resumeCheckout();
                }
            }, 100);
        }
    })();

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
