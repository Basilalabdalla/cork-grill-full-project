// js/ui.js

// Function to display menu items or deals in a specified container
function displayMenuItems(items, containerOrId, cardType = 'item') {
    let container;
    if (typeof containerOrId === 'string') {
        container = document.getElementById(containerOrId);
    } else if (containerOrId instanceof HTMLElement) {
        container = containerOrId; // Accept an element directly
    }

    if (!container) {
        console.warn(`UI: Container not found or invalid:`, containerOrId);
        return;
    }
    container.innerHTML = ''; // Clear previous items or loading message

    if (!items || !Array.isArray(items) || items.length === 0) { // More robust check
        container.innerHTML = '<p>No items to display.</p>';
        return;
    }

    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.classList.add('card', `${cardType}-card`);
        // Use item.itemId from API, fallback to item.id if that's still used from old data or for deals
        const idForItemLink = item.itemId || item.id;
        itemCard.dataset.itemId = idForItemLink; 

        let cardHTML = `
            ${item.image ? `<img src="${item.image}" alt="${item.name || item.title}" class="card-image">` : '<div class="card-image-placeholder">No Image Available</div>'}
            <div class="card-content">
                <h3 class="card-title">${item.name || item.title}</h3>
        `;

        if (item.description) {
            cardHTML += `<p class="card-description">${item.description}</p>`;
        }

        // Use global formatPrice if available, otherwise fallback
        const fPrice = typeof formatPrice === 'function' ? formatPrice : (p) => `€${Number(p).toFixed(2)}`;

        if (cardType === 'item' && typeof item.price === 'number') {
            cardHTML += `<p class="card-price">${fPrice(item.price)}</p>`;
        } else if (cardType === 'deal' && typeof item.price === 'number') {
             cardHTML += `<p class="card-price">Deal Price: ${fPrice(item.price)}</p>`;
             if (item.originalPrice) {
                cardHTML += `<p class="card-original-price" style="text-decoration: line-through; font-size: 0.9em;">Original: ${fPrice(item.originalPrice)}</p>`;
             }
        }

        cardHTML += `<div class="card-actions">`;
        if (cardType === 'item') {
            cardHTML += `<a href="item-detail.html?id=${idForItemLink}" class="btn btn-secondary btn-sm">Customize & Add</a>`;
        } else if (cardType === 'deal') {
            // For deals, we might add multiple items at once or link to a special page
            // Ensure item.id is used for deal-id if that's what data.js deals had
            cardHTML += `<button class="btn btn-primary btn-sm add-deal-to-cart-btn" data-deal-id="${item.id}">Add Deal to Cart</button>`;
        }
        cardHTML += `</div></div>`; // Close card-actions and card-content
        
        itemCard.innerHTML = cardHTML;
        container.appendChild(itemCard);
    });
}

// showToast function (if it's primarily a UI function, it can live here)
// If it's already in main.js and working globally, no need to duplicate.
// For this example, assuming it's here or main.js makes it global.
function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.warn('Toast container #toast-container not found! Falling back to alert.');
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast-message', type);

    let iconHtml = '';
    if (type === 'success') {
        iconHtml = `<span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>`;
    } else if (type === 'error') {
        iconHtml = `<span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>`;
    } else if (type === 'info') {
        iconHtml = `<span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>`;
    }

    toast.innerHTML = `${iconHtml}<span>${message}</span>`;
    container.appendChild(toast);
    void toast.offsetWidth; 
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            if (toast.parentElement === container) {
                toast.remove();
            }
        }, { once: true });
    }, duration);
}