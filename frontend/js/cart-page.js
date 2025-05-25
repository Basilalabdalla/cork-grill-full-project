document.addEventListener('DOMContentLoaded', function() {
    const cartContainer = document.getElementById('cart-container');
    const cartSummaryContainer = document.getElementById('cart-summary-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount');
    const discountRowEl = document.getElementById('discount-row');
    const totalEl = document.getElementById('cart-total');
    const promoCodeInput = document.getElementById('promo-code-input');
    const applyPromoBtn = document.getElementById('apply-promo-btn');
    const promoFeedbackEl = document.getElementById('promo-feedback');
    const checkoutBtn = document.getElementById('proceed-to-checkout-btn');

    const DUMMY_PROMO_CODES = {
        "SAVE10": { type: "percentage", value: 10 },
        "CORK5": { type: "fixed", value: 5 }
    };
    let appliedPromo = null;

    function renderCart() {
        const cart = getCart();
        cartContainer.innerHTML = ''; 

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart-message">
                    <p>Your cart is currently empty.</p>
                    <a href="menu.html" class="btn btn-primary">Browse Our Menu</a>
                </div>`;
            if(cartSummaryContainer) cartSummaryContainer.style.display = 'none';
            if (checkoutBtn) checkoutBtn.classList.add('disabled');
            updateCartSummary(); 
            return;
        }

        if(cartSummaryContainer) cartSummaryContainer.style.display = 'block';
        if (checkoutBtn) checkoutBtn.classList.remove('disabled');

        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.dataset.itemIndex = index; 

            let customizationsHtml = '';
            if (item.customizations && Object.keys(item.customizations).length > 0) {
                customizationsHtml += '<ul>';
                for (const groupId in item.customizations) {
                    const group = menuItemsData.items.find(i => i.id === item.id)?.customizableOptions?.find(g => g.id === groupId);
                    if (!group) continue;

                    if (group.type === 'radio') {
                        const optionId = item.customizations[groupId];
                        const option = group.options.find(opt => opt.id === optionId);
                        if (option) customizationsHtml += `<li>${group.name}: ${option.name}</li>`;
                    } else if (group.type === 'checkbox') {
                        for (const optionId in item.customizations[groupId]) {
                            if (item.customizations[groupId][optionId]) {
                                const mainOption = group.options ? group.options.find(opt => opt.id === optionId) : group;
                                if (mainOption) {
                                     customizationsHtml += `<li>${mainOption.name}</li>`;
                                }
                            }
                        }
                    }
                }
                customizationsHtml += '</ul>';
            }
            if (item.isMeal && item.mealDetails) {
                customizationsHtml += `<span class="meal-badge">MEAL</span>`;
            }

            itemElement.innerHTML = `
                <img src="${item.image || 'assets/images/food-placeholder-1.jpg'}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="item-name"><a href="item-detail.html?id=${item.id}">${item.name}</a></h3>
                    ${customizationsHtml ? `<div class="item-customizations">${customizationsHtml}</div>` : ''}
                    <p class="item-price-single">(${formatPrice(item.priceAtAddition)} each)</p>
                </div>
                <div class="cart-item-quantity-control">
                    <button class="quantity-btn decrease-quantity" data-index="${index}" aria-label="Decrease quantity">-</button>
                    <input type="number" class="item-quantity-input" value="${item.quantity}" min="0" max="10" data-index="${index}" aria-label="Item quantity">
                    <button class="quantity-btn increase-quantity" data-index="${index}" aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-item-actions-price">
                    <p class="item-total-price">${formatPrice(item.priceAtAddition * item.quantity)}</p>
                    <button class="remove-item-btn icon-btn" data-index="${index}" aria-label="Remove ${item.name} from cart" title="Remove item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            cartContainer.appendChild(itemElement);
        });
        attachCartItemEventListeners();
        updateCartSummary();
    }

    function updateCartItemQuantity(index, newQuantityStr) { // newQuantity can be string from input
        let cart = getCart();
        if (!cart[index]) return; // Item might have been removed by another action

        let newQuantity = parseInt(newQuantityStr);

        if (isNaN(newQuantity)) { // Handle NaN if user types non-numeric
            newQuantity = cart[index].quantity; // Revert to current quantity
            const quantityInput = cartContainer.querySelector(`.item-quantity-input[data-index="${index}"]`);
            if (quantityInput) quantityInput.value = newQuantity; // Update the input field visually
            return; // No further processing
        }

        if (newQuantity <= 0) {
            if (confirm(`Remove "${cart[index].name}" from your cart?`)) {
                removeCartItem(index);
            } else {
                // Revert quantity to 1 if user cancels removal
                cart[index].quantity = 1;
                saveCart(cart);
                renderCart(); // Re-render to show quantity as 1
            }
        } else {
            newQuantity = Math.min(10, newQuantity); // Clamp quantity (max 10)
            cart[index].quantity = newQuantity;
            saveCart(cart);
            renderCart(); 
        }
    }

    function removeCartItem(index) {
        let cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        renderCart(); 
        if (cart.length === 0) {
            appliedPromo = null;
            if(promoCodeInput) promoCodeInput.value = '';
            if(promoFeedbackEl) {
                promoFeedbackEl.textContent = '';
                promoFeedbackEl.className = 'promo-feedback-text';
            }
        }
    }

    function updateCartSummary() {
        const cart = getCart();
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.priceAtAddition * item.quantity;
        });

        let discountAmount = 0;
        if (appliedPromo && DUMMY_PROMO_CODES[appliedPromo]) {
            const promo = DUMMY_PROMO_CODES[appliedPromo];
            if (promo.type === "percentage") {
                discountAmount = (subtotal * promo.value) / 100;
            } else if (promo.type === "fixed") {
                discountAmount = promo.value;
            }
            discountAmount = Math.min(discountAmount, subtotal);
        }

        const total = subtotal - discountAmount;

        if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
        if (discountEl && discountRowEl) {
            if (discountAmount > 0) {
                discountEl.textContent = `-${formatPrice(discountAmount)}`;
                discountRowEl.style.display = 'flex'; 
            } else {
                discountRowEl.style.display = 'none';
            }
        }
        if (totalEl) totalEl.textContent = formatPrice(total);
        
        localStorage.setItem('cartSubtotal', subtotal.toFixed(2));
        localStorage.setItem('cartDiscount', discountAmount.toFixed(2));
        localStorage.setItem('cartTotal', total.toFixed(2));
        if (appliedPromo) {
            localStorage.setItem('appliedPromoCode', appliedPromo);
        } else {
            localStorage.removeItem('appliedPromoCode');
        }
    }

    function handleApplyPromoCode() {
        if (!promoCodeInput || !promoFeedbackEl) return;
        const code = promoCodeInput.value.trim().toUpperCase();
        promoFeedbackEl.textContent = '';
        promoFeedbackEl.className = 'promo-feedback-text';

        if (!code) {
            promoFeedbackEl.textContent = 'Please enter a promo code.';
            promoFeedbackEl.classList.add('error');
            return;
        }

        if (DUMMY_PROMO_CODES[code]) {
            appliedPromo = code;
            promoFeedbackEl.textContent = `Promo code "${code}" applied successfully!`;
            promoFeedbackEl.classList.add('success');
        } else {
            appliedPromo = null; 
            promoFeedbackEl.textContent = 'Invalid promo code.';
            promoFeedbackEl.classList.add('error');
        }
        updateCartSummary();
    }

    function attachCartItemEventListeners() {
        if (!cartContainer) return;

        cartContainer.addEventListener('click', function(event) {
            const target = event.target.closest('button'); // Delegate to buttons
            if (!target) return;

            const index = parseInt(target.dataset.index);
            let cart = getCart();

            if (target.classList.contains('decrease-quantity')) {
                if (cart[index]) { // Ensure item exists
                    updateCartItemQuantity(index, cart[index].quantity - 1);
                }
            } else if (target.classList.contains('increase-quantity')) {
                 if (cart[index]) { // Ensure item exists
                    updateCartItemQuantity(index, cart[index].quantity + 1);
                }
            } else if (target.classList.contains('remove-item-btn')) {
                 if (cart[index] && confirm(`Remove "${cart[index].name}" from your cart?`)) {
                    removeCartItem(index);
                }
            }
        });
        
        cartContainer.addEventListener('change', function(event){
            const target = event.target;
            if(target.classList.contains('item-quantity-input')) {
                const index = parseInt(target.dataset.index);
                updateCartItemQuantity(index, target.value); // Pass string value
            }
        });
    }

    if (cartContainer) { 
        const storedPromo = localStorage.getItem('appliedPromoCode');
        if (storedPromo && DUMMY_PROMO_CODES[storedPromo]) {
            appliedPromo = storedPromo;
            if (promoCodeInput) promoCodeInput.value = storedPromo;
        }
        
        renderCart(); // This will also call attachCartItemEventListeners implicitly after rendering
        
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', handleApplyPromoCode);
        }
        if (promoCodeInput) {
            promoCodeInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault(); 
                    handleApplyPromoCode();
                }
            });
        }
    }
});