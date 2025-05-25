// Client-side shopping cart logic using localStorage

function getCart() {
    return JSON.parse(localStorage.getItem('corkGrillCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('corkGrillCart', JSON.stringify(cart));
    updateCartCount();
}

// js/cart.js // This comment is fine

// ... (getCart and saveCart remain the same) ... // This comment is fine

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); // totalItems defined here

    // Update header cart count(s)
    const cartCountElements = document.querySelectorAll('.cart-link .cart-count'); 
    if (cartCountElements.length > 0) {
        cartCountElements.forEach(cartCountElement => { 
            if (cartCountElement) { 
                cartCountElement.textContent = `(${totalItems})`;
                if (totalItems > 0 && !cartCountElement.classList.contains('has-items')) {
                    cartCountElement.classList.add('has-items'); 
                } else if (totalItems === 0 && cartCountElement.classList.contains('has-items')) {
                    cartCountElement.classList.remove('has-items');
                }
            }
        });
    }

    // --- Flying Basket Logic MOVED INSIDE updateCartCount ---
    const flyingBasketBtn = document.getElementById('flyingBasketBtn');
    if (flyingBasketBtn) {
        const flyingBasketCountEl = flyingBasketBtn.querySelector('.flying-basket-count');
        if (flyingBasketCountEl) {
            flyingBasketCountEl.textContent = `(${totalItems})`; // Uses totalItems from this function's scope
        }

        const wasVisible = flyingBasketBtn.classList.contains('visible');

        if (totalItems > 0) {
            flyingBasketBtn.classList.add('visible');
            if (!wasVisible) { 
                flyingBasketBtn.classList.add('animate-pulse');
                setTimeout(() => {
                    flyingBasketBtn.classList.remove('animate-pulse');
                }, 800); 
            }
        } else {
            flyingBasketBtn.classList.remove('visible');
        }
    }
    // --- END: Flying Basket Logic ---
} // This is the closing brace for updateCartCount

function clearCart() {
    localStorage.removeItem('corkGrillCart');
    updateCartCount();
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});