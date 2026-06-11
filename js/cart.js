// Shopping Cart Module
const Cart = {
    items: [],
    storageKey: 'funfairday_cart',

    init() {
        this.load();
    },

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.items = data ? JSON.parse(data) : [];
        } catch (e) {
            this.items = [];
        }
    },

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    },

    getItems() {
        return [...this.items];
    },

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    addItem(product, quantity = 1, customization = null) {
        // For customized items, generate a unique ID based on selections
        let itemId = product.id;
        if (customization) {
            const customStr = customization.caseStyle + '_' + customization.caseColor + '_' + (customization.options || []).join('');
            itemId = product.id + '_' + btoa(customStr).replace(/=/g, '');
        }

        const existing = this.items.find(item => item.id === itemId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({
                id: itemId,
                productId: product.id,
                name: product.name,
                price: product.price,
                basePrice: product.price,
                quantity: quantity,
                category: product.category,
                image: product.image,
                badge: product.badge,
                caseStyle: customization ? customization.caseStyle : null,
                caseColor: customization ? customization.caseColor : null,
                options: customization ? customization.options : [],
                optionsText: customization ? customization.optionsText : ''
            });
        }
        this.save();
        this.onUpdate();
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.onUpdate();
    },

    updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            this.removeItem(productId);
            return;
        }
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.save();
            this.onUpdate();
        }
    },

    clear() {
        this.items = [];
        this.save();
        this.onUpdate();
    },

    onUpdate() {}
};

Cart.init();
