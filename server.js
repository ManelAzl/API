require('dotenv').config({ path: './config/.env' });
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

/**
 * Connect to MongoDB Database
 * Uses connection string from .env file
 */
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// -------------------- REST API ROUTES -------------------- //

/**
 * GET /users - RETURN ALL USERS
 * Retrieves all user documents from the database
 */
app.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Mongoose method to get all users
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

/**
 * POST /users - ADD A NEW USER TO THE DATABASE
 * Creates a new user with data from request body
 */
app.post('/users', async (req, res) => {
    try {
        const { name, email, age, country } = req.body;
        
        // Create new user instance
        const newUser = new User({
            name,
            email,
            age,
            country
        });
        
        // Save user to database
        const savedUser = await newUser.save();
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: savedUser
        });
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Error creating user',
                error: error.message
            });
        }
    }
});

/**
 * PUT /users/:id - EDIT A USER BY ID
 * Updates user information based on ID parameter
 */
app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get user ID from URL parameters
        const updateData = req.body; // Get update data from request body
        
        // Find user by ID and update, return updated document
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true } // Options: return updated doc & run validators
        );
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

/**
 * DELETE /users/:id - REMOVE A USER BY ID
 * Deletes a user from the database based on ID
 */
app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get user ID from URL parameters
        
        // Find user by ID and delete
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: deletedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

// Root route for API documentation
app.get('/', (req, res) => {
    res.json({
        message: 'User Management REST API',
        endpoints: {
            'GET /users': 'Get all users',
            'POST /users': 'Create a new user',
            'PUT /users/:id': 'Update a user by ID',
            'DELETE /users/:id': 'Delete a user by ID'
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}`);
});