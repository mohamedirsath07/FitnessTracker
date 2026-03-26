/**
 * ============================================
 * PROGRESS MODEL
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * This model stores daily progress snapshots.
 * It records weight, body fat, and daily activity totals.
 * 
 * Used for:
 * - Tracking weight trends over time
 * - Showing progress graphs
 * - Calculating body transformation
 */

const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Date of this progress entry
    date: {
        type: Date,
        default: Date.now
    },

    // Body measurements (snapshot of user's stats)
    weight: {
        type: Number,
        min: 30,
        max: 300
    },

    bodyFat: {
        type: Number,
        min: 3,
        max: 60
    },

    // Daily totals (aggregated from workouts and meals)
    caloriesConsumed: {
        type: Number,
        default: 0
    },

    caloriesBurned: {
        type: Number,
        default: 0
    },

    // Calculated: consumed - burned
    calorieDelta: {
        type: Number,
        default: 0
    },

    // Daily macros
    proteinIntake: {
        type: Number,
        default: 0
    },

    carbsIntake: {
        type: Number,
        default: 0
    },

    fatsIntake: {
        type: Number,
        default: 0
    },

    // Workout count for the day
    workoutCount: {
        type: Number,
        default: 0
    },

    // XP earned this day
    xpEarned: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

/**
 * Compound Index
 * 
 * Creates an index on userId + date for faster queries.
 * The unique constraint prevents duplicate entries for the same day.
 */
ProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

/**
 * PRE-SAVE: Calculate calorie delta
 */
ProgressSchema.pre('save', function (next) {
    this.calorieDelta = this.caloriesConsumed - this.caloriesBurned;
    next();
});

/**
 * STATIC METHOD: Get or Create Today's Progress
 * 
 * Either finds today's entry or creates a new one
 */
ProgressSchema.statics.getOrCreateToday = async function (userId, session = null) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let progress = await this.findOne({
        userId,
        date: { $gte: startOfDay }
    }).session(session);

    if (!progress) {
        // Get user's current stats for the snapshot
        const User = mongoose.model('User');
        const user = await User.findById(userId).session(session);

        progress = new this({
            userId,
            date: new Date(),
            weight: user?.weight || 70,
            bodyFat: user?.bodyFat || 20
        });
        await progress.save({ session });
    }

    return progress;
};

/**
 * STATIC METHOD: Get Progress History
 * 
 * Returns progress entries for a date range
 */
ProgressSchema.statics.getHistory = async function (userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.find({
        userId,
        date: { $gte: startDate }
    }).sort({ date: 1 });
};

module.exports = mongoose.model('Progress', ProgressSchema);
