// js/menu-page.js
document.addEventListener('DOMContentLoaded', async function() {
    const fullMenuContainer = document.getElementById('full-menu-container');
    const menuFiltersContainer = document.querySelector('.menu-filters');
    
    let allMenuItemsFromAPI = []; // Store all fetched menu items
    let allCategoriesFromAPI = []; // Store all fetched categories

    async function fetchMenuData() {
        if (!fullMenuContainer || !menuFiltersContainer) {
            console.error("Required menu page elements not found.");
            if(fullMenuContainer) fullMenuContainer.innerHTML = '<p class="loading-text error-text">Page setup error.</p>';
            return;
        }

        fullMenuContainer.innerHTML = '<p class="loading-text">Loading menu categories and items...</p>';
        menuFiltersContainer.innerHTML = ''; // Clear old filters

        try {
            // Step 1: Fetch Categories
            const categoriesResponse = await fetch('http://localhost:5001/api/categories');
            if (!categoriesResponse.ok) {
                throw new Error(`HTTP error fetching categories! status: ${categoriesResponse.status}`);
            }
            allCategoriesFromAPI = await categoriesResponse.json();
            console.log("Fetched categories from API:", allCategoriesFromAPI);

            if (!Array.isArray(allCategoriesFromAPI)) {
                throw new Error("Categories API did not return an array.");
            }

            // Step 2: Fetch Menu Items
            const menuItemsResponse = await fetch('http://localhost:5001/api/menuitems');
            if (!menuItemsResponse.ok) {
                throw new Error(`HTTP error fetching menu items! status: ${menuItemsResponse.status}`);
            }
            allMenuItemsFromAPI = await menuItemsResponse.json();
            console.log("Fetched menu items from API:", allMenuItemsFromAPI);

            if (!Array.isArray(allMenuItemsFromAPI)) {
                throw new Error("Menu items API did not return an array.");
            }

            // Step 3: Setup UI
            if (allCategoriesFromAPI.length > 0) {
                setupCategoryFilters(allCategoriesFromAPI);
                renderFullMenu(allMenuItemsFromAPI, allCategoriesFromAPI); // Initial render with all items
            } else {
                fullMenuContainer.innerHTML = '<p class="loading-text">No menu categories found. Please add categories in the admin panel.</p>';
            }

        } catch (error) {
            console.error("Could not fetch menu data:", error);
            if (fullMenuContainer) fullMenuContainer.innerHTML = `<p class="loading-text error-text">Could not load menu: ${error.message}. Please try again later.</p>`;
            if (menuFiltersContainer) menuFiltersContainer.innerHTML = ''; 
        }
    }

    function renderFullMenu(itemsToRender, categoriesToDisplay) {
        if (!fullMenuContainer || !Array.isArray(itemsToRender) || !Array.isArray(categoriesToDisplay)) {
            if(fullMenuContainer) fullMenuContainer.innerHTML = '<p class="loading-text error-text">Error preparing menu display.</p>';
            return;
        }
        fullMenuContainer.innerHTML = ''; 

        if (itemsToRender.length === 0 && allMenuItemsFromAPI.length > 0) {
            // This means a filter is active and no items match, but there are items in general
            fullMenuContainer.innerHTML = '<p class="loading-text">No menu items found for this selection.</p>';
            return;
        }
        if (allMenuItemsFromAPI.length === 0) { // No items fetched at all
            fullMenuContainer.innerHTML = '<p class="loading-text">No menu items are currently available.</p>';
            return;
        }

        categoriesToDisplay.forEach(category => {
            // Filter items for the current category from the 'itemsToRender' list
            const itemsInCategory = itemsToRender.filter(item => item.categoryId === category.categoryId);
            
            if (itemsInCategory.length > 0) {
                const categorySection = document.createElement('div');
                categorySection.classList.add('menu-category');
                categorySection.id = `category-${category.categoryId}`; // Use categoryId from API

                const categoryTitle = document.createElement('h2');
                categoryTitle.classList.add('category-title');
                categoryTitle.textContent = category.name; // Use name from API
                categorySection.appendChild(categoryTitle);

                const itemsGrid = document.createElement('div');
                itemsGrid.classList.add('items-grid');
                
                if (typeof displayMenuItems === 'function') {
                    // displayMenuItems is defined in ui.js and expects item.itemId
                    displayMenuItems(itemsInCategory, itemsGrid, 'item'); 
                } else {
                    console.error('displayMenuItems function is not defined. Make sure ui.js is loaded before menu-page.js.');
                    itemsGrid.innerHTML = "<p class='error-text'>UI Error: Could not display items.</p>";
                }

                categorySection.appendChild(itemsGrid);
                fullMenuContainer.appendChild(categorySection);
            }
        });
        
        // If, after iterating through categoriesToDisplay, nothing was rendered (e.g., bad filter)
        if (fullMenuContainer.innerHTML === '' && itemsToRender.length > 0) {
             fullMenuContainer.innerHTML = '<p class="loading-text">No items found for the current filter.</p>';
        } else if (fullMenuContainer.innerHTML === '' && itemsToRender.length === 0 && allMenuItemsFromAPI.length > 0) {
            // This case is if the initial itemsToRender was empty but there are categories.
            // Handled by the "No menu items found for this selection" at the start of the function.
        }
    }
    
    function setupCategoryFilters(categories) {
        if (!menuFiltersContainer || !categories || categories.length === 0) {
            if(menuFiltersContainer) menuFiltersContainer.innerHTML = '';
            return;
        }
        menuFiltersContainer.innerHTML = ''; 

        const allButton = document.createElement('button');
        allButton.classList.add('btn', 'btn-outline-primary', 'filter-btn', 'active');
        allButton.textContent = 'All Categories';
        allButton.dataset.category = 'all'; // Special value for 'all'
        menuFiltersContainer.appendChild(allButton);

        // Sort categories by displayOrder then by name for filter buttons
        const sortedCategoriesForFilters = [...categories].sort((a,b) => {
            if (a.displayOrder !== b.displayOrder) {
                return (a.displayOrder || 0) - (b.displayOrder || 0);
            }
            return a.name.localeCompare(b.name);
        });

        sortedCategoriesForFilters.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-outline-primary', 'filter-btn');
            button.textContent = category.name;
            button.dataset.category = category.categoryId; // Use categoryId from API
            menuFiltersContainer.appendChild(button);
        });

        menuFiltersContainer.addEventListener('click', function(event) {
            const target = event.target.closest('.filter-btn');
            if (target) {
                menuFiltersContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');

                const selectedCategoryId = target.dataset.category;
                if (selectedCategoryId === 'all') {
                    renderFullMenu(allMenuItemsFromAPI, allCategoriesFromAPI); // Show all items under their respective categories
                } else {
                    const filteredItems = allMenuItemsFromAPI.filter(item => item.categoryId === selectedCategoryId);
                    const currentCategoryObj = allCategoriesFromAPI.find(c => c.categoryId === selectedCategoryId);
                    renderFullMenu(filteredItems, currentCategoryObj ? [currentCategoryObj] : []); // Show only items of selected category, under that category's title
                }
            }
        });
    }

    // --- Initialization ---
    if (fullMenuContainer && menuFiltersContainer) { 
        fetchMenuData(); 
    } else {
        console.error("Essential menu page elements (#full-menu-container or .menu-filters) not found.");
    }
});