/**
 * Application Constants
 * All magic numbers and config in one place.
 */

const RANK_THRESHOLDS = [
    { rank: 'E', minXp: 0, color: '#6b7280' },
    { rank: 'D', minXp: 1000, color: '#a855f7' },
    { rank: 'C', minXp: 2500, color: '#3b82f6' },
    { rank: 'B', minXp: 5000, color: '#22c55e' },
    { rank: 'A', minXp: 10000, color: '#eab308' },
    { rank: 'S', minXp: 20000, color: '#ef4444' },
    { rank: 'NATIONAL', minXp: 50000, color: '#f97316' },
];

const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        features: {
            maxWorkoutsPerDay: 5,
            maxMealsPerDay: 10,
            questSlots: 3,
            guildAccess: false,
            weeklyChallenge: false,
            offlineSync: false,
        },
    },
    pro: {
        name: 'Pro',
        priceMonthly: 99,
        priceYearly: 799,
        razorplanIdMonthly: process.env.RAZORPAY_PLAN_MONTHLY,
        razorplanIdYearly: process.env.RAZORPAY_PLAN_YEARLY,
        features: {
            maxWorkoutsPerDay: Infinity,
            maxMealsPerDay: Infinity,
            questSlots: 5,
            guildAccess: true,
            weeklyChallenge: true,
            offlineSync: true,
            customQuests: true,
            advancedAnalytics: true,
            noAds: true,
        },
    },
};

module.exports = { RANK_THRESHOLDS, PLANS };
