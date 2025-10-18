const mongoose = require('mongoose');

/**
 * User Schema Definition
 * Defines the structure of user documents in MongoDB
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'], // Validator: name must be provided
        trim: true // Removes whitespace from both ends
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Ensures no duplicate emails
        lowercase: true, // Converts email to lowercase
        trim: true
    },
    age: {
        type: Number,
        min: [0, 'Age must be positive'] // Validator: age can't be negative
    },
    country: {
        type: String,
        default: 'Unknown' // Default value if not provided
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create and export User model
module.exports = mongoose.model('User', userSchema);