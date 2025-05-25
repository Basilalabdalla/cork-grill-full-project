// models/Category.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    categoryId: { // e.g., 'starters', 'mains'
        type: String,
        required: true,
        unique: true 
    },
    name: { // e.g., 'Starters', 'Main Courses'
        type: String,
        required: true
    },
    displayOrder: { // Optional: for controlling order in menu
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);