// Dummy data for menu items
// This will be expanded significantly
const menuItemsData = {
    categories: [
        { id: 'starters', name: 'Starters', items: [] },
        { id: 'mains', name: 'Main Courses', items: [] },
        { id: 'desserts', name: 'Desserts', items: [] },
        { id: 'drinks', name: 'Drinks', items: [] }
    ],
    items: [
        {
            id: 'item1',
            name: 'Classic Beef Burger',
            categoryId: 'mains',
            description: 'Juicy beef patty with fresh lettuce, tomato, onion, and our special sauce.',
            price: 12.50,
            image: 'assets/images/food-placeholder-1.jpg', // Replace with actual image path
            tags: ['featured', 'burger'],
            customizableOptions: [
                {
                    id: 'cheese', name: 'Add Cheese', type: 'checkbox', priceChange: 1.00, default: false,
                    options: [{ id: 'cheddar', name: 'Cheddar' }, { id: 'swiss', name: 'Swiss' }] // Example if cheese type matters
                },
                {
                    id: 'bacon', name: 'Add Bacon', type: 'checkbox', priceChange: 1.50, default: false
                },
                {
                    id: 'sauce', name: 'Sauce Choice', type: 'radio', default: 'ketchup',
                    options: [
                        { id: 'ketchup', name: 'Ketchup', priceChange: 0.00 },
                        { id: 'mayo', name: 'Mayonnaise', priceChange: 0.00 },
                        { id: 'bbq', name: 'BBQ Sauce', priceChange: 0.50 }
                    ]
                },
                {
                    id: 'extra_patty', name: 'Extra Patty', type: 'checkbox', priceChange: 3.00, default: false
                }
            ],
            mealOption: { // For "Make it a Meal"
                additionalPrice: 4.00,
                includes: ['Regular Fries', 'Soft Drink']
            }
        },
        {
            id: 'item2',
            name: 'Margherita Pizza',
            categoryId: 'mains',
            description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil.',
            price: 10.00,
            image: 'assets/images/food-placeholder-2.jpg',
            tags: ['vegetarian'],
            customizableOptions: [
                 {
                    id: 'crust', name: 'Crust Type', type: 'radio', default: 'classic',
                    options: [
                        { id: 'classic', name: 'Classic Thin', priceChange: 0.00 },
                        { id: 'stuffed', name: 'Stuffed Crust', priceChange: 2.00 }
                    ]
                }
            ]
        },
        {
            id: 'item3',
            name: 'Caesar Salad',
            categoryId: 'starters',
            description: 'Crisp romaine lettuce, croutons, parmesan cheese, and Caesar dressing.',
            price: 8.00,
            image: 'assets/images/food-placeholder-1.jpg', // Placeholder
            tags: ['featured', 'salad'],
            customizableOptions: [
                {
                    id: 'chicken', name: 'Add Grilled Chicken', type: 'checkbox', priceChange: 3.50, default: false
                }
            ]
        },
        {
            id: 'item4',
            name: 'Chocolate Lava Cake',
            categoryId: 'desserts',
            description: 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream.',
            price: 7.50,
            image: 'assets/images/food-placeholder-2.jpg', // Placeholder
            tags: ['deal']
        },
        {
            id: 'item5',
            name: 'Coca-Cola',
            categoryId: 'drinks',
            description: 'Classic Coca-Cola.',
            price: 2.50,
            image: 'assets/images/food-placeholder-1.jpg' // Placeholder
        }
    ],
    deals: [
        {
            id: 'deal1',
            title: 'Lunch Special: Burger + Fries + Drink',
            description: 'Get our Classic Beef Burger, a side of regular fries, and a soft drink for a special price!',
            price: 15.00, // Special deal price
            originalPrice: 19.00, // (12.50 burger + 4.00 fries + 2.50 drink) - if fries are item
            itemsIncluded: ['item1', 'fries_side', 'drink_standard'], // IDs of items
            image: 'assets/images/food-placeholder-1.jpg'
        }
    ]
};