/**
 * Streak Service — Handles streak logic with freeze protection
 *
 * Freeze rules:
 *   - Each user gets 1 freeze per week (resets Monday).
 *   - If the user misses exactly 1 day and a freeze is available,
 *     the freeze is consumed and the streak is preserved.
 *   - If no freeze is available (or gap > 1 day), streak breaks.
 */

/**
 * Return the Monday 00:00 of the ISO week containing `date`.
 */
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun … 6=Sat
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Ensure freezesAvailable is reset if we've entered a new ISO week.
 * Mutates user.streakData in place.
 */
function maybeResetWeeklyFreeze(user) {
    const now = new Date();
    const currentWeek = getWeekStart(now).getTime();
    const lastWeek = user.streakData.freezeWeekStart
        ? new Date(user.streakData.freezeWeekStart).getTime()
        : 0;

    if (currentWeek !== lastWeek) {
        user.streakData.freezesAvailable = 1;
        user.streakData.freezeWeekStart = new Date(currentWeek);
        user.streakData.graceUsedThisWeek = false;
    }
}

/**
 * Update streak on workout completion.
 * Supports 1 streak-freeze per week.
 */
function updateStreak(user) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Ensure streakData exists with freeze fields
    if (!user.streakData) {
        user.streakData = { current: 0, longest: 0, graceUsedThisWeek: false, freezesAvailable: 1, freezeWeekStart: null };
    }

    // Reset freeze allowance on new week
    maybeResetWeeklyFreeze(user);

    const lastActive = user.streakData.lastActiveDate
        ? new Date(user.streakData.lastActiveDate)
        : null;

    if (!lastActive) {
        // First ever workout
        user.streakData.current = 1;
        user.streakData.longest = 1;
        user.streakData.lastActiveDate = now;
        user.streak = 1;
        return { streak: 1, isNew: true, freezeUsed: false };
    }

    const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const dayDiff = Math.round((today - lastActiveDay) / 86400000);

    let freezeUsed = false;

    if (dayDiff === 0) {
        // Already worked out today — no streak change
        return { streak: user.streakData.current, sameDay: true, freezeUsed: false };
    }

    if (dayDiff === 1) {
        // Consecutive day — increment
        user.streakData.current += 1;
    } else if (dayDiff === 2 && (user.streakData.freezesAvailable || 0) > 0) {
        // Missed 1 day — consume a freeze and preserve streak
        user.streakData.current += 1;
        user.streakData.freezesAvailable -= 1;
        user.streakData.graceUsedThisWeek = true;
        freezeUsed = true;
    } else {
        // Streak broken
        user.streakData.current = 1;
    }

    user.streakData.longest = Math.max(user.streakData.longest, user.streakData.current);
    user.streakData.lastActiveDate = now;
    user.streak = user.streakData.current;

    return {
        streak: user.streakData.current,
        longest: user.streakData.longest,
        freezeUsed,
    };
}

module.exports = { updateStreak, maybeResetWeeklyFreeze };
