/**
 * XP Service — Centralized XP calculation, ranking, and decay logic
 */

const { RANK_THRESHOLDS } = require('../config/constants');

/**
 * Calculate XP for a workout.
 * Adds streak multiplier and first-workout-of-day bonus.
 */
function calculateWorkoutXP(caloriesBurned, streak, isFirstToday) {
    const baseXP = Math.max(5, Math.round(caloriesBurned / 2));

    // Streak multiplier: 1.0x base, +0.1x per streak day, cap at 2.0x
    const streakMultiplier = Math.min(2.0, 1.0 + (streak * 0.1));

    // First workout of the day bonus: +20 XP
    const firstBonus = isFirstToday ? 20 : 0;

    const totalXP = Math.round(baseXP * streakMultiplier) + firstBonus;

    return {
        baseXP,
        streakMultiplier,
        firstBonus,
        totalXP,
    };
}

/**
 * Calculate XP for quest completion
 */
function calculateQuestXP(quest) {
    return quest.xpReward;
}

/**
 * Apply XP decay for broken streaks.
 * 5% per missed day, capped at 25%. One grace miss/week.
 */
function calculateStreakDecay(user) {
    const now = new Date();
    const lastActive = user.streakData?.lastActiveDate;

    if (!lastActive) return { decay: 0, streakBroken: false };

    const msPerDay = 86400000;
    const daysSinceActive = Math.floor((now - new Date(lastActive)) / msPerDay);

    if (daysSinceActive <= 1) return { decay: 0, streakBroken: false };

    // Grace period: 1 free miss/week
    if (daysSinceActive === 2 && !user.streakData.graceUsedThisWeek) {
        return { decay: 0, streakBroken: false, useGrace: true };
    }

    // XP decay: 5% per missed day beyond grace
    const missedDays = daysSinceActive - 1;
    const decayPercent = Math.min(0.25, missedDays * 0.05);
    const decay = Math.round(user.xp * decayPercent);

    return { decay, streakBroken: true, missedDays };
}

/**
 * Get rank info for a given XP value
 */
function getRankInfo(xp) {
    const current = [...RANK_THRESHOLDS].reverse().find(r => xp >= r.minXp) || RANK_THRESHOLDS[0];
    const currentIndex = RANK_THRESHOLDS.findIndex(r => r.rank === current.rank);
    const next = RANK_THRESHOLDS[currentIndex + 1] || null;

    const progress = next
        ? (xp - current.minXp) / (next.minXp - current.minXp)
        : 1;

    return { current, next, progress, xpToNext: next ? next.minXp - xp : 0 };
}

/**
 * Check if user just ranked up
 */
function checkRankUp(oldXP, newXP) {
    const oldRank = getRankInfo(oldXP).current.rank;
    const newRank = getRankInfo(newXP).current.rank;
    return oldRank !== newRank ? newRank : null;
}

module.exports = {
    RANK_THRESHOLDS,
    calculateWorkoutXP,
    calculateQuestXP,
    calculateStreakDecay,
    getRankInfo,
    checkRankUp,
};
