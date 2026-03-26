/**
 * Admin Stats Route
 * Lightweight analytics dashboard for the founder.
 * Protected by a simple admin key in headers.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const Guild = require('../models/Guild');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get aggregate app metrics
 * @access  Admin (x-admin-key header)
 */
router.get('/dashboard', async (req, res) => {
    if (!process.env.ADMIN_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
        const now = new Date();
        const dayAgo = new Date(now - 86400000);
        const weekAgo = new Date(now - 604800000);
        const monthAgo = new Date(now - 2592000000);

        const [
            totalUsers,
            dau,
            wau,
            mau,
            totalWorkouts,
            todayWorkouts,
            totalMeals,
            todayMeals,
            totalGuilds,
            avgStats,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ 'streakData.lastActiveDate': { $gte: dayAgo } }),
            User.countDocuments({ 'streakData.lastActiveDate': { $gte: weekAgo } }),
            User.countDocuments({ 'streakData.lastActiveDate': { $gte: monthAgo } }),
            Workout.countDocuments(),
            Workout.countDocuments({ date: { $gte: dayAgo } }),
            Meal.countDocuments(),
            Meal.countDocuments({ date: { $gte: dayAgo } }),
            Guild.countDocuments(),
            User.aggregate([
                {
                    $group: {
                        _id: null,
                        avgXP: { $avg: '$xp' },
                        avgStreak: { $avg: '$streak' },
                        maxXP: { $max: '$xp' },
                        maxStreak: { $max: '$streak' },
                    },
                },
            ]),
        ]);

        const stats = avgStats[0] || { avgXP: 0, avgStreak: 0, maxXP: 0, maxStreak: 0 };

        // Rank distribution
        const rankDistribution = await User.aggregate([
            {
                $addFields: {
                    rank: {
                        $switch: {
                            branches: [
                                { case: { $gte: ['$xp', 50000] }, then: 'NATIONAL' },
                                { case: { $gte: ['$xp', 20000] }, then: 'S' },
                                { case: { $gte: ['$xp', 10000] }, then: 'A' },
                                { case: { $gte: ['$xp', 5000] }, then: 'B' },
                                { case: { $gte: ['$xp', 2500] }, then: 'C' },
                                { case: { $gte: ['$xp', 1000] }, then: 'D' },
                            ],
                            default: 'E',
                        },
                    },
                },
            },
            { $group: { _id: '$rank', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        res.json({
            success: true,
            users: { total: totalUsers, dau, wau, mau },
            engagement: {
                totalWorkouts,
                todayWorkouts,
                totalMeals,
                todayMeals,
                totalGuilds,
                avgXP: Math.round(stats.avgXP),
                avgStreak: Math.round(stats.avgStreak * 10) / 10,
                maxXP: stats.maxXP,
                maxStreak: stats.maxStreak,
            },
            retention: {
                dau_wau: wau > 0 ? Math.round((dau / wau) * 100) : 0,
                dau_mau: mau > 0 ? Math.round((dau / mau) * 100) : 0,
            },
            rankDistribution: rankDistribution.map(r => ({ rank: r._id, count: r.count })),
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
});

module.exports = router;
