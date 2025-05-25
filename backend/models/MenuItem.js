// models/MenuItem.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomizationOptionSchema = new Schema({
    id: String, // e.g., 'ketchup', 'cheddar'
    name: String, // e.g., 'Ketchup', 'Cheddar'
    priceChange: { type: Number, default: 0 }
}, {_id: false}); // Don't create a separate _id for sub-options

const CustomizableGroupSchema = new Schema({
    id: String, // e.g., 'sauce', 'cheese'
    name: String, // e.g., 'Sauce Choice', 'Add Cheese'
    type: String, // 'radio' or 'checkbox'
    default: Schema.Types.Mixed, // Can be string for radio default, or object for checkbox defaults
    options: [CustomizationOptionSchema],
    priceChange: { type: Number, default: 0 } // For single checkbox options without sub-options
}, {_id: false});

const MealOptionSchema = new Schema({
    additionalPrice: Number,
    includes: [String]
}, {_id: false});

const MenuItemSchema = new Schema({
    itemId: { type: String, required: true, unique: true }, // Our own item ID like 'item1'
    name: { type: String, required: true },
    categoryId: { type: String, required: true }, // e.g., 'mains', 'starters'
    description: String,
    price: { type: Number, required: true },
    image: String, // Path or URL to the image
    tags: [String], // e.g., ['featured', 'vegetarian']
    customizableOptions: [CustomizableGroupSchema],
    mealOption: MealOptionSchema,
    isAvailable: { type: Boolean, default: true }, // For item availability
    // We can add nutritionalInfo, allergens etc. later
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model('MenuItem', MenuItemSchema);