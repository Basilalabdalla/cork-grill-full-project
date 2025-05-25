document.addEventListener('DOMContentLoaded', function() {
    const authFormsContainer = document.getElementById('authFormsContainer');
    const accountDashboardContainer = document.getElementById('accountDashboardContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const welcomeMessageEl = document.getElementById('welcomeMessage');
    const accountPageTitleEl = document.getElementById('accountPageTitle');
    const orderHistoryContainer = document.getElementById('orderHistoryContainer');
    
    const authTabs = document.querySelectorAll('.auth-tabs .tab-link');
    const authTabContents = document.querySelectorAll('.auth-tab-content');

    const orderDetailModal = document.getElementById('orderDetailModal');
    const closeModalBtn = orderDetailModal ? orderDetailModal.querySelector('.close-modal-btn') : null;
    const modalOrderContentEl = document.getElementById('modalOrderContent');

    const USER_STORAGE_KEY = 'corkGrillUser';

    // --- Helper functions from checkout.js (could be moved to a shared utils.js) ---
    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        const errorElement = formGroup ? formGroup.querySelector('.form-error') : null;
        if (inputElement) inputElement.classList.add('is-invalid');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        const errorElement = formGroup ? formGroup.querySelector('.form-error') : null;
        if (inputElement) inputElement.classList.remove('is-invalid');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    // --- End Helper functions ---

    function checkLoginState() {
        const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
        if (user && user.isLoggedIn) {
            if (authFormsContainer) authFormsContainer.style.display = 'none';
            if (accountDashboardContainer) accountDashboardContainer.style.display = 'block';
            if (welcomeMessageEl) welcomeMessageEl.textContent = `Welcome, ${user.name}!`;
            if (accountPageTitleEl) accountPageTitleEl.textContent = 'Your Dashboard';
            displayOrderHistory();
        } else {
            if (authFormsContainer) authFormsContainer.style.display = 'block';
            if (accountDashboardContainer) accountDashboardContainer.style.display = 'none';
            if (accountPageTitleEl) accountPageTitleEl.textContent = 'My Account';
        }
    }

    function handleLogin(event) {
        event.preventDefault();
        const email = loginForm.loginEmail.value;
        const password = loginForm.loginPassword.value; // In real app, hash and compare
        const feedbackEl = document.getElementById('loginFeedback');
        feedbackEl.textContent = '';
        feedbackEl.className = 'form-feedback-message';


        // Basic validation
        let isValid = true;
        if (!email) { showError(loginForm.loginEmail, 'Email is required.'); isValid = false; } 
        else { clearError(loginForm.loginEmail); }
        if (!password) { showError(loginForm.loginPassword, 'Password is required.'); isValid = false; }
        else { clearError(loginForm.loginPassword); }
        if (!isValid) return;

        // Simulate login: For this prototype, any stored user with matching email "logs in"
        // In a real app, this would be an API call.
        // We'll just use a dummy user for now if no registration has occurred.
        const registeredUsers = JSON.parse(localStorage.getItem('corkGrillRegisteredUsers')) || [];
        const foundUser = registeredUsers.find(u => u.email === email);

        // SIMPLIFIED: If email is test@example.com and password is 'password', or a registered user matches
        if ((email === 'test@example.com' && password === 'password123') || (foundUser && foundUser.password === password) ) {
            const userName = foundUser ? foundUser.name : 'Test User';
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ name: userName, email: email, isLoggedIn: true }));
            feedbackEl.textContent = 'Login successful! Redirecting...';
            feedbackEl.classList.add('success');
            setTimeout(() => checkLoginState(), 1000);
        } else {
            feedbackEl.textContent = 'Invalid email or password.';
            feedbackEl.classList.add('error');
        }
    }

    function handleRegister(event) {
        event.preventDefault();
        const name = registerForm.registerName.value;
        const email = registerForm.registerEmail.value;
        const password = registerForm.registerPassword.value;
        const confirmPassword = registerForm.confirmPassword.value;
        const feedbackEl = document.getElementById('registerFeedback');
        feedbackEl.textContent = '';
        feedbackEl.className = 'form-feedback-message';

        let isValid = true;
        // Basic validation (can be expanded from checkout.js validation logic)
        if (!name) { showError(registerForm.registerName, 'Name is required.'); isValid = false; } 
        else { clearError(registerForm.registerName); }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(registerForm.registerEmail, 'Valid email is required.'); isValid = false; }
        else { clearError(registerForm.registerEmail); }
        if (!password || password.length < 8) { showError(registerForm.registerPassword, 'Password must be at least 8 characters.'); isValid = false; }
        else { clearError(registerForm.registerPassword); }
        if (password !== confirmPassword) { showError(registerForm.confirmPassword, 'Passwords do not match.'); isValid = false; }
        else { clearError(registerForm.confirmPassword); }
        
        if (!isValid) return;

        // Simulate registration
        let registeredUsers = JSON.parse(localStorage.getItem('corkGrillRegisteredUsers')) || [];
        if (registeredUsers.find(u => u.email === email)) {
            feedbackEl.textContent = 'Email already registered. Please login.';
            feedbackEl.classList.add('error');
            showError(registerForm.registerEmail, 'Email already registered.');
            return;
        }

        registeredUsers.push({ name, email, password /* In real app, HASH password */ });
        localStorage.setItem('corkGrillRegisteredUsers', JSON.stringify(registeredUsers));

        feedbackEl.textContent = 'Registration successful! Please login.';
        feedbackEl.classList.add('success');
        registerForm.reset();
        // Switch to login tab after successful registration
        switchTab('loginTab');
    }

    function handleLogout() {
        localStorage.removeItem(USER_STORAGE_KEY);
        checkLoginState();
    }

    function switchTab(tabId) {
        authTabContents.forEach(content => content.classList.remove('active'));
        authTabs.forEach(tab => tab.classList.remove('active'));

        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.add('active');
    }

    function displayOrderHistory() {
        if (!orderHistoryContainer) return;
        const orders = JSON.parse(localStorage.getItem('corkGrillOrders')) || [];

        if (orders.length === 0) {
            orderHistoryContainer.innerHTML = '<p class="no-orders-message">You have no past orders.</p>';
            return;
        }

        // Sort orders by date, newest first
        orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        let historyHtml = '';
        orders.forEach(order => {
            historyHtml += `
                <div class="order-history-item">
                    <div class="order-info">
                        <div>
                            <span class="order-id">Order ID: ${order.orderId}</span><br>
                            <span class="order-date">Date: ${new Date(order.orderDate).toLocaleDateString()} at ${new Date(order.orderDate).toLocaleTimeString()}</span>
                        </div>
                        <div class="order-total">Total: <strong>${formatPrice(order.totalAmount)}</strong></div>
                    </div>
                    <button class="btn btn-outline-primary btn-sm view-details-btn" data-order-id="${order.orderId}">View Details</button>
                </div>
            `;
        });
        orderHistoryContainer.innerHTML = historyHtml;
        attachOrderViewListeners();
    }

    function attachOrderViewListeners() {
        orderHistoryContainer.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.dataset.orderId;
                openOrderDetailModal(orderId);
            });
        });
    }

    function openOrderDetailModal(orderId) {
        if (!orderDetailModal || !modalOrderContentEl) return;
        const orders = JSON.parse(localStorage.getItem('corkGrillOrders')) || [];
        const order = orders.find(o => o.orderId === orderId);

        if (!order) {
            modalOrderContentEl.innerHTML = '<p>Order details not found.</p>';
            orderDetailModal.classList.add('open');
            return;
        }

        let itemsHtml = '<div class="modal-items-list"><h4>Items:</h4>';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="modal-item">
                    <div>
                        <span class="item-name">${item.name}</span>
                        <span class="item-qty">(Qty: ${item.quantity})</span>
                        ${item.isMeal ? '<span class="meal-badge" style="font-size:0.8em; margin-left:5px; background-color: #F1C40F; color:#333; padding: 2px 4px; border-radius:3px;">MEAL</span>':''}
                        ${renderModalCustomizations(item, order.orderDetails.email)}
                    </div>
                    <span>${formatPrice(item.priceAtAddition * item.quantity)}</span>
                </div>`;
        });
        itemsHtml += '</div>';
        
        // To find item details for customizations, we need to reference original menu data
        // This is a simplified version as item data isn't passed directly to order object in full
        function renderModalCustomizations(cartItem, userEmail) {
            // For the My Account page, orders are associated with *all* users for this prototype.
            // A real system would filter orders by the logged-in user's ID.
            // Since we don't store user ID with orders, we'll assume the order belongs to the "logged-in" user.
            let custHtml = '';
            const menuItem = menuItemsData.items.find(mi => mi.id === cartItem.id);
            if (cartItem.customizations && menuItem && menuItem.customizableOptions) {
                custHtml += '<ul class="item-customizations">';
                for (const groupId in cartItem.customizations) {
                    const groupData = menuItem.customizableOptions.find(g => g.id === groupId);
                    if (groupData) {
                        if (groupData.type === 'radio') {
                            const optionId = cartItem.customizations[groupId];
                            const optionData = groupData.options.find(o => o.id === optionId);
                            if (optionData) custHtml += `<li>${groupData.name}: ${optionData.name}</li>`;
                        } else if (groupData.type === 'checkbox') {
                            for (const optionId in cartItem.customizations[groupId]) {
                                if (cartItem.customizations[groupId][optionId]) {
                                    const mainOptionData = groupData.options ? groupData.options.find(o => o.id === optionId) : groupData;
                                    if (mainOptionData) custHtml += `<li>${mainOptionData.name}</li>`;
                                }
                            }
                        }
                    }
                }
                custHtml += '</ul>';
            }
            return custHtml;
        }


        modalOrderContentEl.innerHTML = `
            <div class="order-detail-header">
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Name:</strong> ${order.orderDetails.checkoutName || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.orderDetails.checkoutEmail || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.orderDetails.checkoutPhone || 'N/A'}</p>
                <p><strong>Order Type:</strong> ${order.orderDetails.orderType || 'N/A'}</p>
                ${order.orderDetails.orderType === 'delivery' ? `
                    <p><strong>Delivery Address:</strong> 
                        ${order.orderDetails.streetAddress || ''}, 
                        ${order.orderDetails.city || ''}, 
                        ${order.orderDetails.postcode || ''}
                    </p>
                ` : ''}
            </div>
            ${itemsHtml}
            <div class="modal-summary-totals">
                <div class="summary-row"><span>Subtotal:</span> <span>${formatPrice(order.subtotal)}</span></div>
                ${order.discount > 0 ? `<div class="summary-row"><span>Discount (${order.promoCode || ''}):</span> <span style="color:${DUMMY_PROMO_CODES && DUMMY_PROMO_CODES[order.promoCode] ? '$success-color':'$text-color'}">-${formatPrice(order.discount)}</span></div>` : ''}
                <div class="summary-row total-row"><strong>Total Paid:</strong> <strong>${formatPrice(order.totalAmount)}</strong></div>
            </div>
        `;
        orderDetailModal.classList.add('open');
    }

    function closeOrderDetailModal() {
        if (orderDetailModal) orderDetailModal.classList.remove('open');
    }


    // --- Initialization & Event Listeners ---
    if (authTabs.length > 0) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });
    }

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeOrderDetailModal);
    if (orderDetailModal) { // Close modal if clicking outside the content
        orderDetailModal.addEventListener('click', function(event) {
            if (event.target === orderDetailModal) {
                closeOrderDetailModal();
            }
        });
    }

    checkLoginState(); // Initial check when page loads
});