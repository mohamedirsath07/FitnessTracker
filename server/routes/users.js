/**
 * ============================================
 * USER ROUTES
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * These routes handle user profile management.
 * All routes here are protected (require authentication).
 * 
 * The pattern is:
 * - Import dependencies
 * - Create router
 * - Define routes
 * - Export router
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const { protect } = require('../middleware/auth');
const { getRankInfo } = require('../services/xpService');

/**
 * @route   POST /api/users/push-subscribe
 * @desc    Save push notification subscription
 * @access  Private
 */
router.post('/push-subscribe', protect, async (req, res) => {
    try {
        const { endpoint, keys } = req.body;
        if (!endpoint) return res.status(400).json({ message: 'Invalid subscription' });

        await User.findByIdAndUpdate(req.user.id, {
            pushSubscription: { endpoint, keys },
        });

        res.json({ success: true, message: 'Push subscription saved' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save subscription' });
    }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 * 
 * Used to update body metrics (height, weight, bodyFat, etc.)
 */
router.put(
    '/profile',
    protect,
    [
        body('height').optional().isFloat({ min: 100, max: 250 }),
        body('weight').optional().isFloat({ min: 30, max: 300 }),
        body('goalWeight').optional().isFloat({ min: 30, max: 300 }),
        body('bodyFat').optional().isFloat({ min: 3, max: 60 }),
        body('age').optional().isInt({ min: 13, max: 120 })
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

            // Fields that can be updated
            const allowedFields = [
                'height', 'weight', 'goalWeight', 'age', 'gender', 'bodyFat',
                'goal', 'dailyCalorieGoal', 'dailyBurnGoal', 'profilePicture'
            ];

            // Build update object with only allowed fields
            const updateData = {};
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            });

            // Update user
            const user = await User.findByIdAndUpdate(
                req.user.id,
                { $set: updateData },
                { new: true, runValidators: true }  // Return updated doc, run validators
            );

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    height: user.height,
                    weight: user.weight,
                    goalWeight: user.goalWeight,
                    age: user.age,
                    gender: user.gender,
                    bodyFat: user.bodyFat,
                    xp: user.xp,
                    streak: user.streak,
                    goal: user.goal,
                    dailyCalorieGoal: user.dailyCalorieGoal,
                    dailyBurnGoal: user.dailyBurnGoal,
                    profilePicture: user.profilePicture || '',
                    level: user.getLevel()
                }
            });

        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error updating profile'
            });
        }
    }
);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics and summary with activity analysis
 * @access  Private
 * 
 * Returns aggregated data for the dashboard with comprehensive activity analysis
 */
router.get('/stats', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get workout summary
        const workoutSummary = await Workout.getWeeklySummary(userId);

        // Get today's meals
        const todayMeals = await Meal.getDailySummary(userId);

        // Get weekly meal data for charts
        const weeklyMealData = await Meal.getWeeklyData(userId);

        // Get recent workouts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentWorkouts = await Workout.find({
            userId,
            date: { $gte: sevenDaysAgo }
        }).sort({ date: -1 });

        // Get workout breakdown by type
        const workoutBreakdown = await Workout.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalCalories: { $sum: '$caloriesBurned' },
                    totalDuration: { $sum: '$duration' },
                    totalReps: { $sum: { $multiply: ['$reps', '$sets'] } }
                }
            },
            {
                $project: {
                    type: '$_id',
                    count: 1,
                    calories: '$totalCalories',
                    duration: '$totalDuration',
                    totalReps: 1
                }
            },
            { $sort: { calories: -1 } }
        ]);

        // Build weekly workout data grouped by day
        const weeklyWorkoutData = await Workout.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    totalCalories: { $sum: '$caloriesBurned' },
                    totalDuration: { $sum: '$duration' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    date: '$_id',
                    totalCalories: 1,
                    totalDuration: 1,
                    count: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Calculate streak status
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayWorkout = await Workout.findOne({
            userId,
            date: { $gte: today }
        });

        // Today's stats
        const todayBurned = recentWorkouts
            .filter(w => new Date(w.date) >= today)
            .reduce((sum, w) => sum + w.caloriesBurned, 0);

        const todayDuration = recentWorkouts
            .filter(w => new Date(w.date) >= today)
            .reduce((sum, w) => sum + (w.duration || 0), 0);

        res.json({
            success: true,
            stats: {
                user: {
                    xp: req.user.xp,
                    streak: req.user.streak,
                    level: req.user.getLevel(),
                    weight: req.user.weight,
                    goalWeight: req.user.goalWeight,
                    bodyFat: req.user.bodyFat
                },
                today: {
                    caloriesConsumed: todayMeals.totalCalories,
                    caloriesBurned: todayBurned,
                    duration: todayDuration,
                    protein: todayMeals.totalProtein,
                    carbs: todayMeals.totalCarbs,
                    fats: todayMeals.totalFats,
                    workoutCompleted: !!todayWorkout,
                    workoutCount: recentWorkouts.filter(w => new Date(w.date) >= today).length
                },
                weekly: {
                    workouts: weeklyWorkoutData.map(w => ({
                        date: w.date,
                        totalCalories: w.totalCalories,
                        totalDuration: w.totalDuration,
                        count: w.count
                    })),
                    meals: weeklyMealData
                },
                workoutBreakdown: workoutBreakdown.map(w => ({
                    type: w.type,
                    count: w.count,
                    calories: w.calories,
                    duration: w.duration,
                    totalReps: w.totalReps || 0
                })),
                recentWorkouts: recentWorkouts.slice(0, 10).map(w => ({
                    id: w._id,
                    type: w.type,
                    duration: w.duration,
                    reps: w.reps,
                    sets: w.sets,
                    caloriesBurned: w.caloriesBurned,
                    xpEarned: w.xpEarned,
                    date: w.date,
                    inputType: w.inputType
                }))
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching stats'
        });
    }
});

/**
 * @route   GET /api/users/leaderboard
 * @desc    Get top users by XP
 * @access  Private
 */
router.get('/leaderboard', protect, async (req, res) => {
    try {
        const topUsers = await User.find({})
            .select('username xp streak profilePicture')
            .sort({ xp: -1 })
            .limit(10)
            .lean();

        res.json({
            success: true,
            leaderboard: topUsers.map((user, index) => {
                const rankInfo = getRankInfo(user.xp);
                return {
                    rank: index + 1,
                    username: user.username,
                    xp: user.xp,
                    streak: user.streak,
                    level: { rank: rankInfo.current.rank, color: rankInfo.current.color, progress: rankInfo.progress },
                    profilePicture: user.profilePicture || '',
                };
            })
        });

    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching leaderboard'
        });
    }
});

module.exports = router;
