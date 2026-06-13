// Main Application Logic
document.addEventListener('DOMContentLoaded', function() {

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
                const response = await fetch('/.netlify/functions/get-latest-video', {
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
            emptyState.style.display = 'flex';
            cartFooter.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        cartFooter.style.display = 'block';

        cartItems.innerHTML = items.map(item => {
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
                            <button class="cart-qty-btn" data-action="increase" data-id="${item.id}">+</button>
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

        cartTotal.textContent = '$' + Cart.getTotal().toFixed(2);

        document.querySelectorAll('.cart-qty-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                const action = this.dataset.action;
                const item = Cart.getItems().find(i => i.id === id);
                if (!item) return;

                if (action === 'increase') {
                    Cart.updateQuantity(id, item.quantity + 1);
                } else if (action === 'decrease') {
                    Cart.updateQuantity(id, item.quantity - 1);
                }
                renderCartItems();
                updateCartBadge();
            });
        });

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                Cart.removeItem(id);
                renderCartItems();
                updateCartBadge();
            });
        });
    }

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
                var useDynamicPrices = discountActive;

                // Build items for Stripe (exclude $0 free gift items without priceId)
                var stripeItems = updatedItems
                    .filter(function(item) {
                        var prod = products.find(function(p) { return p.id === item.id; });
                        return prod && (prod.stripePriceId || discountActive);
                    })
                    .map(function(item) {
                        var prod = products.find(function(p) { return p.id === item.id; });
                        var basePrice = prod ? prod.price : item.price;
                        var unitAmount = discountActive ? Math.round(basePrice * 0.7 * 100) : null;
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

                var response = await fetch('/.netlify/functions/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: stripeItems,
                        cartItems: cartItems,
                        total: Cart.getTotal(),
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
        var bundleInCart = items.some(function(i) { return i.id === 'bundle-5pcs-stick' || i.productId === 'bundle-5pcs-stick'; });

        if (!bundleInCart) {
            // Show bundle offer popup
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

        // No bundle offer needed, proceed directly
        proceedCheckout.call(this);
    });

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

    // Gift code detection
    var giftParams = new URLSearchParams(window.location.search);
    var giftCode = giftParams.get('gift');

    if (giftCode) {
        // Wait for products to load, then claim
        var claimGift = function() {
            fetch('/.netlify/functions/claim-gift', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: giftCode, session: sessionId })
            })
            .then(function(r) { return r.json(); })
            .then(function(result) {
                if (result.success) {
                    // Claim successful - add free gift to cart
                    var freeGift = products.find(function(p) { return p.id === 'free-sticker-gift'; });
                    if (freeGift) {
                        Cart.addItem(freeGift, 1);
                        // Store gift code for checkout tracking
                        localStorage.setItem('funfairday_gift_code', giftCode);
                        showPopup({
                            icon: '🎁',
                            title: 'Free Gift Claimed!',
                            text: 'The free gift claim process will close after 30mins, please process the checkout now.',
                            buttons: [
                                { label: 'OK', className: 'btn-primary', action: function() {
                                    openCart();
                                }}
                            ]
                        });
                    }
                } else if (result.error === 'claimed') {
                    // Gift is held by someone else - show 30% off offer
                    if (!localStorage.getItem('funfairday_discount30')) {
                        showPopup({
                            icon: '😢',
                            title: 'Sorry, claimed already!',
                            text: 'Sorry the Free Gift has already been claimed, please wait for the new one! Good Luck',
                            buttons: [
                                {
                                    label: 'Buy everything in 30% offer for your support',
                                    className: 'btn-danger',
                                    action: function() {
                                        localStorage.setItem('funfairday_discount30', 'true');
                                        showDiscountBanner();
                                        updateCartUI();
                                        showToast('30% discount applied to all products!');
                                    }
                                }
                            ]
                        });
                    }
                }
            })
            .catch(function(err) {
                console.error('Gift claim error:', err);
            });
        };

        // Run after products are loaded
        if (window.__publicDataLoaded !== undefined) {
            claimGift();
        } else {
            document.addEventListener('publicDataLoaded', function() { claimGift(); });
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
