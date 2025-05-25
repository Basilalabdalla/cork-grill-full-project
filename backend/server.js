// server.js
require('dotenv').config();

// Debugging: Log environment variables immediately after dotenv attempts to load them
console.log('--- .env Variables Check ---');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
console.log('-----------------------------');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- Route Files ---
const menuItemsRoutes = require('./routes/menuItems');
const categoryRoutes = require('./routes/categories'); // Import the menu items route file

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Check if MONGODB_URI is defined before trying to connect
if (!process.env.MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in the environment variables. Please check your .env file and ensure dotenv.config() is called at the top of server.js.');
    process.exit(1); // Exit the application if the DB URI is missing
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.name, '-', err.message); 
        if (process.env.MONGODB_URI) {
            const redactedURI = process.env.MONGODB_URI.replace(/:([^:@]*)(?=@)/, ':********');
            console.error('Attempted to connect with URI (password redacted):', redactedURI);
        }
    });

// --- API Routes ---
console.log("Setting up /api/menuitems route..."); // Log before setting up the route
app.use('/api/menuitems', menuItemsRoutes);  
app.use('/api/categories', categoryRoutes);       // Use the menu items routes for any path starting with /api/menuitems

// --- Basic Server Test Route ---
app.get('/', (req, res) => {
    console.log("GET / route hit"); // Log when the base route is accessed
    res.send('Cork Grill Backend API is running!');
});


// --- Define Port and Start Server ---
const PORT = process.env.PORT || 5001; 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});