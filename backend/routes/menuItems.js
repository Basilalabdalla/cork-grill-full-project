// cork-grill-backend/routes/menuItems.js
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const mongoose = require('mongoose');
console.log("MenuItem router file loaded and initialized.");

// @route   GET api/menuitems
// @desc    Get all menu items
// @access  Public
router.get('/', async (req, res) => {
    console.log("GET /api/menuitems - route handler initiated.");
    try {
        const items = await MenuItem.find().sort({ categoryId: 1, displayOrder: 1, name: 1 }); // Added displayOrder sort
        
        console.log(`Found ${items.length} menu items, sending to client.`);
        res.json(items); // Send empty array if no items, which is a valid response

    } catch (err) {
        console.error('Error in GET /api/menuitems handler:', err.message, err.stack);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/menuitems/byItemId/:itemId
// @desc    Get a single menu item by its custom itemId
// @access  Public
router.get('/byItemId/:itemId', async (req, res) => {
    const customItemId = req.params.itemId;
    console.log(`GET /api/menuitems/byItemId/${customItemId} - route handler initiated.`);
    try {
        const item = await MenuItem.findOne({ itemId: customItemId });
        if (!item) {
            console.log(`Menu item with itemId "${customItemId}" not found.`);
            return res.status(404).json({ msg: `Menu item with itemId "${customItemId}" not found` });
        }
        console.log(`Found menu item by itemId "${customItemId}": ${item.name}`);
        res.json(item);
    } catch (err) {
        console.error(`Error in GET /api/menuitems/byItemId/${customItemId} handler:`, err.message, err.stack);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/menuitems/:id (MongoDB _id)
// @desc    Get a single menu item by its MongoDB _id
// @access  Public (or Private if only for admin use)
router.get('/:id', async (req, res) => {
    const mongoId = req.params.id;
    console.log(`GET /api/menuitems/${mongoId} - route handler initiated.`); // For backend log
    try {
        // Check if the ID is a valid MongoDB ObjectId format BEFORE querying
        if (!mongoose.Types.ObjectId.isValid(mongoId)) {
            console.log(`Invalid MongoDB _id format: ${mongoId}`);
            return res.status(400).json({ msg: 'Invalid item ID format' }); // Send JSON error
        }

        const item = await MenuItem.findById(mongoId);
        if (!item) {
            console.log(`Menu item with _id "${mongoId}" not found.`);
            return res.status(404).json({ msg: 'Menu item not found' }); // Send JSON error
        }
        console.log(`Found menu item by _id "${mongoId}": ${item.name}`);
        res.json(item); // Send item as JSON
    } catch (err) {
        console.error(`Error in GET /api/menuitems/${mongoId} handler:`, err.name, '-', err.message);
        console.error(err.stack); // Log full stack for backend debugging
        // Send a JSON error response
        res.status(500).json({ msg: 'Server Error while fetching menu item.' }); 
    }
});


// @route   POST api/menuitems
// @desc    Add a new menu item
// @access  Private (should be protected by auth)
router.post('/', async (req, res) => {
    console.log("POST /api/menuitems - route handler initiated.");
    console.log("Request body for new item:", req.body);
    
    const { 
        itemId, name, categoryId, description, price, 
        image, tags, customizableOptions, mealOption, isAvailable 
    } = req.body;

    try {
        if (!itemId || !name || !categoryId || price === undefined || price === null || isNaN(parseFloat(price))) {
            let missingFields = [];
            if (!itemId) missingFields.push("itemId");
            if (!name) missingFields.push("name");
            if (!categoryId) missingFields.push("categoryId");
            if (price === undefined || price === null || isNaN(parseFloat(price))) missingFields.push("price (must be a number)");
            console.log("POST /api/menuitems - Validation Error. Missing:", missingFields.join(', '));
            return res.status(400).json({ msg: `Please include valid required fields: ${missingFields.join(', ')}.` });
        }

        let existingItem = await MenuItem.findOne({ itemId: itemId.trim() });
        if (existingItem) {
            console.log(`POST /api/menuitems - Item ID "${itemId}" already exists.`);
            return res.status(400).json({ msg: `Item ID "${itemId}" already exists. Item ID must be unique.` });
        }

        const newMenuItem = new MenuItem({
            itemId: itemId.trim(),
            name: name.trim(),
            categoryId,
            description: description ? description.trim() : '',
            price: parseFloat(price),
            image: image ? image.trim() : '', 
            tags: Array.isArray(tags) ? tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [],
            customizableOptions: Array.isArray(customizableOptions) ? customizableOptions : [], 
            mealOption: mealOption || null, 
            isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true 
        });

        const savedItem = await newMenuItem.save();
        console.log(`POST /api/menuitems - Menu item "${savedItem.name}" saved successfully.`);
        res.status(201).json(savedItem); 

    } catch (err) {
        console.error('Error in POST /api/menuitems handler:', err.name, '-', err.message);
        if (err.code === 11000) { 
             return res.status(400).json({ msg: `Item ID "${itemId}" likely already exists (database constraint).` });
        }
        console.error(err.stack);
        res.status(500).send('Server Error when creating menu item');
    }
});

// @route   PUT api/menuitems/:id  (MongoDB _id)
// @desc    Update an existing menu item
// @access  Private (should be protected)
router.put('/:id', async (req, res) => {
    const mongoId = req.params.id;
    console.log(`PUT /api/menuitems/${mongoId} - route handler initiated.`);
    console.log("Request body for update:", req.body);

    if (!mongoose.Types.ObjectId.isValid(mongoId)) {
        console.log(`PUT /api/menuitems/ - Invalid MongoDB _id format: ${mongoId}`);
        return res.status(400).json({ msg: 'Invalid item ID format for update' });
    }
    
    const { 
        itemId, name, categoryId, description, price, 
        image, tags, customizableOptions, mealOption, isAvailable 
    } = req.body;

    const itemFieldsToUpdate = {};
    if (itemId !== undefined) itemFieldsToUpdate.itemId = itemId.trim();
    if (name !== undefined) itemFieldsToUpdate.name = name.trim();
    if (categoryId !== undefined) itemFieldsToUpdate.categoryId = categoryId;
    if (description !== undefined) itemFieldsToUpdate.description = description.trim();
    if (price !== undefined && !isNaN(parseFloat(price))) itemFieldsToUpdate.price = parseFloat(price); else if (price !== undefined) return res.status(400).json({msg: "Price must be a valid number."});
    if (image !== undefined) itemFieldsToUpdate.image = image.trim();
    if (tags !== undefined && Array.isArray(tags)) itemFieldsToUpdate.tags = tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag);
    if (customizableOptions !== undefined && Array.isArray(customizableOptions)) itemFieldsToUpdate.customizableOptions = customizableOptions;
    if (mealOption !== undefined ) itemFieldsToUpdate.mealOption = mealOption; // Allow setting to null
    if (isAvailable !== undefined) itemFieldsToUpdate.isAvailable = Boolean(isAvailable);

    try {
        let menuItemToUpdate = await MenuItem.findById(mongoId);
        if (!menuItemToUpdate) {
            console.log(`PUT /api/menuitems/${mongoId} - Menu item not found for update.`);
            return res.status(404).json({ msg: 'Menu item not found' });
        }

        // If itemId is being changed, ensure the new one isn't already taken by another document
        if (itemFieldsToUpdate.itemId && itemFieldsToUpdate.itemId !== menuItemToUpdate.itemId) {
            const existingItemWithNewId = await MenuItem.findOne({ itemId: itemFieldsToUpdate.itemId });
            if (existingItemWithNewId) { // No need to check _id here, if it exists at all with new itemId, it's a conflict
                 console.log(`PUT /api/menuitems/${mongoId} - Attempt to change itemId to "${itemFieldsToUpdate.itemId}", which already exists.`);
                return res.status(400).json({ msg: `Item ID "${itemFieldsToUpdate.itemId}" is already in use by another item.` });
            }
        }
        
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            mongoId,
            { $set: itemFieldsToUpdate },
            { new: true, runValidators: true, context: 'query' } 
        );

        if (!updatedMenuItem) { 
             console.log(`PUT /api/menuitems/${mongoId} - Update failed, item not found after update attempt (should not happen if first findById worked).`);
            return res.status(404).json({ msg: 'Menu item update failed, item disappeared.' });
        }

        console.log(`PUT /api/menuitems/${mongoId} - Menu item "${updatedMenuItem.name}" updated successfully.`);
        res.json(updatedMenuItem);

    } catch (err) {
        console.error('Error in PUT /api/menuitems/:id handler:', err.name, '-', err.message);
        if (err.code === 11000) { 
             return res.status(400).json({ msg: `Update failed: Item ID "${itemFieldsToUpdate.itemId || 'provided'}" likely already exists (database constraint).` });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
        }
        console.error(err.stack);
        res.status(500).send('Server Error when updating menu item');
    }
});

router.delete('/:id', async (req, res) => {
    const mongoId = req.params.id;
    console.log(`DELETE /api/menuitems/${mongoId} - route handler initiated.`);

    try {
        // Check if the ID is a valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(mongoId)) {
            console.log(`Invalid MongoDB _id format for delete: ${mongoId}`);
            return res.status(400).json({ msg: 'Invalid item ID format for delete' });
        }

        const menuItem = await MenuItem.findByIdAndDelete(mongoId);

        if (!menuItem) {
            console.log(`DELETE /api/menuitems/${mongoId} - Menu item not found to delete.`);
            return res.status(404).json({ msg: 'Menu item not found' });
        }

        console.log(`DELETE /api/menuitems/${mongoId} - Menu item "${menuItem.name}" (itemId: ${menuItem.itemId}) deleted successfully.`);
        res.json({ msg: `Menu item "${menuItem.name}" deleted successfully`, deletedItem: menuItem });

    } catch (err) {
        console.error('Error in DELETE /api/menuitems/:id handler:', err.name, '-', err.message);
        console.error(err.stack);
        res.status(500).json({ msg: 'Server Error when deleting menu item' }); // Send JSON error
    }
});

module.exports = router;
