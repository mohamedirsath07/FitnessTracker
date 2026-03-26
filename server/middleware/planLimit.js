/**
 * Plan Limit Middleware — Check subscription plan limits
 */

const { PLANS } = require('../config/constants');

function requirePlan(feature) {
    return (req, res, next) => {
        const userPlan = req.user.subscription?.plan || 'free';
        const planConfig = PLANS[userPlan];

        if (!planConfig.features[feature]) {
            return res.status(403).json({
                message: 'Upgrade to Pro to access this feature',
                upgrade: true,
            });
        }
        next();
    };
}

function checkDailyLimit(type) {
    return async (req, res, next) => {
        const userPlan = req.user.subscription?.plan || 'free';
        const limit = PLANS[userPlan].features[`max${type}PerDay`];

        if (limit === Infinity) return next();

        const Model = type === 'Workouts' ? require('../models/Workout') : require('../models/Meal');
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const count = await Model.countDocuments({
            userId: req.user.id,
            date: { $gte: todayStart },
        });

        if (count >= limit) {
            return res.status(429).json({
                message: `Daily ${type.toLowerCase()} limit reached (${limit}). Upgrade to Pro for unlimited.`,
                upgrade: true,
            });
        }
        next();
    };
}

module.exports = { requirePlan, checkDailyLimit };
