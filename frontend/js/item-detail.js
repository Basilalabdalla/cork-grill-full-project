// js/item-detail.js
document.addEventListener('DOMContentLoaded', async function() { // Added async
    const itemDetailContainer = document.getElementById('item-detail-container');
    let currentItem = null; // This will store the fetched item object
    let currentCustomizations = {};
    let currentQuantity = 1;
    let currentBasePrice = 0;
    let isMeal = false;

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    async function fetchItemByItemId(itemId) { // Renamed from fetchItemById for clarity
        if (!itemId) {
            console.error("No itemId provided to fetchItemByItemId");
            return null;
        }
        try {
            // In a production app, this should be an API endpoint: /api/menuitems/specific_item_id_value
            // For this prototype, we fetch all and then filter by our custom 'itemId'.
            const response = await fetch(`http://localhost:5001/api/menuitems`); 
            if (!response.ok) {
                throw new Error(`HTTP error fetching all items! status: ${response.status}`);
            }
            const allItems = await response.json();
            const foundItem = allItems.find(item => item.itemId === itemId); // Use 'itemId' field from schema
            if (!foundItem) {
                console.warn(`Item with itemId "${itemId}" not found in API response.`);
            }
            return foundItem;
        } catch (error) {
            console.error(`Error fetching item with itemId "${itemId}":`, error);
            return null;
        }
    }

    function calculateTotalPrice() {
        if (!currentItem) return 0; // Guard if currentItem isn't loaded
        let price = currentBasePrice;
        
        for (const groupId in currentCustomizations) {
            const group = currentItem.customizableOptions.find(optGroup => optGroup.id === groupId);
            if (!group) continue;

            if (group.type === 'radio') {
                const selectedOptionId = currentCustomizations[groupId];
                const selectedOption = group.options.find(opt => opt.id === selectedOptionId);
                if (selectedOption && typeof selectedOption.priceChange === 'number') {
                    price += selectedOption.priceChange;
                }
            } else if (group.type === 'checkbox') {
                for (const optionId in currentCustomizations[groupId]) {
                    if (currentCustomizations[groupId][optionId]) { 
                        const mainOption = group.options ? group.options.find(opt => opt.id === optionId) : group;
                        if (mainOption && typeof mainOption.priceChange === 'number') {
                             price += mainOption.priceChange;
                        } else if (!group.options && typeof group.priceChange === 'number') { 
                             price += group.priceChange;
                        }
                    }
                }
            }
        }
        
        if (isMeal && currentItem.mealOption && typeof currentItem.mealOption.additionalPrice === 'number') {
            price += currentItem.mealOption.additionalPrice;
        }
        
        return price * currentQuantity;
    }

    function updatePriceDisplay() {
        const priceElement = document.getElementById('current-item-price');
        if (priceElement) {
            // Use global formatPrice if available
            const fPrice = typeof formatPrice === 'function' ? formatPrice : (p) => `€${Number(p).toFixed(2)}`;
            priceElement.textContent = fPrice(calculateTotalPrice());
        }
    }

    async function renderItemDetail(itemIdParam) {
        if (!itemDetailContainer) {
            console.error("Item detail container not found.");
            return;
        }
        itemDetailContainer.innerHTML = '<p class="loading-text">Loading item details...</p>';
        itemDetailContainer.classList.add('loading');
        itemDetailContainer.classList.remove('loaded');

        currentItem = await fetchItemByItemId(itemIdParam); 

        if (!currentItem) {
            itemDetailContainer.innerHTML = `<p class="error-text">Item not found (ID: ${itemIdParam}). Please return to the menu.</p>`;
            itemDetailContainer.classList.remove('loading');
            itemDetailContainer.classList.add('loaded');
            return;
        }

        document.title = `${currentItem.name} - Cork Grill`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', `Customize and order ${currentItem.name}. ${currentItem.description || ''}`);
        }

        currentBasePrice = currentItem.price;
        currentCustomizations = {}; 
        isMeal = false; 
        currentQuantity = 1; 

        if (currentItem.customizableOptions) {
            currentItem.customizableOptions.forEach(group => {
                if (group.type === 'radio' && group.default) {
                    currentCustomizations[group.id] = group.default;
                } else if (group.type === 'checkbox') {
                    currentCustomizations[group.id] = {}; 
                    if (group.options) { 
                        group.options.forEach(opt => {
                            if (opt.default) currentCustomizations[group.id][opt.id] = true;
                        });
                    } else { 
                         if (group.default) currentCustomizations[group.id][group.id] = true; 
                    }
                }
            });
        }
        
        let html = `
            <div class="item-layout">
                <div class="item-image-column">
                    ${currentItem.image ? `<img src="${currentItem.image}" alt="${currentItem.name}" class="item-image">` : '<div class="image-placeholder">No image available</div>'}
                </div>
                <div class="item-info-column">
                    <h1 class="item-name">${currentItem.name}</h1>
                    <p class="item-description">${currentItem.description || ''}</p>

                    ${currentItem.customizableOptions && currentItem.customizableOptions.length > 0 ? `
                        <div class="customization-section">
                            <h2 class="customization-title">Customize Your Order</h2>
                            ${currentItem.customizableOptions.map(group => `
                                <fieldset class="customization-group" id="group-${group.id}">
                                    <legend class="group-label">${group.name}</legend>
                                    ${group.options ? group.options.map(option => renderOption(group, option)).join('') : renderOption(group, group, true)}
                                </fieldset>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${currentItem.mealOption ? `
                        <div class="meal-option-section">
                            <div class="meal-option-toggle">
                                <label for="make-it-meal">
                                    <input type="checkbox" id="make-it-meal" name="make-it-meal" ${isMeal ? 'checked' : ''}>
                                    Make it a Meal! 
                                    <span class="option-price-change">(+${formatPrice(currentItem.mealOption.additionalPrice)})</span>
                                </label>
                            </div>
                            <p class="meal-includes">Includes: ${currentItem.mealOption.includes.join(', ')}</p>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="order-actions">
                <div class="quantity-control">
                    <button type="button" class="quantity-btn decrease-quantity" aria-label="Decrease quantity">-</button>
                    <input type="number" id="item-quantity" value="${currentQuantity}" min="1" max="10" aria-label="Item quantity" readonly>
                    <button type="button" class="quantity-btn increase-quantity" aria-label="Increase quantity">+</button>
                </div>
                <div class="price-display" id="current-item-price">${formatPrice(calculateTotalPrice())}</div>
            </div>
            <button type="button" id="add-to-cart-btn" class="btn btn-primary btn-lg">Add to Cart</button>
        `;
        
        itemDetailContainer.innerHTML = html;
        itemDetailContainer.classList.remove('loading');
        itemDetailContainer.classList.add('loaded'); 
        attachEventListeners();
        updatePriceDisplay(); 
    }

    function renderOption(group, option, isSingleCheckboxGroup = false) {
        if (!currentItem) return ''; // Guard if currentItem isn't loaded
        const optionId = isSingleCheckboxGroup ? group.id : option.id; 
        const optionName = isSingleCheckboxGroup ? group.name : option.name; 
        const optionPriceChange = option.priceChange || 0;
        const inputType = group.type; 
        let isChecked = false;

        if (inputType === 'radio') {
            isChecked = currentCustomizations[group.id] === optionId;
        } else if (inputType === 'checkbox') {
             if (isSingleCheckboxGroup) {
                isChecked = currentCustomizations[group.id] && currentCustomizations[group.id][optionId];
             } else {
                isChecked = currentCustomizations[group.id] && currentCustomizations[group.id][optionId];
             }
        }
        
        // Use global formatPrice
        const fPrice = typeof formatPrice === 'function' ? formatPrice : (p) => `€${Number(p).toFixed(2)}`;

        return `
            <div class="option ${isChecked ? 'selected' : ''}" data-group-id="${group.id}" data-option-id="${optionId}">
                <label for="option-${group.id}-${optionId}">
                    <input type="${inputType}" 
                           id="option-${group.id}-${optionId}" 
                           name="customization-${group.id}${inputType === 'checkbox' && !isSingleCheckboxGroup ? `-${optionId}` : ''}" 
                           value="${optionId}" 
                           data-price-change="${optionPriceChange}"
                           ${isChecked ? 'checked' : ''}>
                    <span class="option-name">${optionName}</span>
                </label>
                ${optionPriceChange !== 0 ? `<span class="option-price-change">(${optionPriceChange > 0 ? '+' : ''}${fPrice(optionPriceChange)})</span>` : ''}
            </div>
        `;
    }

    function handleCustomizationChange(event) {
        if (!currentItem) return; // Guard
        const input = event.target;
        if (!input.name || (!input.name.startsWith('customization-') && input.id !== 'make-it-meal')) return;

        const parentOptionDiv = input.closest('.option');

        if (input.id === 'make-it-meal') {
            isMeal = input.checked;
        } else {
            if (!parentOptionDiv) return; // Should not happen if markup is correct
            const groupId = parentOptionDiv.dataset.groupId;
            const optionId = parentOptionDiv.dataset.optionId;
            const groupInfo = currentItem.customizableOptions.find(g => g.id === groupId);

            if (input.type === 'radio') {
                currentCustomizations[groupId] = optionId;
                document.querySelectorAll(`#group-${groupId} .option`).forEach(optDiv => {
                    optDiv.classList.remove('selected');
                });
                if(parentOptionDiv) parentOptionDiv.classList.add('selected');

            } else if (input.type === 'checkbox') {
                if (!currentCustomizations[groupId]) {
                    currentCustomizations[groupId] = {};
                }
                currentCustomizations[groupId][optionId] = input.checked;
                if(parentOptionDiv) parentOptionDiv.classList.toggle('selected', input.checked);
            }
        }
        updatePriceDisplay();
    }

    function handleQuantityChange(action) {
        const quantityInput = document.getElementById('item-quantity');
        if(!quantityInput) return;
        let newQuantity = parseInt(quantityInput.value);
        if (action === 'increase') {
            newQuantity = Math.min(10, newQuantity + 1); 
        } else if (action === 'decrease') {
            newQuantity = Math.max(1, newQuantity - 1); 
        }
        quantityInput.value = newQuantity;
        currentQuantity = newQuantity;
        updatePriceDisplay();
    }

    function handleAddToCart() {
        if (!currentItem) return; // Guard
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if(addToCartBtn) {
            addToCartBtn.classList.add('is-loading'); 
            addToCartBtn.disabled = true;
        }

        const cartItem = {
            id: currentItem.itemId, // Use itemId from API data
            name: currentItem.name,
            priceAtAddition: calculateTotalPrice() / currentQuantity, 
            quantity: currentQuantity,
            customizations: JSON.parse(JSON.stringify(currentCustomizations)), // Deep copy
            isMeal: isMeal,
            mealDetails: isMeal ? currentItem.mealOption : null,
            image: currentItem.image 
        };
        
        setTimeout(() => {
            let cart = getCart();
            const existingItemIndex = cart.findIndex(item => 
                item.id === cartItem.id && 
                JSON.stringify(item.customizations) === JSON.stringify(cartItem.customizations) &&
                item.isMeal === cartItem.isMeal
            );

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += cartItem.quantity;
            } else {
                cart.push(cartItem);
            }
            
            saveCart(cart);
            
            if (typeof showToast === 'function') {
                 showToast(`${currentItem.name} added to cart!`, 'success'); 
            } else {
                alert(`${currentItem.name} added to cart!`);
            }

            if(addToCartBtn) {
                addToCartBtn.classList.remove('is-loading');
                addToCartBtn.disabled = false;
            }

        }, 700); 
    }


    function attachEventListeners() {
        const customizationSection = document.querySelector('.customization-section');
        if (customizationSection) {
            customizationSection.addEventListener('change', handleCustomizationChange);
        }
        
        const mealOptionToggle = document.getElementById('make-it-meal');
        if (mealOptionToggle) {
            mealOptionToggle.addEventListener('change', handleCustomizationChange);
        }

        const decreaseBtn = document.querySelector('.decrease-quantity');
        const increaseBtn = document.querySelector('.increase-quantity');
        if (decreaseBtn) decreaseBtn.addEventListener('click', () => handleQuantityChange('decrease'));
        if (increaseBtn) increaseBtn.addEventListener('click', () => handleQuantityChange('increase'));

        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', handleAddToCart);
        }

        const quantityInput = document.getElementById('item-quantity');
        if(quantityInput) {
            quantityInput.addEventListener('input', (e) => { 
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 10) val = 10;
                e.target.value = val; 
                currentQuantity = val;
                updatePriceDisplay();
            });
        }
    }

    // --- Initialization ---
    const itemIdFromQuery = getQueryParam('id'); 
    if (itemIdFromQuery && itemDetailContainer) {
        renderItemDetail(itemIdFromQuery); 
    } else if (itemDetailContainer) {
        itemDetailContainer.innerHTML = '<p class="error-text">No item specified or item detail container not found. Please select an item from the menu.</p>';
        itemDetailContainer.classList.remove('loading');
        itemDetailContainer.classList.add('loaded');
    } else {
        console.error("Could not initialize item detail page: container or itemId missing.");
    }
});