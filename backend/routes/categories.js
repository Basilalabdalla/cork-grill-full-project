// routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); // Import the Category model

console.log("Category router file loaded.");

// @route   GET api/categories
// @desc    Get all categories, sorted by displayOrder then name
// @access  Public
router.get('/', async (req, res) => {
    console.log("GET /api/categories - route handler initiated.");
    try {
        const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
        if (!categories) {
            console.log('Category.find() returned null/undefined.');
            return res.status(404).json({ msg: 'Error retrieving categories' });
        }
        console.log(`Found ${categories.length} categories, sending to client.`);
        res.json(categories);
    } catch (err) {
        console.error('Error in GET /api/categories handler:', err.message, err.stack);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/categories
// @desc    Add a new category (example for admin)
// @access  Private (should be protected later)
router.post('/', async (req, res) => {
    console.log("POST /api/categories - route handler initiated.");
    const { categoryId, name, displayOrder } = req.body;

    try {
        if (!categoryId || !name) {
            return res.status(400).json({ msg: 'Please include categoryId and name' });
        }

        let category = await Category.findOne({ categoryId });
        if (category) {
            return res.status(400).json({ msg: 'Category with this categoryId already exists' });
        }

        category = new Category({
            categoryId,
            name,
            displayOrder: displayOrder !== undefined ? displayOrder : 0
        });

        await category.save();
        console.log(`POST /api/categories - Category ${categoryId} saved successfully.`);
        res.status(201).json(category);

    } catch (err) {
        console.error('Error in POST /api/categories handler:', err.message, err.stack);
        res.status(500).send('Server Error when creating category');
    }
});

module.exports = router;