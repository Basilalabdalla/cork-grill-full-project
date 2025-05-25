// cork-grill/js/admin.js
document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element Selectors ---
    const adminSidebar = document.getElementById('adminSidebar');
    const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
    const sidebarToggleMobile = document.getElementById('sidebarToggleMobile');
    const adminMainContent = document.querySelector('.admin-main-content');
    const adminNavLinks = document.querySelectorAll('.admin-nav-link');
    const adminSections = document.querySelectorAll('.admin-section');
    const contactMessagesContainer = document.getElementById('contactMessagesContainer');
    const addPromoForm = document.getElementById('addPromoForm');
    const promotionsTableBody = document.getElementById('promotionsTableBody');
    const menuManagementSection = document.getElementById('menu-management');
    const adminAddNewItemBtn = document.getElementById('adminAddNewItemBtn');
    const addItemFormContainer = document.getElementById('addItemFormContainer');
    const menuItemForm = document.getElementById('menuItemForm');
    const cancelItemFormBtn = document.getElementById('cancelItemFormBtn');
    const itemFormTitle = document.getElementById('itemFormTitle');
    const displayItemIdGroup = document.getElementById('displayItemIdGroup');
    const displayItemIdText = document.getElementById('displayItemIdText'); 
    const itemFormHiddenIdInput = document.getElementById('editItemId');
    const itemFormCategoryIdSelect = document.getElementById('itemFormCategoryId');
    const menuItemFormFeedback = document.getElementById('menuItemFormFeedback');
    const adminCategoriesTableBody = document.getElementById('adminCategoriesTableBody');
    const adminMenuItemsTableBody = document.getElementById('adminMenuItemsTableBody');
    const adminCategoryFilterSelect = document.getElementById('adminCategoryFilter');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationModalTitle = document.getElementById('confirmationModalTitle');
    const confirmationModalMessage = document.getElementById('confirmationModalMessage');
    const confirmModalBtn = document.getElementById('confirmModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    let currentConfirmCallback = null;

    // --- Utility Functions ---
    function escapeHTML(str) { 
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, match => ({ '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;' }[match]));
    }
    function formatPrice(price) {
        if (typeof price !== 'number' || isNaN(price)) return '€--.--';
        return `€${Number(price).toFixed(2)}`;
    }
    function showToast(message, type = 'info', duration = 3500) {
        const container = document.getElementById('toast-container');
        if (!container) { console.warn('Toast container not found! Alerting.'); alert(`${type.toUpperCase()}: ${message}`); return; }
        const toast = document.createElement('div'); toast.className = `toast-message ${type}`;
        let iconHtml = '';
        if (type === 'success') iconHtml = `<span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>`;
        else if (type === 'error') iconHtml = `<span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>`;
        else if (type === 'info') iconHtml = `<span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>`;
        toast.innerHTML = `${iconHtml}<span>${escapeHTML(message)}</span>`; container.appendChild(toast);
        void toast.offsetWidth; toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => { if (toast.parentElement === container) toast.remove(); }, { once: true });
        }, duration);
    }
    function adminShowError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group'); if (!formGroup) return;
        const errorElement = formGroup.querySelector('.form-error'); inputElement.classList.add('is-invalid');
        if (errorElement) { errorElement.textContent = message; errorElement.style.display = 'block';}
    }
    function adminClearError(inputElement) {
        const formGroup = inputElement.closest('.form-group'); if(!formGroup) return;
        const errorElement = formGroup.querySelector('.form-error'); inputElement.classList.remove('is-invalid');
        if (errorElement) { errorElement.textContent = ''; errorElement.style.display = 'none';}
    }
    function showConfirmationModal(title, message, onConfirmCallback) {
        if (!confirmationModal || !confirmationModalTitle || !confirmationModalMessage) {
            console.error("Confirmation modal elements not found! Falling back to browser confirm.");
            if (confirm(message)) { if (typeof onConfirmCallback === 'function') onConfirmCallback(); }
            return;
        }
        confirmationModalTitle.textContent = title;
        confirmationModalMessage.innerHTML = message; // Use innerHTML for message if it contains HTML (like item names)
        currentConfirmCallback = onConfirmCallback; 
        confirmationModal.classList.add('open');
    }
    function hideConfirmationModal() {
        if (confirmationModal) confirmationModal.classList.remove('open');
        currentConfirmCallback = null; 
    }

    if (confirmModalBtn) { confirmModalBtn.addEventListener('click', () => { if (typeof currentConfirmCallback === 'function') currentConfirmCallback(); hideConfirmationModal(); }); }
    if (cancelModalBtn) { cancelModalBtn.addEventListener('click', hideConfirmationModal); }
    if (confirmationModal) { confirmationModal.addEventListener('click', (event) => { if (event.target === confirmationModal) hideConfirmationModal(); });}

    // --- Sidebar Toggle Logic ---
    // ... (Full, correct sidebar toggle logic as previously verified) ...
    if (sidebarToggleDesktop && adminSidebar && adminMainContent) {
        sidebarToggleDesktop.addEventListener('click', () => {
            if (window.innerWidth < 992) { adminSidebar.classList.add('open'); } 
            else {
                adminSidebar.classList.toggle('collapsed'); adminMainContent.classList.toggle('sidebar-collapsed');
                localStorage.setItem('adminSidebarCollapsed', adminSidebar.classList.contains('collapsed'));
            }
        });
        if (window.innerWidth >= 992 && localStorage.getItem('adminSidebarCollapsed') === 'true') {
            adminSidebar.classList.add('collapsed'); adminMainContent.classList.add('sidebar-collapsed');
        }
    }
    if (sidebarToggleMobile && adminSidebar) { sidebarToggleMobile.addEventListener('click', () => adminSidebar.classList.remove('open')); }


    // --- Contact Messages Logic ---
    function displayContactMessages() {
        if (!contactMessagesContainer) return;
        const messages = JSON.parse(localStorage.getItem('corkGrillContactMessages')) || [];
        contactMessagesContainer.innerHTML = ''; 
        if (messages.length === 0) { contactMessagesContainer.innerHTML = '<p class="no-messages">No contact messages received yet.</p>'; return; }
        messages.forEach(msg => { 
            const msgElement = document.createElement('div'); msgElement.classList.add('contact-message-item');
            if (msg.isRead) msgElement.classList.add('is-read');
            msgElement.dataset.messageId = msg.id; const receivedDate = new Date(msg.receivedAt);
            msgElement.innerHTML = `<div class="msg-header"><span class="msg-sender">From: <strong>${escapeHTML(msg.name)}</strong> <${escapeHTML(msg.email)}></span><span class="msg-date">${receivedDate.toLocaleDateString()} at ${receivedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><p class="msg-subject">Subject: ${escapeHTML(msg.subject)}</p><div class="msg-body">${escapeHTML(msg.message).replace(/\n/g, '<br>')}</div><div class="msg-actions">${!msg.isRead ? `<button class="btn btn-sm btn-outline-secondary mark-read-btn" data-message-id="${msg.id}">Mark as Read</button>` : '<button class="btn btn-sm btn-secondary mark-unread-btn" data-message-id="${msg.id}">Mark as Unread</button>'}<button class="btn btn-sm btn-danger delete-msg-btn" data-message-id="${msg.id}">Delete</button></div>`;
            contactMessagesContainer.appendChild(msgElement);
        });
    }
    function handleMessageAction(event) { // This is the single, corrected version
        const targetButton = event.target.closest('button[data-message-id]'); 
        if (!targetButton) return;
        const messageId = targetButton.dataset.messageId;
        let messages = JSON.parse(localStorage.getItem('corkGrillContactMessages')) || [];
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) { console.warn(`Message with ID ${messageId} not found for action.`); return; }

        if (targetButton.classList.contains('delete-msg-btn')) {
            const msgNameToDelete = messages[messageIndex].subject || `message from ${messages[messageIndex].name}`;
            showConfirmationModal(
                'Delete Message', 
                `Are you sure you want to delete "${escapeHTML(msgNameToDelete)}"?`, 
                () => {
                    messages.splice(messageIndex, 1); // Use splice on the found index
                    localStorage.setItem('corkGrillContactMessages', JSON.stringify(messages));
                    displayContactMessages(); 
                    showToast('Message deleted.', 'success');
                }
            );
        } else if (targetButton.classList.contains('mark-read-btn')) {
            messages[messageIndex].isRead = true;
            localStorage.setItem('corkGrillContactMessages', JSON.stringify(messages));
            displayContactMessages(); 
        } else if (targetButton.classList.contains('mark-unread-btn')) {
            messages[messageIndex].isRead = false;
            localStorage.setItem('corkGrillContactMessages', JSON.stringify(messages));
            displayContactMessages(); 
        }
    }
    if (contactMessagesContainer) { contactMessagesContainer.addEventListener('click', handleMessageAction); }

    // --- Menu Management Display Logic ---
    // ... (Full, correct menu display logic as previously verified) ...
    let allFetchedAdminCategories = []; 
    let allFetchedAdminMenuItems = [];  
    async function fetchAdminCategories() { /* ... */ }
    async function fetchAdminMenuItems() { /* ... */ }
    async function displayAdminMenuData() { /* ... */ }
    function displayAdminMenuItems(itemsToDisplay) { /* ... */ }
    // (Pasting full menu display logic again)
    async function fetchAdminCategories() {
        try { const response = await fetch('http://localhost:5001/api/categories'); if (!response.ok) throw new Error('Failed to fetch categories'); return await response.json(); } 
        catch (error) { console.error("Admin: Error fetching categories:", error); showToast(`Error fetching categories: ${error.message}`, 'error'); return []; }
    }
    async function fetchAdminMenuItems() {
        try { const response = await fetch('http://localhost:5001/api/menuitems'); if (!response.ok) throw new Error('Failed to fetch menu items'); return await response.json(); } 
        catch (error) { console.error("Admin: Error fetching menu items:", error); showToast(`Error fetching menu items: ${error.message}`, 'error'); return []; }
    }
    async function displayAdminMenuData() {
        if (!menuManagementSection) return;
        if (!adminCategoriesTableBody || !adminMenuItemsTableBody || !adminCategoryFilterSelect) { menuManagementSection.innerHTML = '<p class="error-text">Menu Management UI elements missing.</p>'; return; }
        adminCategoriesTableBody.innerHTML = '<tr><td colspan="3">Loading categories...</td></tr>';
        adminMenuItemsTableBody.innerHTML = '<tr><td colspan="6">Loading menu items...</td></tr>';
        adminCategoryFilterSelect.innerHTML = '<option value="all">All Categories</option>';
        allFetchedAdminCategories = await fetchAdminCategories(); allFetchedAdminMenuItems = await fetchAdminMenuItems();
        if (allFetchedAdminCategories.length > 0) {
            adminCategoriesTableBody.innerHTML = ''; 
            allFetchedAdminCategories.forEach(cat => {
                const row = adminCategoriesTableBody.insertRow();
                row.innerHTML = `<td>${escapeHTML(cat.name)} (${escapeHTML(cat.categoryId)})</td><td>${allFetchedAdminMenuItems.filter(item => item.categoryId === cat.categoryId).length}</td><td><button class="btn btn-sm btn-outline-secondary edit-category-btn" data-id="${cat.categoryId}">Edit</button><button class="btn btn-sm btn-danger delete-category-btn" data-id="${cat.categoryId}">Delete</button></td>`;
                const option = document.createElement('option'); option.value = cat.categoryId; option.textContent = cat.name; adminCategoryFilterSelect.appendChild(option);
            });
        } else { adminCategoriesTableBody.innerHTML = '<tr><td colspan="3">No categories found.</td></tr>'; }
        displayAdminMenuItems(allFetchedAdminMenuItems);
    }
    function displayAdminMenuItems(itemsToDisplay) {
        if (!adminMenuItemsTableBody) return; adminMenuItemsTableBody.innerHTML = ''; 
        if (itemsToDisplay && itemsToDisplay.length > 0) {
            itemsToDisplay.forEach(item => {
                const row = adminMenuItemsTableBody.insertRow();
                row.innerHTML = `<td>${escapeHTML(item.itemId)}</td><td>${escapeHTML(item.name)}</td><td>${escapeHTML(item.categoryId)}</td><td>${formatPrice(item.price)}</td><td><span class="status-${item.isAvailable ? 'active' : 'inactive'}">${item.isAvailable ? 'Yes' : 'No'}</span></td><td><button class="btn btn-sm btn-outline-secondary edit-item-btn" data-mongo-id="${item._id}" data-item-id="${item.itemId}">Edit</button><button class="btn btn-sm btn-danger delete-item-btn" data-mongo-id="${item._id}" data-item-id="${item.itemId}">Delete</button></td>`;
            });
        } else { adminMenuItemsTableBody.innerHTML = '<tr><td colspan="6">No menu items match filter or none exist.</td></tr>'; }
    }
     if (adminCategoryFilterSelect) {
        adminCategoryFilterSelect.addEventListener('change', function() {
            const selectedCatId = this.value;
            if (selectedCatId === 'all') displayAdminMenuItems(allFetchedAdminMenuItems);
            else displayAdminMenuItems(allFetchedAdminMenuItems.filter(item => item.categoryId === selectedCatId));
        });
    }

    // --- Menu Item Form Handling (Add & Edit) ---
    // ... (Full, correct showMenuItemForm, hideMenuItemForm, populateItemFormCategories, and menuItemForm submit listener from previous response) ...
    async function populateItemFormCategories() {
        if (!itemFormCategoryIdSelect) return;
        const categories = allFetchedAdminCategories.length > 0 ? allFetchedAdminCategories : await fetchAdminCategories();
        itemFormCategoryIdSelect.innerHTML = '<option value="">-- Select Category --</option>';
        if (categories && categories.length > 0) {
            categories.forEach(cat => {
                const option = document.createElement('option'); option.value = cat.categoryId; option.textContent = cat.name;
                itemFormCategoryIdSelect.appendChild(option);
            });
        }
    }
    async function showMenuItemForm(itemToEdit = null) { 
        // Ensure all declared consts at the top are correct for elements used here 
        if (!addItemFormContainer || !menuItemForm || !itemFormTitle || !menuItemFormFeedback || !itemFormHiddenIdInput || !displayItemIdGroup || !displayItemIdText) {
            console.error("showMenuItemForm: One or more essential form display/input elements are missing."); return;}
        console.log("showMenuItemForm called. Item to edit:", itemToEdit);
        menuItemForm.reset(); menuItemFormFeedback.textContent = ''; menuItemFormFeedback.className = 'form-feedback-message'; menuItemFormFeedback.style.display = 'none'; 
        menuItemForm.querySelectorAll('input, select, textarea').forEach(el => adminClearError(el));

        await populateItemFormCategories(); 

        if (itemToEdit && itemToEdit._id) { 
            itemFormTitle.textContent = `Edit Menu Item: ${escapeHTML(itemToEdit.name)}`; 
            itemFormHiddenIdInput.value = itemToEdit._id; 
            
            itemFormItemIdInput.value = itemToEdit.itemId || ''; itemFormItemIdInput.readOnly = true; 
            document.getElementById('itemFormName').value = itemToEdit.name || ''; itemFormCategoryIdSelect.value = itemToEdit.categoryId || '';
            document.getElementById('itemFormDescription').value = itemToEdit.description || '';
            document.getElementById('itemFormPrice').value = itemToEdit.price !== undefined ? itemToEdit.price.toString() : '';
            document.getElementById('itemFormImage').value = itemToEdit.image || '';
            document.getElementById('itemFormTags').value = Array.isArray(itemToEdit.tags) ? itemToEdit.tags.join(', ') : '';
            document.getElementById('itemFormIsAvailable').checked = itemToEdit.isAvailable !== undefined ? itemToEdit.isAvailable : true;
        } else { 
            itemFormTitle.textContent = "Add New Menu Item";
            itemFormHiddenIdInput.value = ''; 
            displayItemIdGroup.style.display = 'none'; // Hide Item ID display for new items
            displayItemIdText.textContent = '';
        }
        addItemFormContainer.style.display = 'block';
        addItemFormContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    function hideMenuItemForm() {
        if (addItemFormContainer) addItemFormContainer.style.display = 'none';
        if (menuItemForm) menuItemForm.reset();
        if (itemFormHiddenIdInput) itemFormHiddenIdInput.value = '';
        if (displayItemIdGroup) displayItemIdGroup.style.display = 'none'; // Hide this too
        if (menuItemFormFeedback) { /* ... clear feedback ... */ }
    }
    if (adminAddNewItemBtn) { adminAddNewItemBtn.addEventListener('click', () => showMenuItemForm()); }
    if (cancelItemFormBtn) { cancelItemFormBtn.addEventListener('click', hideMenuItemForm); }
    if (menuItemForm) {
        menuItemForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            // ... (clear feedback) ...

            let isValid = true;
            // Item ID is no longer a required input field from the user for ADDING
            const requiredFields = { 
                // itemFormItemId: "Item ID", // REMOVE THIS from required user input
                itemFormName: "Name",
                itemFormCategoryId: "Category",
                itemFormPrice: "Price"
            };
            for (const fieldId in requiredFields) { /* ... your validation loop ... */ }
            if (!isValid) return;

            // ... (saveItemBtn loading state) ...

            const formData = new FormData(menuItemForm);
            const currentEditId = itemFormHiddenIdInput.value; // MongoDB _id for PUT

            let generatedItemId = '';
            if (!currentEditId) { // Only generate for NEW items
                const itemName = formData.get('name').trim();
                if (!itemName) { // Name is crucial for generating ID
                    adminShowError(document.getElementById('itemFormName'), 'Name is required to generate an Item ID.');
                    if(saveItemBtn) { saveItemBtn.disabled = false; saveItemBtn.innerHTML = 'Save Item'; }
                    return;
                }
                generatedItemId = itemName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now().toString().slice(-5);
            }

            const itemPayload = {
                // If editing, itemId comes from the item being edited (not directly from form input, but could be included if you allow editing it)
                // If adding, use the generated one. The backend route for PUT expects itemId to be in the body if it's being changed.
                // Our current PUT backend allows itemId to be updated if sent.
                itemId: currentEditId ? document.getElementById('displayItemIdText').textContent : generatedItemId,
                name: formData.get('name').trim(),
                // ... (rest of itemPayload as before: categoryId, description, price, etc.) ...
                categoryId: formData.get('categoryId'),
                description: formData.get('description') ? formData.get('description').trim() : '',
                price: parseFloat(formData.get('price')),
                image: formData.get('image') ? formData.get('image').trim() : '',
                tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [],
                isAvailable: document.getElementById('itemFormIsAvailable').checked,
                customizableOptions: [], 
                mealOption: null  
            };
            
            if (!itemPayload.itemId && !currentEditId) { // Safety check if generation failed and it's a new item
                showToast('Failed to generate Item ID. Name might be empty.', 'error');
                if(saveItemBtn) { saveItemBtn.disabled = false; saveItemBtn.innerHTML = 'Save Item'; }
                return;
            }


            const method = currentEditId ? 'PUT' : 'POST';
            const apiUrl = currentEditId ? `http://localhost:5001/api/menuitems/${currentEditId}` : 'http://localhost:5001/api/menuitems';
            // ... (rest of fetch logic, success/error handling as before) ...
        });
    }


    // --- Event Listener for Table Actions (Edit/Delete Item, Edit/Delete Category) ---
    const adminPageContent = document.querySelector('.admin-page-content');
    if (adminPageContent) {
        adminPageContent.addEventListener('click', async function(event) {
            const button = event.target.closest('button');
            if (!button) return;

            const mongoId = button.dataset.mongoId;     // For menu items (MongoDB _id)
            const itemIdForDisplay = button.dataset.itemId; // For menu items (custom itemId)
            const categoryIdAttr = button.dataset.id;   // For categories (custom categoryId)

            if (button.classList.contains('edit-item-btn') && mongoId) {
                console.log(`Edit item button clicked for mongoId: ${mongoId}`);
                try {
                    const response = await fetch(`http://localhost:5001/api/menuitems/${mongoId}`);
                    if (!response.ok) { 
                        const errData = await response.json().catch(() => ({ msg: "Failed to parse server error response."}) );
                        throw new Error(errData.msg || `Failed to fetch item. Status: ${response.status}`);
                    }
                    const itemToEdit = await response.json();
                    if (itemToEdit) showMenuItemForm(itemToEdit);
                    else showToast(`Could not find item (ID: ${mongoId}) to edit.`, 'error');
                } catch (error) { 
                    console.error('Error fetching item for edit:', error); 
                    showToast(`Error fetching item for edit: ${error.message}`, 'error'); 
                }
            } else if (button.classList.contains('delete-item-btn') && mongoId) {
                const itemName = button.closest('tr')?.querySelector('td:nth-child(2)')?.textContent || `item with ID ${itemIdForDisplay || mongoId}`;
                showConfirmationModal('Delete Menu Item', `Are you sure you want to delete "${escapeHTML(itemName)}"? This action cannot be undone.`,
                    async () => { 
                        try {
                            const response = await fetch(`http://localhost:5001/api/menuitems/${mongoId}`, { method: 'DELETE' });
                            const result = await response.json(); 
                            if (!response.ok) throw new Error(result.msg || `Failed to delete. Status: ${response.status}`);
                            showToast(result.msg || `Item "${escapeHTML(itemName)}" deleted!`, 'success');
                            await displayAdminMenuData(); 
                        } catch (error) { console.error('Error deleting item:', error); showToast(`Error deleting item: ${error.message}`, 'error');}
                    }
                );
            } else if (button.classList.contains('edit-category-btn') && categoryIdAttr) {
                showToast(`EDIT category "${escapeHTML(categoryIdAttr)}" (To be implemented).`, 'info');
            } else if (button.classList.contains('delete-category-btn') && categoryIdAttr) {
                const categoryName = button.closest('tr')?.querySelector('td:first-child')?.textContent.split('(')[0].trim() || categoryIdAttr;
                showConfirmationModal('Delete Category', `Are you sure you want to delete category "${escapeHTML(categoryName)}"? This may also remove its items or reassign them.`,
                    async () => { /* TODO: Implement backend DELETE /api/categories/:categoryId call */ 
                        showToast(`DELETE category "${escapeHTML(categoryIdAttr)}" (Implement backend).`, 'info');
                        // await displayAdminMenuData(); 
                    }
                );
            }
        });
    }
    
    // --- Handle Add Promotion Form Submission (Simulated) ---
    // ... (Full, correct promo form logic as previously verified) ...
    if (addPromoForm && promotionsTableBody) {
        addPromoForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            const codeInput = document.getElementById('promoCodeName'); const typeInput = document.getElementById('promoDiscountType');
            const valueInput = document.getElementById('promoDiscountValue'); const expiryInput = document.getElementById('promoExpiryDate');
            let isValid = true;
            [codeInput, valueInput].forEach(input => { if (!input.value.trim()) { alert(`${input.labels[0].textContent || input.name} is required.`); input.focus(); isValid = false;}});
            if (!isValid) return;
            const code = escapeHTML(codeInput.value.trim().toUpperCase()); const type = typeInput.value; const value = parseFloat(valueInput.value);
            const expiry = expiryInput.value ? new Date(expiryInput.value + 'T00:00:00').toLocaleDateString('en-CA') : '-';
            let displayValue = (type === 'percentage') ? `${value}%` : `€${value.toFixed(2)}`;
            const newRow = promotionsTableBody.insertRow(); 
            newRow.innerHTML = `<td>${code}</td><td>${type.charAt(0).toUpperCase() + type.slice(1)}</td><td>${displayValue}</td><td>${expiry}</td><td><button class="btn btn-sm btn-outline-secondary edit-promo-btn">Edit</button> <button class="btn btn-sm btn-danger delete-promo-btn">Delete</button></td>`;
            addPromoForm.reset(); showToast(`Promotion "${code}" added to table (simulated).`, 'info');
        });
    }

    // --- Admin Section Navigation Logic ---
    // ... (Full, correct section navigation logic as previously verified) ...
    if (adminNavLinks.length > 0 && adminSections.length > 0) {
        function activateSection(sectionId) {
            let sectionFound = false;
            adminNavLinks.forEach(navLink => navLink.classList.toggle('active', navLink.dataset.section === sectionId));
            adminSections.forEach(section => {
                const isActive = section.id === sectionId;
                section.classList.toggle('active-section', isActive);
                if (isActive) {
                    sectionFound = true;
                    if (section.id === 'contact-messages' && typeof displayContactMessages === 'function') displayContactMessages();
                    else if (section.id === 'menu-management' && typeof displayAdminMenuData === 'function') displayAdminMenuData();
                }
            });
            return sectionFound;
        }
        adminNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault(); const sectionId = this.dataset.section;
                if (activateSection(sectionId)) window.location.hash = sectionId; 
                else { activateSection('dashboard'); window.location.hash = 'dashboard'; }
                if (window.innerWidth < 992 && adminSidebar && adminSidebar.classList.contains('open')) adminSidebar.classList.remove('open');
            });
        });
        const currentHash = window.location.hash.substring(1);
        if (currentHash && document.getElementById(currentHash)) activateSection(currentHash);
        else activateSection('dashboard'); 
    }

    // --- Generic Dummy Alerts for Buttons NOT Handled Above ---
    document.body.addEventListener('click', function(event) {
        const button = event.target.closest('.admin-page-content .btn, .admin-page-content .admin-form button[type="submit"]');
        if (!button) return; // Not a button we care about
        
        const isHandled = 
            button.closest('.msg-actions') || 
            button.closest('.admin-nav') || 
            button.id === 'sidebarToggleDesktop' || 
            button.id === 'sidebarToggleMobile' ||
            (button.type === 'submit' && button.closest('form#addPromoForm')) ||
            (button.type === 'submit' && button.closest('form#menuItemForm')) ||
            button.id === 'cancelItemFormBtn' || 
            button.id === 'adminAddNewItemBtn' ||
            button.id === 'adminAddNewCategoryBtn' || // Assume this will get specific handler
            button.classList.contains('edit-item-btn') || // Handled by table listener
            button.classList.contains('delete-item-btn') || // Handled by table listener
            button.classList.contains('edit-category-btn') || // Handled by table listener
            button.classList.contains('delete-category-btn'); // Handled by table listener

        if (isHandled) return; 

        // If it's a submit button of some other form
        if (button.type === 'submit' && button.closest('form')) {
            event.preventDefault(); 
            showToast(`"${button.textContent.trim()}" clicked (form submission for ${button.closest('form').id || 'form'} - dummy).`, 'info');
        } else { // Any other unhandled button in .admin-page-content
            showToast(`Action "${button.textContent.trim()}" clicked (dummy).`, 'info');
        }
    });
});