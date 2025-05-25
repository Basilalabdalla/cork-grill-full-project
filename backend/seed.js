// cork-grill-backend/seed.js
console.log("Seed script started..."); // To confirm script execution begins

require('dotenv').config(); // Load environment variables from .env file
// Crucial check: See if MONGODB_URI is loaded from .env
console.log("dotenv configured. MONGODB_URI from .env:", process.env.MONGODB_URI); 

const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem'); 
const Category = require('./models/Category'); 

// --- Data to Seed ---
const categoriesToSeed = [
    { categoryId: 'starters', name: 'Starters', displayOrder: 1 },
    { categoryId: 'mains', name: 'Main Courses', displayOrder: 2 },
    { categoryId: 'burgers', name: 'Gourmet Burgers', displayOrder: 3 },
    { categoryId: 'pizzas', name: 'Artisan Pizzas', displayOrder: 4 },
    { categoryId: 'desserts', name: 'Desserts', displayOrder: 5 },
    { categoryId: 'drinks', name: 'Drinks', displayOrder: 6 }
];

const menuItemsToSeed = [
    {
        itemId: 'item1',
        name: 'Classic Beef Burger',
        categoryId: 'burgers', 
        description: 'Juicy Angus beef patty with fresh lettuce, tomato, onion, and our special house sauce in a brioche bun.',
        price: 12.50,
        image: 'assets/images/food-placeholder-1.jpg',
        tags: ['featured', 'burger'],
        customizableOptions: [
            {
                id: 'cheese_types', name: 'Cheese Selection', type: 'checkbox',
                options: [
                    { id: 'cheddar', name: 'Irish Cheddar', priceChange: 1.00 },
                    { id: 'swiss', name: 'Emmental Swiss', priceChange: 1.20 },
                    { id: 'blue', name: 'Cashel Blue Cheese', priceChange: 1.50 }
                ]
            },
            { id: 'bacon', name: 'Add Crispy Bacon', type: 'checkbox', priceChange: 1.50 },
            {
                id: 'sauce', name: 'Burger Sauce', type: 'radio', default: 'house_sauce',
                options: [
                    { id: 'house_sauce', name: 'House Special Sauce', priceChange: 0.00 },
                    { id: 'ketchup', name: 'Classic Ketchup', priceChange: 0.00 },
                    { id: 'bbq', name: 'Smoky BBQ Sauce', priceChange: 0.50 }
                ]
            },
            { id: 'extra_patty', name: 'Add Extra Patty', type: 'checkbox', priceChange: 3.50 }
        ],
        mealOption: { additionalPrice: 4.50, includes: ["Rosemary Fries", "Craft Soda"] },
        isAvailable: true
    },
    {
        itemId: 'item2',
        name: 'Margherita Pizza',
        categoryId: 'pizzas', 
        description: 'Classic Neapolitan pizza with San Marzano tomato sauce, fresh mozzarella, basil, and a drizzle of olive oil.',
        price: 10.00,
        image: 'assets/images/food-placeholder-2.jpg',
        tags: ['vegetarian', 'pizza', 'featured'],
        customizableOptions: [
             {
                id: 'crust', name: 'Crust Type', type: 'radio', default: 'classic_thin',
                options: [
                    { id: 'classic_thin', name: 'Classic Thin', priceChange: 0.00 },
                    { id: 'stuffed_cheese', name: 'Cheese-Stuffed Crust', priceChange: 2.50 }
                ]
            },
            { id: 'extra_basil', name: 'Extra Fresh Basil', type: 'checkbox', priceChange: 0.50 }
        ],
        isAvailable: true
    },
    {
        itemId: 'item3',
        name: 'Spicy Arrabbiata Penne',
        categoryId: 'mains',
        description: 'Penne pasta tossed in a fiery arrabbiata sauce with cherry tomatoes, garlic, chili, and fresh parsley.',
        price: 11.00,
        image: 'assets/images/food-placeholder-1.jpg', 
        tags: ['vegetarian', 'pasta', 'spicy'],
        customizableOptions: [
            { id: 'add_parmesan', name: 'Add Parmesan Cheese', type: 'checkbox', priceChange: 1.00 },
            { id: 'add_chicken_pasta', name: 'Add Grilled Chicken', type: 'checkbox', priceChange: 3.00 }
        ],
        isAvailable: true
    },
    {
        itemId: 'item4',
        name: 'Loaded Nachos Sharer',
        categoryId: 'starters',
        description: 'Crispy tortilla chips piled high with melted cheese, jalapeños, salsa, guacamole, and sour cream.',
        price: 9.50,
        image: 'assets/images/food-placeholder-2.jpg', 
        tags: ['sharer', 'vegetarian_option'],
        customizableOptions: [
            { id: 'add_beef_chili', name: 'Add Beef Chili', type: 'checkbox', priceChange: 2.50 }
        ],
        isAvailable: true
    },
    {
        itemId: 'item5',
        name: 'Decadent Chocolate Brownie',
        categoryId: 'desserts',
        description: 'Warm, gooey chocolate brownie served with vanilla bean ice cream and a chocolate drizzle.',
        price: 7.50,
        image: 'assets/images/food-placeholder-1.jpg', 
        tags: ['deal', 'dessert'],
        isAvailable: true // Missing customizableOptions: [] if none, added for consistency
    },
    {
        itemId: 'item6',
        name: 'Freshly Squeezed Orange Juice',
        categoryId: 'drinks',
        description: '100% pure and refreshing orange juice, squeezed daily.',
        price: 3.50,
        image: 'assets/images/drink-placeholder-1.jpg',
        tags: ['drink', 'healthy'],
        isAvailable: true // Missing customizableOptions: [] if none
    },
    {
        itemId: 'item7',
        name: 'Craft Lager',
        categoryId: 'drinks',
        description: 'Locally brewed craft lager, crisp and refreshing.',
        price: 5.50,
        image: 'assets/images/drink-placeholder-2.jpg', 
        tags: ['drink', 'alcoholic'],
        isAvailable: true // Missing customizableOptions: [] if none
    }
];

// --- Seeding Function ---
const seedDB = async () => {
    console.log("Attempting to connect to MongoDB for seeding..."); 
    if (!process.env.MONGODB_URI) { // Check if URI was loaded
        console.error("ERROR: MONGODB_URI is not defined in .env file. Seeding cannot proceed.");
        console.error("Please ensure your .env file is in the backend root directory and contains MONGODB_URI=your_connection_string");
        return; // Exit the function early
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected Successfully for Seeding!');

        // Clear existing data
        console.log('Clearing existing Categories collection...');
        await Category.deleteMany({});
        console.log('Categories collection cleared.');

        console.log('Clearing existing MenuItems collection...');
        await MenuItem.deleteMany({});
        console.log('MenuItems collection cleared.');

        // Insert new data
        console.log(`Inserting ${categoriesToSeed.length} Categories...`);
        await Category.insertMany(categoriesToSeed);
        console.log('Categories seeded successfully!');

        console.log(`Inserting ${menuItemsToSeed.length} MenuItems...`);
        await MenuItem.insertMany(menuItemsToSeed);
        console.log('MenuItems seeded successfully!');

    } catch (err) {
        console.error('ERROR SEEDING DATABASE:');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if(err.reason) console.error('Reason:', err.reason); // Mongoose sometimes provides a reason object
        // console.error(err); // Full error object if needed, can be verbose
    } finally {
        console.log('Attempting to close MongoDB connection for Seeding.');
        // Ensure mongoose connection is actually open before trying to close
        if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) { 
            await mongoose.connection.close();
            console.log('MongoDB connection closed after seeding.');
        } else {
            console.log('MongoDB connection was not open or already closed.');
        }
    }
};

// Run the seeding function
seedDB();