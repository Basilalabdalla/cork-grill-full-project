document.addEventListener('DOMContentLoaded', function() {
    const confirmedOrderIdEl = document.getElementById('confirmedOrderId');
    const confirmedOrderSummaryItemsEl = document.getElementById('confirmedOrderSummaryItems');
    const confirmedSubtotalEl = document.getElementById('confirmedSubtotal');
    const confirmedDiscountEl = document.getElementById('confirmedDiscount');
    const confirmedDiscountRowEl = document.getElementById('confirmedDiscountRow');
    const confirmedTotalEl = document.getElementById('confirmedTotal');

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function displayOrderDetails() {
        const orderId = getQueryParam('orderId');
        if (!orderId) {
            if (confirmedOrderIdEl) confirmedOrderIdEl.textContent = 'Error: Order ID missing.';
            if (confirmedOrderSummaryItemsEl) confirmedOrderSummaryItemsEl.innerHTML = '<p>Could not load order details.</p>';
            return;
        }

        if (confirmedOrderIdEl) confirmedOrderIdEl.textContent = orderId;

        const allOrders = JSON.parse(localStorage.getItem('corkGrillOrders')) || [];
        const currentOrder = allOrders.find(order => order.orderId === orderId);

        if (!currentOrder) {
            if (confirmedOrderSummaryItemsEl) confirmedOrderSummaryItemsEl.innerHTML = '<p>Order details not found. Please check "My Account" or contact support.</p>';
            return;
        }

        // Populate Order Items Summary
        if (confirmedOrderSummaryItemsEl) {
            let itemsHtml = '';
            currentOrder.items.forEach(item => {
                itemsHtml += `
                    <div class="summary-item">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-qty">(Qty: ${item.quantity})</span>
                        </div>
                        <span class="item-price">${formatPrice(item.priceAtAddition * item.quantity)}</span>
                    </div>
                `;
            });
            confirmedOrderSummaryItemsEl.innerHTML = itemsHtml || '<p>No items found in this order.</p>';
        }

        // Populate Totals
        if (confirmedSubtotalEl) confirmedSubtotalEl.textContent = formatPrice(currentOrder.subtotal || 0);
        if (confirmedDiscountEl && confirmedDiscountRowEl) {
            if (currentOrder.discount && currentOrder.discount > 0) {
                confirmedDiscountEl.textContent = `-${formatPrice(currentOrder.discount)}`;
                confirmedDiscountRowEl.style.display = 'flex';
            } else {
                confirmedDiscountRowEl.style.display = 'none';
            }
        }
        if (confirmedTotalEl) confirmedTotalEl.textContent = formatPrice(currentOrder.totalAmount || 0);

        // Clear cart count in header as order is confirmed (should already be done by checkout)
        updateCartCount();
    }

    // --- Initialization ---
    displayOrderDetails();
});