// js/main.js

// Global utility function (ensure it's defined globally or imported if in a module system)
function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) {
        // console.warn('formatPrice received invalid input:', price);
        return '€--.--'; 
    }
    return `€${Number(price).toFixed(2)}`;
}


document.addEventListener('DOMContentLoaded', async function() { // Added async
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.main-navigation .nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
    }

    // Update current year in footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Scroll to Top Button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) { 
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Homepage specific logic ---
    const featuredItemsGrid = document.getElementById('featured-items-grid');
    const dealsGrid = document.getElementById('deals-grid');
    let allMenuItems = []; // To store items fetched from API

    // Fetch menu items from API
    try {
        const response = await fetch('http://localhost:5001/api/menuitems');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allMenuItems = await response.json();
        console.log("Fetched menu items from API for homepage:", allMenuItems);
    } catch (error) {
        console.error("Could not fetch menu items for homepage:", error);
        if (featuredItemsGrid) featuredItemsGrid.innerHTML = "<p class='error-text'>Error loading featured items. Please try again later.</p>";
        if (dealsGrid) dealsGrid.innerHTML = "<p class='error-text'>Error loading deals. Please try again later.</p>";
    }

    // Display Featured Items
    if (featuredItemsGrid) {
        if (allMenuItems.length > 0) {
            const featuredItems = allMenuItems.filter(item => item.tags && item.tags.includes('featured')).slice(0, 4);
            if (featuredItems.length > 0) {
                // Assuming displayMenuItems is globally available from ui.js
                if (typeof displayMenuItems === 'function') {
                    displayMenuItems(featuredItems, 'featured-items-grid', 'item');
                } else {
                    console.error('displayMenuItems function is not defined. Make sure ui.js is loaded.');
                    featuredItemsGrid.innerHTML = "<p class='error-text'>UI Error: Could not display items.</p>";
                }
            } else {
                featuredItemsGrid.innerHTML = "<p>No featured items available at the moment.</p>";
            }
        } else if (!featuredItemsGrid.querySelector('.error-text')) { // Only update if no error message already
             featuredItemsGrid.innerHTML = "<p>Loading featured items...</p>"; // Or a "no items" message if API call was successful but empty
        }
    }

    // Display Deals (assuming deals are items tagged with 'deal')
    if (dealsGrid) {
        if (allMenuItems.length > 0) {
            const dealItems = allMenuItems.filter(item => item.tags && item.tags.includes('deal')).slice(0, 2);
            if (dealItems.length > 0) {
                 if (typeof displayMenuItems === 'function') {
                    displayMenuItems(dealItems, 'deals-grid', 'item'); // Using 'item' card type for deals for now
                 } else {
                    console.error('displayMenuItems function is not defined. Make sure ui.js is loaded.');
                    dealsGrid.innerHTML = "<p class='error-text'>UI Error: Could not display deals.</p>";
                 }
            } else {
                dealsGrid.innerHTML = "<p>No special deals available right now.</p>";
            }
        } else if (!dealsGrid.querySelector('.error-text')) {
            dealsGrid.innerHTML = "<p>Loading special deals...</p>";
        }
    }
    
    // Update cart count (from cart.js, should be globally available)
    if (typeof updateCartCount === 'function') {
        updateCartCount(); 
    } else {
        console.error('updateCartCount function is not defined. Make sure cart.js is loaded.');
    }
});