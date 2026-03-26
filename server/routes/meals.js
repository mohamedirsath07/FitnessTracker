/**
 * ============================================
 * MEAL ROUTES
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * These routes handle nutrition/meal tracking.
 * Similar pattern to workouts - CRUD operations.
 * 
 * NUTRITION TRACKING:
 * - Log meals with calories and macros
 * - Get daily/weekly summaries
 * - Track calorie surplus/deficit
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Meal = require('../models/Meal');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');
const { refreshQuests, updateQuestProgress } = require('../services/questService');

// All meal routes require authentication
router.use(protect);

/**
 * @route   GET /api/meals
 * @desc    Get meals for the logged-in user
 * @access  Private
 * 
 * Query parameters:
 * - date: specific date (YYYY-MM-DD)
 * - limit: number of results
 */
router.get('/', async (req, res) => {
    try {
        const { date, limit = 50 } = req.query;

        const filter = { userId: req.user.id };

        // If date is provided, filter by that day
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const meals = await Meal.find(filter)
            .sort({ date: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: meals.length,
            meals
        });

    } catch (error) {
        console.error('Get meals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching meals'
        });
    }
});

/**
 * @route   POST /api/meals
 * @desc    Log a new meal
 * @access  Private
 * 
 * Request body:
 * {
 *   "name": "Chicken Salad",
 *   "mealType": "lunch",
 *   "calories": 450,
 *   "protein": 35,
 *   "carbs": 20,
 *   "fats": 25,
 *   "fiber": 5
 * }
 */
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Meal name is required'),
        body('calories').isInt({ min: 0 }).withMessage('Calories must be a positive number')
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

            const { name, mealType, calories, protein, carbs, fats, fiber } = req.body;

            // === Atomic transaction: meal + progress + quests ===
            const session = await mongoose.startSession();
            try {
                let responseData;
                await session.withTransaction(async () => {
                    // Create meal
                    const meal = new Meal({
                        userId: req.user.id,
                        name,
                        mealType: mealType || 'snack',
                        calories,
                        protein: protein || 0,
                        carbs: carbs || 0,
                        fats: fats || 0,
                        fiber: fiber || 0
                    });
                    await meal.save({ session });

                    // Update daily progress
                    const progress = await Progress.getOrCreateToday(req.user.id, session);
                    progress.caloriesConsumed += calories;
                    progress.proteinIntake += protein || 0;
                    progress.carbsIntake += carbs || 0;
                    progress.fatsIntake += fats || 0;
                    await progress.save({ session });

                    // Update quest progress and analytics
                    let questsCompleted = [];
                    const user = await User.findById(req.user.id).session(session);
                    if (user) {
                        // Update analytics
                        if (!user.analytics) user.analytics = {};
                        user.analytics.totalMealsLogged = (user.analytics.totalMealsLogged || 0) + 1;
                        await user.save({ session });

                        // Update nutrition quests
                        await refreshQuests(user, session);
                        questsCompleted = await updateQuestProgress(user, 'nutrition', 1, session);
                    }

                    responseData = {
                        success: true,
                        message: 'Meal logged successfully!',
                        meal,
                        questsCompleted,
                    };
                });

                res.status(201).json(responseData);
            } finally {
                session.endSession();
            }

        } catch (error) {
            console.error('Create meal error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error creating meal'
            });
        }
    }
);

/**
 * @route   GET /api/meals/today
 * @desc    Get today's meals with summary
 * @access  Private
 */
router.get('/today', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const meals = await Meal.find({
            userId: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ date: 1 });

        const summary = await Meal.getDailySummary(req.user.id);

        res.json({
            success: true,
            meals,
            summary: {
                ...summary,
                calorieGoal: req.user.dailyCalorieGoal,
                remaining: req.user.dailyCalorieGoal - summary.totalCalories
            }
        });

    } catch (error) {
        console.error('Today meals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching today\'s meals'
        });
    }
});

/**
 * @route   GET /api/meals/weekly
 * @desc    Get weekly nutrition data for charts
 * @access  Private
 */
router.get('/weekly', async (req, res) => {
    try {
        const weeklyData = await Meal.getWeeklyData(req.user.id);

        // Format for chart display
        const formattedData = weeklyData.map(day => ({
            date: day._id,
            calories: day.totalCalories,
            protein: day.totalProtein,
            carbs: day.totalCarbs,
            fats: day.totalFats
        }));

        res.json({
            success: true,
            data: formattedData
        });

    } catch (error) {
        console.error('Weekly meals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching weekly data'
        });
    }
});

/**
 * @route   DELETE /api/meals/:id
 * @desc    Delete a meal
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id);

        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found'
            });
        }

        // Make sure user owns the meal
        if (meal.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this meal'
            });
        }

        await meal.deleteOne();

        res.json({
            success: true,
            message: 'Meal deleted'
        });

    } catch (error) {
        console.error('Delete meal error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting meal'
        });
    }
});

module.exports = router;
