/**
 * ============================================
 * USER MODEL (MongoDB Schema)
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * WHAT IS A MODEL?
 * A model is a blueprint for documents in MongoDB.
 * Think of it like a form template - it defines what fields exist
 * and what type of data each field should contain.
 * 
 * WHAT IS A SCHEMA?
 * A schema defines the structure of your data:
 * - What fields the document has
 * - The data type of each field (String, Number, etc.)
 * - Validation rules (required, min length, etc.)
 * - Default values
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * 
 * Each key represents a field in the User document.
 * The value is a configuration object with:
 * - type: The data type (String, Number, Date, etc.)
 * - required: Whether the field must be filled
 * - unique: Whether the value must be unique across all users
 * - default: Default value if none provided
 */
const UserSchema = new mongoose.Schema({
    // Authentication Fields
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,  // Removes whitespace from both ends
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,  // Converts to lowercase before saving
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },

    // Body Metrics - Used for 3D visualization & calculations
    height: {
        type: Number,
        default: 170,  // cm
        min: [100, 'Height must be at least 100cm'],
        max: [250, 'Height cannot exceed 250cm']
    },

    weight: {
        type: Number,
        default: 70,  // kg
        min: [30, 'Weight must be at least 30kg'],
        max: [300, 'Weight cannot exceed 300kg']
    },

    age: {
        type: Number,
        min: [13, 'Must be at least 13 years old'],
        max: [100, 'Age cannot exceed 100']
    },

    gender: {
        type: String,
        enum: ['male', 'female', 'other'],  // Only these values allowed
        default: 'male'
    },

    bodyFat: {
        type: Number,
        default: 20,  // percentage
        min: [3, 'Body fat must be at least 3%'],
        max: [60, 'Body fat cannot exceed 60%']
    },

    // Gamification & Progress
    xp: {
        type: Number,
        default: 0
    },

    streak: {
        type: Number,
        default: 0
    },

    lastWorkoutDate: {
        type: Date,
        default: null
    },

    // User Goals
    goal: {
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'maintenance', 'endurance'],
        default: 'maintenance'
    },

    dailyCalorieGoal: {
        type: Number,
        default: 2000
    },

    dailyBurnGoal: {
        type: Number,
        default: 500
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * PRE-SAVE MIDDLEWARE (Hook)
 * 
 * This runs BEFORE the document is saved to the database.
 * We use it to hash the password so we never store plain text passwords.
 * 
 * WHY HASH PASSWORDS?
 * If someone hacks your database, they can't see the actual passwords.
 * The hash is a one-way function - you can't reverse it to get the password.
 * 
 * bcrypt adds "salt" (random data) before hashing, making it even more secure.
 */
UserSchema.pre('save', async function (next) {
    // Only hash the password if it was modified (or is new)
    // this.isModified() is a Mongoose method
    if (!this.isModified('password')) {
        return next();
    }

    // Generate a salt (random string to add to password)
    // The number 10 is the "cost factor" - higher = more secure but slower
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);

    next();  // Continue to save the document
});

/**
 * INSTANCE METHOD: Compare Password
 * 
 * Instance methods are functions available on each document.
 * This compares a plain text password with the hashed password.
 * 
 * We use this during login to verify the password is correct.
 */
UserSchema.methods.comparePassword = async function (enteredPassword) {
    // bcrypt.compare() hashes the entered password and compares
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * INSTANCE METHOD: Calculate Level/Rank
 * 
 * Returns the user's current rank based on XP.
 */
UserSchema.methods.getLevel = function () {
    const levels = [
        { rank: 'E', minXp: 0 },
        { rank: 'D', minXp: 1000 },
        { rank: 'C', minXp: 2500 },
        { rank: 'B', minXp: 5000 },
        { rank: 'A', minXp: 10000 },
        { rank: 'S', minXp: 20000 },
        { rank: 'NATIONAL', minXp: 50000 },
    ];

    return [...levels].reverse().find(l => this.xp >= l.minXp) || levels[0];
};

// Export the model
// mongoose.model('User', UserSchema) creates a collection called 'users' in MongoDB
module.exports = mongoose.model('User', UserSchema);
