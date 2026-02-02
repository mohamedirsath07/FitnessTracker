/**
 * ============================================
 * AUTHENTICATION ROUTES
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * WHAT IS A ROUTER?
 * Express Router is a mini-application that handles specific routes.
 * We use it to organize our code by feature (auth, users, workouts, etc.)
 * 
 * HTTP METHODS:
 * - GET: Retrieve data (e.g., get user profile)
 * - POST: Create new data (e.g., register user)
 * - PUT: Update existing data (e.g., update profile)
 * - DELETE: Remove data (e.g., delete workout)
 * 
 * ROUTE PARAMETERS:
 * Routes define URL patterns. Example:
 * - POST /api/auth/register -> register a new user
 * - POST /api/auth/login -> login a user
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public (no auth required)
 * 
 * Request body should contain:
 * {
 *   "username": "string",
 *   "email": "string",
 *   "password": "string",
 *   "height": number (optional),
 *   "weight": number (optional),
 *   ... other profile fields
 * }
 */
router.post(
    '/register',
    // Validation middleware using express-validator
    [
        body('username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { username, email, password, height, weight, age, gender, bodyFat, goal } = req.body;

            // Check if user already exists
            let user = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email or username'
                });
            }

            // Create new user
            user = await User.create({
                username,
                email,
                password,  // Will be hashed by the pre-save middleware
                height: height || 170,
                weight: weight || 70,
                age: age || 25,
                gender: gender || 'male',
                bodyFat: bodyFat || 20,
                goal: goal || 'maintenance'
            });

            // Generate JWT token
            const token = generateToken(user._id);

            // Send response
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    height: user.height,
                    weight: user.weight,
                    bodyFat: user.bodyFat,
                    xp: user.xp,
                    streak: user.streak
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during registration'
            });
        }
    }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token
 * @access  Public
 * 
 * Request body:
 * {
 *   "email": "string" (or "username": "string"),
 *   "password": "string"
 * }
 */
router.post(
    '/login',
    [
        body('password').exists().withMessage('Password is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, username, password } = req.body;

            // Find user by email or username
            const user = await User.findOne({
                $or: [
                    { email: email?.toLowerCase() },
                    { username }
                ]
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check password using the instance method we defined
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Update streak
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (user.lastWorkoutDate) {
                const lastWorkout = new Date(user.lastWorkoutDate);
                lastWorkout.setHours(0, 0, 0, 0);

                const diffDays = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));

                if (diffDays > 1) {
                    // Streak broken
                    user.streak = 0;
                    await user.save();
                }
            }

            // Generate token
            const token = generateToken(user._id);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    height: user.height,
                    weight: user.weight,
                    bodyFat: user.bodyFat,
                    xp: user.xp,
                    streak: user.streak,
                    goal: user.goal
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private (requires auth)
 * 
 * No request body needed - user is identified by JWT token
 */
router.get('/me', protect, async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                height: user.height,
                weight: user.weight,
                age: user.age,
                gender: user.gender,
                bodyFat: user.bodyFat,
                xp: user.xp,
                streak: user.streak,
                goal: user.goal,
                dailyCalorieGoal: user.dailyCalorieGoal,
                dailyBurnGoal: user.dailyBurnGoal,
                level: user.getLevel()  // Using the instance method
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
