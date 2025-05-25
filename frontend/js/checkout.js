document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkoutForm');
    const orderTypeSelect = document.getElementById('orderType');
    const deliveryAddressFields = document.getElementById('deliveryAddressFields');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    const cardNumberInput = document.getElementById('cardNumber');
    const expiryDateInput = document.getElementById('expiryDate');

    const checkoutOrderSummaryEl = document.getElementById('checkoutOrderSummary');
    const summarySubtotalEl = document.getElementById('summary-subtotal');
    const summaryDiscountEl = document.getElementById('summary-discount');
    const summaryDiscountRowEl = document.getElementById('summary-discount-row');
    const summaryTotalEl = document.getElementById('summary-total');

    const CHECKOUT_FORM_STORAGE_KEY = 'corkGrillCheckoutForm';

    // Basic form validation functions
    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        const errorElement = formGroup.querySelector('.form-error');
        inputElement.classList.add('is-invalid');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        const errorElement = formGroup.querySelector('.form-error');
        inputElement.classList.remove('is-invalid');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    function validateField(inputElement) {
        clearError(inputElement);
        let isValid = true;
        const value = inputElement.value.trim();
        const rawValue = inputElement.value.replace(/\s/g, ''); 

        if (inputElement.required && value === '') {
            showError(inputElement, `${inputElement.labels[0].textContent} is required.`);
            isValid = false;
        } else if (inputElement.type === 'email' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showError(inputElement, 'Please enter a valid email address.');
            isValid = false;
        } else if (inputElement.type === 'tel' && value !== '' && !/^\+?[0-9\s\-()]{7,20}$/.test(value)) {
            showError(inputElement, 'Please enter a valid phone number.');
            isValid = false;
        } else if (inputElement.name === 'cardNumber' && value !== '' && !/^\d{13,19}$/.test(rawValue)) {
            showError(inputElement, 'Please enter a valid card number (13-19 digits).');
            isValid = false;
        } else if (inputElement.name === 'expiryDate' && value !== '' && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
            showError(inputElement, 'Enter expiry as MM/YY.');
            isValid = false;
        } else if (inputElement.name === 'cvv' && value !== '' && !/^\d{3,4}$/.test(value)) {
            showError(inputElement, 'CVV must be 3 or 4 digits.');
            isValid = false;
        }
        return isValid;
    }

    function validateForm() {
        let isFormValid = true;
        if (!checkoutForm) return false; 
        const inputsToValidate = checkoutForm.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputsToValidate.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        if (orderTypeSelect && orderTypeSelect.value === 'delivery') {
            if (deliveryAddressFields) {
                deliveryAddressFields.querySelectorAll('input').forEach(input => {
                    input.required = true;
                    if (!validateField(input)) {
                        isFormValid = false;
                    }
                });
            }
        } else {
             if (deliveryAddressFields) {
                deliveryAddressFields.querySelectorAll('input').forEach(input => {
                    input.required = false;
                    clearError(input);
                });
            }
        }
        return isFormValid;
    }


    function toggleDeliveryFields() {
        if (!orderTypeSelect || !deliveryAddressFields) return; 

        if (orderTypeSelect.value === 'delivery') {
            deliveryAddressFields.style.display = 'block';
            deliveryAddressFields.querySelectorAll('input').forEach(input => input.required = true);
        } else {
            deliveryAddressFields.style.display = 'none';
            deliveryAddressFields.querySelectorAll('input').forEach(input => {
                input.required = false;
                clearError(input);
            });
        }
    }

    function populateOrderSummary() {
        const cart = getCart(); 
        if (!checkoutOrderSummaryEl || cart.length === 0) {
            if (checkoutOrderSummaryEl) checkoutOrderSummaryEl.innerHTML = '<p>Your cart is empty. <a href="menu.html">Continue shopping?</a></p>';
            if(placeOrderBtn) placeOrderBtn.disabled = true;
            return;
        }
         if(placeOrderBtn) placeOrderBtn.disabled = false;

        let summaryHtml = '';
        cart.forEach(item => {
            summaryHtml += `
                <div class="summary-item">
                    <div class="item-info">
                        <span class="item-name">${item.name}</span>
                        <span class="item-qty">(Qty: ${item.quantity})</span>
                    </div>
                    <span class="item-price">${formatPrice(item.priceAtAddition * item.quantity)}</span>
                </div>
            `;
        });
        if (checkoutOrderSummaryEl) checkoutOrderSummaryEl.innerHTML = summaryHtml;

        const subtotal = parseFloat(localStorage.getItem('cartSubtotal') || 0);
        const discount = parseFloat(localStorage.getItem('cartDiscount') || 0);
        const total = parseFloat(localStorage.getItem('cartTotal') || 0);

        if (summarySubtotalEl) summarySubtotalEl.textContent = formatPrice(subtotal);
        if (summaryDiscountEl && summaryDiscountRowEl) {
            if (discount > 0) {
                summaryDiscountEl.textContent = `-${formatPrice(discount)}`;
                summaryDiscountRowEl.style.display = 'flex';
            } else {
                summaryDiscountRowEl.style.display = 'none';
            }
        }
        if (summaryTotalEl) summaryTotalEl.textContent = formatPrice(total);
    }
    
    function saveFormData() {
        if (!checkoutForm) return; 
        const formData = new FormData(checkoutForm);
        const dataObject = {};
        formData.forEach((value, key) => dataObject[key] = value);
        localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(dataObject));
    }

    function loadFormData() {
        if (!checkoutForm) return; 
        const savedData = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
        if (savedData) {
            const dataObject = JSON.parse(savedData);
            for (const key in dataObject) {
                if (checkoutForm.elements[key]) {
                    checkoutForm.elements[key].value = dataObject[key];
                }
            }
            if (orderTypeSelect) toggleDeliveryFields();
        }
    }

    function formatCardNumber(event) {
        let input = event.target;
        let value = input.value.replace(/\D/g, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        input.value = formattedValue.substring(0, 19);
    }

    function formatExpiryDate(event) {
        let input = event.target;
        let value = input.value.replace(/\D/g, '');
        let formattedValue = '';

        if (value.length > 0) {
            formattedValue += value.substring(0, 2);
        }
        if (value.length >= 2) {
            // Ensure the slash is only added once and correctly
            if (value.length > 2) {
                formattedValue = value.substring(0,2) + '/' + value.substring(2,4);
            } else { // value.length is exactly 2
                formattedValue = value.substring(0,2) + '/';
            }
        }
        input.value = formattedValue.substring(0, 5); // MM/YY or MM/
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        if (!validateForm()) {
            if (checkoutForm) {
                const firstInvalid = checkoutForm.querySelector('.is-invalid');
                if (firstInvalid) firstInvalid.focus();
            }
            return;
        }

        if (placeOrderBtn) {
            placeOrderBtn.classList.add('is-loading');
            placeOrderBtn.disabled = true;
        }

        const orderData = {};
        if (checkoutForm) {
            const formData = new FormData(checkoutForm);
            formData.forEach((value, key) => {
                if (key === 'cardNumber') {
                    orderData[key] = value.replace(/\s/g, '');
                } else {
                    orderData[key] = value;
                }
            });
        }
        
        const cartItems = getCart(); 
        const orderTotal = parseFloat(localStorage.getItem('cartTotal') || 0);
        
        const fullOrder = {
            orderDetails: orderData,
            items: cartItems, // Get cart items BEFORE clearing the cart
            totalAmount: orderTotal,
            subtotal: parseFloat(localStorage.getItem('cartSubtotal') || 0),
            discount: parseFloat(localStorage.getItem('cartDiscount') || 0),
            promoCode: localStorage.getItem('appliedPromoCode') || null,
            orderId: `CG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            orderDate: new Date().toISOString()
        };

        // --- DEBUGGING LOGS ADDED HERE ---
        console.log("Attempting to save order:", JSON.parse(JSON.stringify(fullOrder))); // Deep copy for logging
        let orders = JSON.parse(localStorage.getItem('corkGrillOrders')) || [];
        console.log("Existing orders before push:", JSON.parse(JSON.stringify(orders))); 
        orders.push(fullOrder);
        localStorage.setItem('corkGrillOrders', JSON.stringify(orders));
        console.log("Set corkGrillOrders. Value in localStorage RIGHT AFTER SETTING:", localStorage.getItem('corkGrillOrders'));
        // --- END DEBUGGING LOGS ---
        
        clearCart(); 
        console.log("Cart cleared. Current cart in localStorage:", localStorage.getItem('corkGrillCart')); // Log cart after clear
        localStorage.removeItem('cartSubtotal');
        localStorage.removeItem('cartDiscount');
        localStorage.removeItem('cartTotal');
        localStorage.removeItem('appliedPromoCode');
        localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
        console.log("Other cart/checkout related localStorage items removed.");

        console.log('Order Placed and all data cleared/saved. Preparing to redirect...');
        console.log('Value of corkGrillOrders in localStorage BEFORE redirect timeout:', localStorage.getItem('corkGrillOrders')); // FINAL CHECK
        // --- END DEBUGGING LOGS ---

        setTimeout(() => {
            console.log('Redirecting now to order-confirmation.html. Value of corkGrillOrders just before redirect:', localStorage.getItem('corkGrillOrders'));
            window.location.href = `order-confirmation.html?orderId=${fullOrder.orderId}`;
        }, 1500); // Slightly increased timeout for easier observation in devtools
    }

    // --- Initialization ---
    if (checkoutForm) {
        loadFormData(); 
        populateOrderSummary(); 

        if (orderTypeSelect) {
            orderTypeSelect.addEventListener('change', () => {
                toggleDeliveryFields();
                saveFormData(); 
            });
        }
        
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', formatCardNumber);
        }
        if (expiryDateInput) {
            // A slight refinement to expiry formatting to prevent double slash on backspace
            expiryDateInput.addEventListener('input', (event) => {
                let input = event.target;
                let value = input.value.replace(/\D/g, ''); // Remove non-digits
                let formattedValue = '';

                if (value.length > 0) {
                    formattedValue += value.substring(0, 2);
                }
                if (value.length >= 2) { // If 2 or more digits, add slash
                    formattedValue = value.substring(0,2) + '/' + value.substring(2,4);
                }
                input.value = formattedValue.substring(0, 5); // MM/YY
            });
        }
        
        checkoutForm.addEventListener('input', saveFormData); 
        checkoutForm.addEventListener('submit', handleFormSubmit);
    }
});