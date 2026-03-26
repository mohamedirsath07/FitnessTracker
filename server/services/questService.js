/**
 * Quest Service — Daily/weekly quest generation and progress tracking.
 * Uses lazy evaluation (no cron jobs).
 */

const Quest = require('../models/Quest');

const QUESTS_PER_DAY = 3;
const WEEKLY_QUESTS = 1;

/**
 * Generate daily quests for a user.
 * Called on first API hit of the day (lazy — no cron job needed).
 */
async function refreshQuests(user, session = null) {
    const now = new Date();

    // Check if quests are still valid
    const hasValidDailyQuests = user.activeQuests?.some(q =>
        q.type === 'daily' && q.expiresAt > now && !q.completed
    );

    if (hasValidDailyQuests) return user.activeQuests;

    // Clear expired quests, keep completed ones for history display today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const completedToday = user.activeQuests?.filter(q =>
        q.completed && q.completedAt > todayStart
    ) || [];

    // Fetch quest templates matching user's rank
    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S', 'NATIONAL'];
    const userRank = user.getLevel ? user.getLevel().rank : 'E';
    const userRankIndex = rankOrder.indexOf(userRank);
    const eligibleRanks = rankOrder.slice(0, userRankIndex + 1);

    const questPool = await Quest.find({
        isActive: true,
        minRank: { $in: eligibleRanks },
        type: 'daily',
    }).session(session);

    // Weighted random selection
    const selected = weightedSample(questPool, QUESTS_PER_DAY);

    // Set expiry to midnight IST (UTC+5:30)
    const midnightIST = new Date();
    midnightIST.setUTCHours(18, 30, 0, 0); // IST midnight = UTC 18:30 prev day
    if (midnightIST < now) midnightIST.setDate(midnightIST.getDate() + 1);

    const dailyQuests = selected.map(q => ({
        questId: q.questId,
        type: 'daily',
        title: q.title,
        description: q.description || '',
        icon: q.icon || '⚡',
        target: q.target,
        progress: 0,
        xpReward: q.xpReward,
        completed: false,
        expiresAt: midnightIST,
    }));

    // Also refresh weekly quests if none active
    let weeklyQuests = user.activeQuests?.filter(q => q.type === 'weekly' && q.expiresAt > now) || [];
    if (weeklyQuests.length === 0) {
        const weeklyPool = await Quest.find({ isActive: true, type: 'weekly', minRank: { $in: eligibleRanks } }).session(session);
        const selectedWeekly = weightedSample(weeklyPool, WEEKLY_QUESTS);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        endOfWeek.setUTCHours(18, 30, 0, 0);

        weeklyQuests = selectedWeekly.map(q => ({
            questId: q.questId,
            type: 'weekly',
            title: q.title,
            description: q.description || '',
            icon: q.icon || '📅',
            target: q.target,
            progress: 0,
            xpReward: q.xpReward,
            completed: false,
            expiresAt: endOfWeek,
        }));
    }

    user.activeQuests = [...completedToday, ...dailyQuests, ...weeklyQuests];
    await user.save({ session });

    return user.activeQuests;
}

/**
 * Update quest progress when user completes an action.
 * @param {Object} user - Mongoose user document
 * @param {string} category - 'workout' | 'nutrition' | 'streak'
 * @param {number} value - calories burned, meals logged, etc.
 * @returns {Array} completed quests
 */
async function updateQuestProgress(user, category, value, session = null) {
    if (!user.activeQuests?.length) return [];

    const completed = [];

    for (const quest of user.activeQuests) {
        if (quest.completed || quest.expiresAt < new Date()) continue;

        if (shouldQuestProgress(quest, category)) {
            quest.progress = Math.min(quest.target, quest.progress + value);

            if (quest.progress >= quest.target) {
                quest.completed = true;
                quest.completedAt = new Date();
                user.xp += quest.xpReward;
                completed.push({
                    questId: quest.questId,
                    title: quest.title,
                    xpReward: quest.xpReward,
                    justCompleted: true,
                });
            }
        }
    }

    if (completed.length > 0) {
        user.markModified('activeQuests');
        await user.save({ session });
    }

    return completed;
}

function shouldQuestProgress(quest, category) {
    const id = quest.questId;

    // Calorie-burn quests: burn_* (daily) or weekly_burn_* (weekly)
    if (id.startsWith('burn_') || id.includes('_burn_')) {
        return category === 'workout';
    }

    // Workout count quests: *workout* (any_workout, two_workouts, weekly_N_workouts)
    if (id.includes('workout')) {
        return category === 'workout_count';
    }

    // Nutrition quests: log_* (daily) or weekly_N_meals (weekly)
    if (id.startsWith('log_') || id.includes('_meals')) {
        return category === 'nutrition';
    }

    // Streak quests: weekly_streak_*
    if (id.includes('streak')) {
        return category === 'streak';
    }

    return false;
}

function weightedSample(pool, count) {
    if (pool.length <= count) return [...pool];

    const weights = pool.map(q =>
        q.difficulty === 'easy' ? 3 : q.difficulty === 'medium' ? 5 : 2
    );
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    const selected = [];
    const used = new Set();

    while (selected.length < count && selected.length < pool.length) {
        let r = Math.random() * totalWeight;
        for (let i = 0; i < pool.length; i++) {
            if (used.has(i)) continue;
            r -= weights[i];
            if (r <= 0) {
                selected.push(pool[i]);
                used.add(i);
                break;
            }
        }
    }

    return selected;
}

module.exports = { refreshQuests, updateQuestProgress };
