# Level Up — Production Architecture Guide

> Solo-dev friendly. No overengineering. Works on ₹8K phones with Jio 4G.

---

## PHASE 1: CORE ARCHITECTURE

### 1.1 — Target Folder Structure

Evolve from the current flat structure. **Don't reorganize everything at once** — migrate file-by-file as you touch them.

```
server/
├── server.js                    # Entry point (keep as-is)
├── config/
│   ├── db.js                    # MongoDB connection (keep)
│   └── constants.js             # NEW: All magic numbers in one place
├── middleware/
│   ├── auth.js                  # JWT protect (keep)
│   └── validate.js              # NEW: Reusable validation middleware
├── models/
│   ├── User.js                  # Evolve schema (see below)
│   ├── Workout.js               # Keep
│   ├── Meal.js                  # Keep
│   ├── Progress.js              # Keep
│   ├── Quest.js                 # NEW: Daily/weekly quest definitions
│   └── Guild.js                 # NEW (Phase 2): Guild schema
├── routes/
│   ├── auth.js                  # Keep
│   ├── users.js                 # Keep
│   ├── workouts.js              # Keep
│   ├── meals.js                 # Keep
│   ├── progress.js              # Keep
│   ├── quests.js                # NEW: Quest routes
│   └── guilds.js                # NEW (Phase 2)
└── services/                    # NEW: Business logic out of routes
    ├── xpService.js             # XP calculation, awarding, decay
    ├── questService.js          # Quest generation, completion
    ├── streakService.js         # Streak logic, XP decay
    └── shareService.js          # Share card generation

client/src/
├── components/
│   ├── ui/index.jsx             # Keep shared UI
│   ├── NavBar.jsx               # Keep
│   ├── WeeklyChart.jsx          # Keep (Recharts)
│   ├── RankBadge.jsx            # Keep
│   ├── QuestCard.jsx            # NEW
│   ├── StreakFlame.jsx           # NEW: Animated streak display
│   └── ShareCard.jsx            # NEW: Canvas-based share card
├── pages/
│   ├── Dashboard.jsx            # Keep, add quest section
│   ├── Workout.jsx              # Keep
│   ├── Nutrition.jsx            # Keep
│   ├── Profile.jsx              # Keep
│   ├── Quests.jsx               # NEW: Full quest board
│   └── Guild.jsx                # NEW (Phase 2)
├── hooks/                       # NEW: Extract reusable logic
│   ├── useQuests.js
│   ├── useOfflineSync.js        # Phase 3
│   └── useShareCard.js
├── context/
│   ├── AuthContext.jsx           # Keep
│   └── DataCacheContext.jsx      # Keep (already solid)
└── services/
    └── api.js                    # Keep, add quest/guild endpoints
```

**Migration rule:** Only create a file when you're about to write code in it. No empty scaffolding.

---

### 1.2 — Database Schema Evolution

#### User Schema Additions

Add these fields to your existing `UserSchema` in `server/models/User.js`. Don't rewrite — just add the new fields.

```js
// Add to UserSchema (after existing fields)

// Streak v2 — supports XP decay
streakData: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date },        // More precise than lastWorkoutDate
    graceUsedThisWeek: { type: Boolean, default: false }, // One free miss/week
},

// Quest tracking (embedded — no extra collection needed initially)
activeQuests: [{
    questId: String,           // e.g., "burn_300", "log_3_meals"
    type: { type: String, enum: ['daily', 'weekly'] },
    title: String,
    target: Number,            // e.g., 300 (calories) or 3 (meals)
    progress: { type: Number, default: 0 },
    xpReward: Number,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    expiresAt: Date,           // Auto-expire daily quests at midnight IST
}],

// Analytics (lightweight — no external service needed)
analytics: {
    totalWorkouts: { type: Number, default: 0 },
    totalCaloriesBurned: { type: Number, default: 0 },
    totalMealsLogged: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    lastShareAt: Date,
    shareCount: { type: Number, default: 0 },
},

// Push notifications
pushSubscription: {
    endpoint: String,
    keys: {
        p256dh: String,
        auth: String,
    },
},
```

**Why embed quests in User?** You have < 10 active quests per user at any time. Embedding avoids an extra collection, extra query, and extra index. When you hit 10K+ users, you can extract to a separate collection — but not before.

#### Quest Template Collection (New Model)

```js
// server/models/Quest.js
const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
    questId: { type: String, unique: true },           // "burn_300"
    type: { type: String, enum: ['daily', 'weekly'] },
    category: { type: String, enum: ['workout', 'nutrition', 'streak', 'social'] },
    title: String,                                       // "Burn 300 Calories"
    description: String,                                 // "Complete workouts totaling 300+ cal"
    target: Number,
    xpReward: Number,
    icon: String,                                        // emoji or lucide icon name
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    // Conditions for when this quest can appear
    minRank: { type: String, default: 'E' },            // Don't show hard quests to beginners
    requiredStreak: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Quest', QuestSchema);
```

**Seed data** (run once):
```js
// server/seeds/quests.js
const quests = [
    // Daily quests — easy
    { questId: 'burn_200', type: 'daily', category: 'workout', title: 'Burn 200 Cal', target: 200, xpReward: 50, difficulty: 'easy', icon: '🔥' },
    { questId: 'log_meal', type: 'daily', category: 'nutrition', title: 'Log a Meal', target: 1, xpReward: 20, difficulty: 'easy', icon: '🍽️' },
    { questId: 'any_workout', type: 'daily', category: 'workout', title: 'Do Any Workout', target: 1, xpReward: 30, difficulty: 'easy', icon: '💪' },
    
    // Daily quests — medium
    { questId: 'burn_300', type: 'daily', category: 'workout', title: 'Burn 300 Cal', target: 300, xpReward: 80, difficulty: 'medium', icon: '🔥', minRank: 'D' },
    { questId: 'log_3_meals', type: 'daily', category: 'nutrition', title: 'Log 3 Meals', target: 3, xpReward: 60, difficulty: 'medium', icon: '🍽️' },
    { questId: 'burn_500', type: 'daily', category: 'workout', title: 'Burn 500 Cal', target: 500, xpReward: 120, difficulty: 'hard', icon: '💥', minRank: 'C' },

    // Weekly quests
    { questId: 'weekly_5_workouts', type: 'weekly', category: 'workout', title: '5 Workouts This Week', target: 5, xpReward: 200, difficulty: 'medium', icon: '📅' },
    { questId: 'weekly_burn_2000', type: 'weekly', category: 'workout', title: 'Burn 2000 Cal This Week', target: 2000, xpReward: 300, difficulty: 'hard', icon: '🏆', minRank: 'D' },
    { questId: 'weekly_streak_7', type: 'weekly', category: 'streak', title: '7-Day Streak', target: 7, xpReward: 500, difficulty: 'hard', icon: '🔥' },
];
```

---

### 1.3 — XP System (Rebuilt)

Extract XP logic from the Workout model pre-save hook into a dedicated service.

```js
// server/services/xpService.js

const RANK_THRESHOLDS = [
    { rank: 'E', minXp: 0, color: '#6b7280' },
    { rank: 'D', minXp: 1000, color: '#a855f7' },
    { rank: 'C', minXp: 2500, color: '#3b82f6' },
    { rank: 'B', minXp: 5000, color: '#22c55e' },
    { rank: 'A', minXp: 10000, color: '#eab308' },
    { rank: 'S', minXp: 20000, color: '#ef4444' },
    { rank: 'NATIONAL', minXp: 50000, color: '#f97316' },
];

/**
 * Calculate XP for a workout
 * Current formula: max(5, caloriesBurned / 2)
 * Enhanced: adds streak multiplier and first-workout-of-day bonus
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
    return quest.xpReward; // Flat reward from quest definition
}

/**
 * Apply XP decay for broken streaks
 * Lose 5% of XP per missed day, minimum 0
 * Grace period: 1 free miss per week
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
    const decayPercent = Math.min(0.25, missedDays * 0.05); // Cap at 25%
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
```

**How to integrate:** In your workout POST route (`server/routes/workouts.js`), replace the inline XP logic:

```js
// In POST /api/workouts handler, after workout.save()

const { calculateWorkoutXP, checkRankUp } = require('../services/xpService');

// Check if this is user's first workout today
const todayStart = new Date(); todayStart.setHours(0,0,0,0);
const workoutsToday = await Workout.countDocuments({ 
    userId: req.user.id, 
    date: { $gte: todayStart } 
});
const isFirstToday = workoutsToday <= 1; // Including the one just saved

const xpResult = calculateWorkoutXP(workout.caloriesBurned, user.streak, isFirstToday);
const oldXP = user.xp;
user.xp += xpResult.totalXP;
workout.xpEarned = xpResult.totalXP;

const rankUp = checkRankUp(oldXP, user.xp);

await Promise.all([user.save(), workout.save()]);

res.status(201).json({
    success: true,
    workout,
    xp: xpResult,                    // { baseXP, streakMultiplier, firstBonus, totalXP }
    rankUp: rankUp || undefined,     // "B" if ranked up, undefined if not
    user: { xp: user.xp, streak: user.streak, level: user.getLevel() },
});
```

---

### 1.4 — Streak System v2

```js
// server/services/streakService.js

/**
 * Update streak on workout completion
 * Called from POST /api/workouts
 */
function updateStreak(user) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActive = user.streakData?.lastActiveDate 
        ? new Date(user.streakData.lastActiveDate)
        : null;
    
    if (!lastActive) {
        // First ever workout
        user.streakData = { current: 1, longest: 1, lastActiveDate: now, graceUsedThisWeek: false };
        user.streak = 1; // Keep old field in sync
        return { streak: 1, isNew: true };
    }
    
    const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const dayDiff = Math.round((today - lastActiveDay) / 86400000);
    
    if (dayDiff === 0) {
        // Already worked out today — no streak change
        return { streak: user.streakData.current, sameDay: true };
    }
    
    if (dayDiff === 1) {
        // Consecutive day — increment
        user.streakData.current += 1;
        user.streakData.longest = Math.max(user.streakData.longest, user.streakData.current);
    } else if (dayDiff === 2 && !user.streakData.graceUsedThisWeek) {
        // Grace period — keep streak, mark grace used
        user.streakData.current += 1;
        user.streakData.graceUsedThisWeek = true;
        user.streakData.longest = Math.max(user.streakData.longest, user.streakData.current);
    } else {
        // Streak broken
        user.streakData.current = 1;
    }
    
    user.streakData.lastActiveDate = now;
    user.streak = user.streakData.current;
    
    // Reset grace flag on Mondays (IST)
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon
    if (dayOfWeek === 1) {
        user.streakData.graceUsedThisWeek = false;
    }
    
    return { 
        streak: user.streakData.current, 
        longest: user.streakData.longest,
        graceUsed: dayDiff === 2 
    };
}

module.exports = { updateStreak };
```

---

### 1.5 — Daily Quest Rotation System

```js
// server/services/questService.js
const Quest = require('../models/Quest');

const QUESTS_PER_DAY = 3;
const WEEKLY_QUESTS = 1;

/**
 * Generate daily quests for a user.
 * Called on first API hit of the day (lazy — no cron job needed).
 */
async function refreshQuests(user) {
    const now = new Date();
    
    // Check if quests are still valid
    const hasValidDailyQuests = user.activeQuests?.some(q => 
        q.type === 'daily' && q.expiresAt > now && !q.completed
    );
    
    if (hasValidDailyQuests) return user.activeQuests;
    
    // Clear expired quests, keep completed ones for history display today
    const completedToday = user.activeQuests?.filter(q => 
        q.completed && q.completedAt > new Date(now.getFullYear(), now.getMonth(), now.getDate())
    ) || [];
    
    // Fetch quest templates matching user's rank
    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S', 'NATIONAL'];
    const userRankIndex = rankOrder.indexOf(user.getLevel().rank);
    const eligibleRanks = rankOrder.slice(0, userRankIndex + 1);
    
    const questPool = await Quest.find({ 
        isActive: true, 
        minRank: { $in: eligibleRanks },
        type: 'daily',
    });
    
    // Weighted random selection: prefer medium difficulty
    const selected = weightedSample(questPool, QUESTS_PER_DAY);
    
    // Set expiry to midnight IST
    const midnightIST = new Date();
    midnightIST.setUTCHours(18, 30, 0, 0); // IST midnight = UTC 18:30 prev day
    if (midnightIST < now) midnightIST.setDate(midnightIST.getDate() + 1);
    
    const dailyQuests = selected.map(q => ({
        questId: q.questId,
        type: 'daily',
        title: q.title,
        target: q.target,
        progress: 0,
        xpReward: q.xpReward,
        completed: false,
        expiresAt: midnightIST,
    }));
    
    // Also refresh weekly quests on Monday
    let weeklyQuests = user.activeQuests?.filter(q => q.type === 'weekly' && q.expiresAt > now) || [];
    if (weeklyQuests.length === 0) {
        const weeklyPool = await Quest.find({ isActive: true, type: 'weekly', minRank: { $in: eligibleRanks } });
        const selectedWeekly = weightedSample(weeklyPool, WEEKLY_QUESTS);
        
        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay())); // Next Sunday
        endOfWeek.setUTCHours(18, 30, 0, 0);
        
        weeklyQuests = selectedWeekly.map(q => ({
            questId: q.questId,
            type: 'weekly',
            title: q.title,
            target: q.target,
            progress: 0,
            xpReward: q.xpReward,
            completed: false,
            expiresAt: endOfWeek,
        }));
    }
    
    user.activeQuests = [...completedToday, ...dailyQuests, ...weeklyQuests];
    await user.save();
    
    return user.activeQuests;
}

/**
 * Update quest progress when user completes an action
 * @param {string} category - 'workout' | 'nutrition' | 'streak'
 * @param {number} value - calories burned, meals logged, etc.
 */
async function updateQuestProgress(user, category, value) {
    if (!user.activeQuests?.length) return [];
    
    const completed = [];
    
    for (const quest of user.activeQuests) {
        if (quest.completed || quest.expiresAt < new Date()) continue;
        
        // Match quest to action
        if (shouldQuestProgress(quest, category, value)) {
            quest.progress = Math.min(quest.target, quest.progress + value);
            
            if (quest.progress >= quest.target) {
                quest.completed = true;
                quest.completedAt = new Date();
                user.xp += quest.xpReward;
                completed.push({ ...quest.toObject(), justCompleted: true });
            }
        }
    }
    
    if (completed.length > 0) {
        await user.save();
    }
    
    return completed;
}

function shouldQuestProgress(quest, category, value) {
    const mapping = {
        'burn_200': { category: 'workout', metric: 'calories' },
        'burn_300': { category: 'workout', metric: 'calories' },
        'burn_500': { category: 'workout', metric: 'calories' },
        'any_workout': { category: 'workout', metric: 'count' },
        'log_meal': { category: 'nutrition', metric: 'count' },
        'log_3_meals': { category: 'nutrition', metric: 'count' },
        'weekly_5_workouts': { category: 'workout', metric: 'count' },
        'weekly_burn_2000': { category: 'workout', metric: 'calories' },
    };
    
    const config = mapping[quest.questId];
    return config && config.category === category;
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
```

---

### 1.6 — Quest Routes

```js
// server/routes/quests.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { refreshQuests } = require('../services/questService');

router.use(protect);

/**
 * GET /api/quests — Get active quests (auto-refreshes if expired)
 */
router.get('/', async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        
        const quests = await refreshQuests(user);
        
        res.json({
            success: true,
            quests: quests.filter(q => q.expiresAt > new Date()),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load quests' });
    }
});

module.exports = router;
```

Wire into `server.js`:
```js
app.use('/api/quests', require('./routes/quests'));
```

---

### 1.7 — Web Push Notifications (Minimal Setup)

Install on server: `npm install web-push`

```js
// server/services/pushService.js
const webpush = require('web-push');

// Generate VAPID keys once: npx web-push generate-vapid-keys
// Store in .env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

async function sendPush(user, payload) {
    if (!user.pushSubscription?.endpoint) return;
    
    try {
        await webpush.sendNotification(
            user.pushSubscription,
            JSON.stringify(payload)
        );
    } catch (err) {
        if (err.statusCode === 410) {
            // Subscription expired — clear it
            user.pushSubscription = undefined;
            await user.save();
        }
    }
}

// Notification templates
const notifications = {
    streakReminder: (streak) => ({
        title: '🔥 Don\'t break your streak!',
        body: `You have a ${streak}-day streak. Log a workout to keep it!`,
        tag: 'streak-reminder',
    }),
    questExpiring: (quest) => ({
        title: '⏰ Quest expiring soon',
        body: `"${quest.title}" expires in 2 hours. ${quest.target - quest.progress} left!`,
        tag: 'quest-expiry',
    }),
    rankUp: (rank) => ({
        title: `⚡ RANK UP: ${rank}`,
        body: 'You just leveled up! Check your new rank.',
        tag: 'rank-up',
    }),
};

module.exports = { sendPush, notifications };
```

**Client-side subscription** (add to your PWA service worker registration):
```js
// client/src/services/pushSubscription.js
export async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    
    const registration = await navigator.serviceWorker.ready;
    
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) return subscription;
    
    subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    });
    
    // Send subscription to backend
    const { default: api } = await import('./api');
    await api.post('/users/push-subscribe', subscription.toJSON());
    
    return subscription;
}
```

---

### 1.8 — Share Card Generation (Canvas API)

No external libraries needed. Pure Canvas API.

```jsx
// client/src/hooks/useShareCard.js
import { useCallback } from 'react';

export function useShareCard() {
    const generateCard = useCallback(async (data) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
        gradient.addColorStop(0, '#0f172a');  // slate-900
        gradient.addColorStop(1, '#1e1b4b');  // indigo-950
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1080);
        
        // Grid pattern overlay
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 1080; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1080); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke();
        }
        
        // App branding
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Inter, system-ui, sans-serif';
        ctx.fillText('LEVEL UP', 60, 80);
        
        // Rank badge
        ctx.font = 'bold italic 160px Inter, system-ui, sans-serif';
        ctx.fillStyle = data.rankColor || '#3b82f6';
        ctx.textAlign = 'center';
        ctx.fillText(data.rank, 540, 350);
        
        // Username
        ctx.font = 'bold 48px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(data.username, 540, 440);
        
        // Stats grid
        const stats = [
            { label: 'STREAK', value: `${data.streak}🔥`, y: 560 },
            { label: 'XP', value: data.xp.toLocaleString(), y: 660 },
            { label: 'CALORIES BURNED', value: data.caloriesBurned.toLocaleString(), y: 760 },
            { label: 'WORKOUTS', value: data.totalWorkouts.toString(), y: 860 },
        ];
        
        stats.forEach(s => {
            ctx.font = '24px Inter, system-ui, sans-serif';
            ctx.fillStyle = '#94a3b8'; // slate-400
            ctx.fillText(s.label, 540, s.y);
            ctx.font = 'bold 44px Inter, system-ui, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.fillText(s.value, 540, s.y + 50);
        });
        
        // Footer
        ctx.font = '20px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('levelup.fitness', 540, 1040);
        
        // Convert to blob
        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), 'image/png', 0.9);
        });
    }, []);
    
    const share = useCallback(async (data) => {
        const blob = await generateCard(data);
        const file = new File([blob], 'levelup-stats.png', { type: 'image/png' });
        
        if (navigator.canShare?.({ files: [file] })) {
            // Native share (mobile)
            await navigator.share({
                title: 'My Level Up Stats',
                text: `I'm Rank ${data.rank} with a ${data.streak}-day streak! 💪`,
                files: [file],
            });
        } else {
            // Fallback: download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'levelup-stats.png'; a.click();
            URL.revokeObjectURL(url);
        }
    }, [generateCard]);
    
    return { generateCard, share };
}
```

---

### 1.9 — Analytics Tracking (Lightweight, Server-Side)

No external analytics. Just increment counters on your User model. Add this to each route's success handler:

```js
// Add to POST /api/workouts handler (after saving workout)
user.analytics.totalWorkouts += 1;
user.analytics.totalCaloriesBurned += workout.caloriesBurned;
// save happens with the existing user.save() call

// Add to POST /api/meals handler
user.analytics.totalMealsLogged += 1;
```

For aggregate analytics (if you ever want a dashboard for yourself):
```js
// server/routes/users.js — add admin route
router.get('/admin/stats', protect, async (req, res) => {
    // TODO: Add admin check
    const [totalUsers, activeToday, avgXP] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ 'streakData.lastActiveDate': { $gte: new Date(Date.now() - 86400000) } }),
        User.aggregate([{ $group: { _id: null, avg: { $avg: '$xp' } } }]),
    ]);
    
    res.json({ totalUsers, activeToday, avgXP: avgXP[0]?.avg || 0 });
});
```

---

## PHASE 2: FEATURE IMPLEMENTATION

### 2.1 — Daily Quest Generator (Integrated Flow)

The quest system is already defined in Phase 1. Here's how it plugs into the existing workout flow:

```js
// In POST /api/workouts handler, after XP calculation:

const { updateQuestProgress, refreshQuests } = require('../services/questService');

// Ensure quests are active
await refreshQuests(user);

// Update quest progress
const completedQuests = await updateQuestProgress(
    user, 
    'workout', 
    workout.caloriesBurned // or 1 for count-based quests
);

// Also update count-based quests
if (completedQuests.length === 0) {
    const countQuests = await updateQuestProgress(user, 'workout', 1);
    completedQuests.push(...countQuests);
}

// Include in response
res.status(201).json({
    success: true,
    workout,
    xp: xpResult,
    rankUp: rankUp || undefined,
    questsCompleted: completedQuests,  // Frontend shows celebration
    user: { xp: user.xp, streak: user.streak, level: user.getLevel() },
});
```

Same for meals:
```js
// In POST /api/meals handler
const { updateQuestProgress, refreshQuests } = require('../services/questService');
await refreshQuests(user);
const completedQuests = await updateQuestProgress(user, 'nutrition', 1);
```

---

### 2.2 — Quest Card Component

```jsx
// client/src/components/QuestCard.jsx
import { Zap, Check, Clock } from 'lucide-react';

export default function QuestCard({ quest, compact = false }) {
    const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);
    const isExpiringSoon = quest.expiresAt && (new Date(quest.expiresAt) - Date.now()) < 7200000; // 2h
    
    if (compact) {
        return (
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
                quest.completed ? 'bg-green-500/10 border border-green-500/20' : 'bg-zinc-800/50'
            }`}>
                <span className="text-xl">{quest.icon || '⚡'}</span>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${quest.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                        {quest.title}
                    </p>
                    {!quest.completed && (
                        <div className="mt-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" 
                                 style={{ width: `${progressPercent}%` }} />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold shrink-0">
                    <Zap size={12} />
                    {quest.xpReward}
                </div>
            </div>
        );
    }
    
    return (
        <div className={`relative p-4 rounded-2xl border transition-all ${
            quest.completed 
                ? 'bg-green-500/5 border-green-500/20' 
                : isExpiringSoon
                    ? 'bg-orange-500/5 border-orange-500/20'
                    : 'bg-zinc-900/50 border-zinc-800'
        }`}>
            {isExpiringSoon && !quest.completed && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-orange-400 text-xs">
                    <Clock size={12} />
                    <span>Expiring</span>
                </div>
            )}
            
            <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">{quest.icon || '⚡'}</span>
                <div className="flex-1">
                    <h4 className={`font-semibold ${quest.completed ? 'text-green-400' : 'text-white'}`}>
                        {quest.title}
                    </h4>
                    <p className="text-sm text-zinc-400 mt-1">
                        {quest.completed ? 'Completed!' : `${quest.progress} / ${quest.target}`}
                    </p>
                    
                    {!quest.completed && (
                        <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                                 style={{ width: `${progressPercent}%` }} />
                        </div>
                    )}
                </div>
                
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${
                    quest.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                    {quest.completed ? <Check size={14} /> : <Zap size={14} />}
                    {quest.xpReward} XP
                </div>
            </div>
        </div>
    );
}
```

---

### 2.3 — Guild System (MVP)

Keep it dead simple: a guild is a group of friends who share XP totals.

```js
// server/models/Guild.js
const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 30, trim: true },
    code: { type: String, unique: true },    // 6-char join code
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
    }],
    totalXP: { type: Number, default: 0 },  // Sum of all member XP earned while in guild
    weeklyXP: { type: Number, default: 0 }, // Resets Monday
    maxMembers: { type: Number, default: 10 },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Generate join code
GuildSchema.pre('save', function(next) {
    if (!this.code) {
        this.code = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

// Index for leaderboard
GuildSchema.index({ weeklyXP: -1 });

module.exports = mongoose.model('Guild', GuildSchema);
```

```js
// server/routes/guilds.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Guild = require('../models/Guild');
const User = require('../models/User');

router.use(protect);

// Create guild
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.length < 2) return res.status(400).json({ message: 'Name required (2+ chars)' });
        
        // Check user isn't already in a guild
        const existing = await Guild.findOne({ 'members.user': req.user.id });
        if (existing) return res.status(400).json({ message: 'Already in a guild' });
        
        const guild = new Guild({
            name,
            leader: req.user.id,
            members: [{ user: req.user.id }],
        });
        await guild.save();
        
        res.status(201).json({ success: true, guild });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create guild' });
    }
});

// Join guild by code
router.post('/join/:code', async (req, res) => {
    try {
        const guild = await Guild.findOne({ code: req.params.code.toUpperCase() });
        if (!guild) return res.status(404).json({ message: 'Guild not found' });
        if (guild.members.length >= guild.maxMembers) return res.status(400).json({ message: 'Guild is full' });
        
        const alreadyMember = guild.members.some(m => m.user.toString() === req.user.id);
        if (alreadyMember) return res.status(400).json({ message: 'Already a member' });
        
        const inOther = await Guild.findOne({ 'members.user': req.user.id });
        if (inOther) return res.status(400).json({ message: 'Leave your current guild first' });
        
        guild.members.push({ user: req.user.id });
        await guild.save();
        
        res.json({ success: true, guild });
    } catch (err) {
        res.status(500).json({ message: 'Failed to join guild' });
    }
});

// Get my guild
router.get('/mine', async (req, res) => {
    try {
        const guild = await Guild.findOne({ 'members.user': req.user.id })
            .populate('members.user', 'username xp streak profilePicture')
            .populate('leader', 'username');
        
        if (!guild) return res.json({ success: true, guild: null });
        
        // Sort members by XP
        guild.members.sort((a, b) => (b.user?.xp || 0) - (a.user?.xp || 0));
        
        res.json({ success: true, guild });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch guild' });
    }
});

// Guild leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const guilds = await Guild.find()
            .sort({ weeklyXP: -1 })
            .limit(10)
            .select('name weeklyXP totalXP members code');
        
        res.json({
            success: true,
            guilds: guilds.map(g => ({
                name: g.name,
                weeklyXP: g.weeklyXP,
                totalXP: g.totalXP,
                memberCount: g.members.length,
            })),
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
});

// Leave guild
router.post('/leave', async (req, res) => {
    try {
        const guild = await Guild.findOne({ 'members.user': req.user.id });
        if (!guild) return res.status(404).json({ message: 'Not in a guild' });
        
        // If leader, transfer to next member or delete
        if (guild.leader.toString() === req.user.id) {
            if (guild.members.length <= 1) {
                await Guild.deleteOne({ _id: guild._id });
                return res.json({ success: true, message: 'Guild disbanded' });
            }
            const newLeader = guild.members.find(m => m.user.toString() !== req.user.id);
            guild.leader = newLeader.user;
        }
        
        guild.members = guild.members.filter(m => m.user.toString() !== req.user.id);
        await guild.save();
        
        res.json({ success: true, message: 'Left guild' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to leave guild' });
    }
});

module.exports = router;
```

**Guild XP tracking:** When a user earns XP (workout/quest), also update their guild:
```js
// Add after user.xp += xpResult.totalXP in workout POST handler
const Guild = require('../models/Guild');
const guild = await Guild.findOne({ 'members.user': req.user.id });
if (guild) {
    guild.totalXP += xpResult.totalXP;
    guild.weeklyXP += xpResult.totalXP;
    await guild.save();
}
```

---

### 2.4 — Quick Log Feature

One-tap workout logging from the dashboard:

```jsx
// Add to Dashboard.jsx — Quick Log section
const QUICK_LOG_PRESETS = [
    { type: 'walking', duration: 30, intensity: 'moderate', label: '30min Walk', icon: '🚶' },
    { type: 'running', duration: 20, intensity: 'high', label: '20min Run', icon: '🏃' },
    { type: 'pushups', reps: 25, sets: 3, intensity: 'moderate', label: '25 Push-ups ×3', icon: '💪' },
    { type: 'yoga', duration: 30, intensity: 'low', label: '30min Yoga', icon: '🧘' },
];

function QuickLog({ onLog, loading }) {
    return (
        <div className="grid grid-cols-2 gap-2">
            {QUICK_LOG_PRESETS.map(preset => (
                <button
                    key={preset.type}
                    onClick={() => onLog(preset)}
                    disabled={loading}
                    className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-left 
                               hover:border-blue-500/30 hover:bg-blue-500/5 transition-all active:scale-95"
                >
                    <span className="text-xl">{preset.icon}</span>
                    <p className="text-sm font-medium text-white mt-1">{preset.label}</p>
                </button>
            ))}
        </div>
    );
}
```

---

### 2.5 — Offline Sync (Simple Queue)

```js
// client/src/hooks/useOfflineSync.js
import { useCallback, useEffect, useRef } from 'react';

const QUEUE_KEY = 'levelup_offline_queue';

export function useOfflineSync() {
    const processing = useRef(false);
    
    // Add action to offline queue
    const enqueue = useCallback((action) => {
        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        queue.push({
            ...action,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            timestamp: Date.now(),
        });
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }, []);
    
    // Process queue when online
    const processQueue = useCallback(async (api) => {
        if (processing.current) return;
        processing.current = true;
        
        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        if (queue.length === 0) { processing.current = false; return; }
        
        const remaining = [];
        
        for (const action of queue) {
            try {
                switch (action.type) {
                    case 'workout':
                        await api.post('/workouts', action.data);
                        break;
                    case 'meal':
                        await api.post('/meals', action.data);
                        break;
                }
            } catch (err) {
                if (err.response?.status < 500) {
                    // Client error — drop it
                    console.warn('Dropping failed offline action:', action);
                } else {
                    // Server error — retry later
                    remaining.push(action);
                }
            }
        }
        
        localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
        processing.current = false;
        
        return queue.length - remaining.length; // Number synced
    }, []);
    
    // Auto-sync when coming online
    useEffect(() => {
        const handler = () => processQueue();
        window.addEventListener('online', handler);
        return () => window.removeEventListener('online', handler);
    }, [processQueue]);
    
    const queueSize = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]').length;
    
    return { enqueue, processQueue, queueSize, isOnline: navigator.onLine };
}
```

Usage in Workout page:
```js
const { enqueue, isOnline } = useOfflineSync();

async function handleSubmitWorkout() {
    const workoutData = { type, duration, intensity, ... };
    
    if (!isOnline) {
        enqueue({ type: 'workout', data: workoutData });
        showToast('Saved offline — will sync when connected');
        return;
    }
    
    // Normal API call
    await workoutAPI.create(workoutData);
}
```

---

## PHASE 3: PERFORMANCE OPTIMIZATION

### 3.1 — Bundle Size Audit

Current heavy dependencies:
| Package | Size (est.) | Action |
|---------|------------|--------|
| `three` | ~600KB | **Remove** — replace BodyVisualizer with CSS/SVG |
| `@react-three/fiber` | ~200KB | **Remove** with three |
| `@react-three/drei` | ~400KB | **Remove** with three |
| `recharts` | ~180KB | **Keep** (lazy load) |
| `react-router-dom` | ~30KB | Keep |
| `axios` | ~14KB | Keep (or replace with native `fetch`) |
| `lucide-react` | Tree-shakes | Keep |

**Removing Three.js saves ~1.2MB** from your bundle. On slow 4G (1Mbps), that's 10 extra seconds of load time.

Replace `BodyVisualizer` with a simple SVG body outline:

```jsx
// client/src/components/BodyVisualizer.jsx — lean replacement
export default function BodyVisualizer({ weight, height, bodyFat, gender }) {
    const bmi = weight / ((height / 100) ** 2);
    
    // Simple visual with CSS
    return (
        <div className="flex flex-col items-center py-6">
            <div className="relative">
                {/* Body silhouette — just an SVG */}
                <svg viewBox="0 0 120 200" className="w-24 h-36 text-blue-500/20 fill-current">
                    <ellipse cx="60" cy="30" rx="20" ry="25" />
                    <rect x="35" y="55" width="50" height="70" rx="15" />
                    <rect x="20" y="60" width="15" height="55" rx="7" />
                    <rect x="85" y="60" width="15" height="55" rx="7" />
                    <rect x="38" y="125" width="18" height="60" rx="8" />
                    <rect x="64" y="125" width="18" height="60" rx="8" />
                </svg>
                
                {/* Pulse effect */}
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
            </div>
            
            <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-white">{weight} <span className="text-sm text-zinc-400">kg</span></p>
                <p className="text-sm text-zinc-500">BMI: {bmi.toFixed(1)}</p>
            </div>
        </div>
    );
}
```

---

### 3.2 — Lazy Loading

```jsx
// client/src/App.jsx — add lazy loading
import { lazy, Suspense } from 'react';
import { LoadingScreen } from './components/ui';

// Eager load: Login, Register (first screens users see)
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy load: everything behind auth
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workout = lazy(() => import('./pages/Workout'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Profile = lazy(() => import('./pages/Profile'));

// In your route config:
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return isAuthenticated ? (
        <Suspense fallback={<LoadingScreen />}>
            {children}
        </Suspense>
    ) : <Navigate to="/login" />;
}
```

---

### 3.3 — Service Worker Caching Strategy

Update your `vite.config.js` PWA config:

```js
// client/vite.config.js — PWA plugin config
VitePWA({
    registerType: 'autoUpdate',
    workbox: {
        // Cache API responses with stale-while-revalidate
        runtimeCaching: [
            {
                // Cache API GET responses (stats, types, etc.)
                urlPattern: /\/api\/(users\/stats|workouts\/types|meals\/common)/,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'api-cache',
                    expiration: { maxEntries: 20, maxAgeSeconds: 3600 }, // 1 hour
                },
            },
            {
                // Cache fonts
                urlPattern: /\.(woff2?|ttf|otf)$/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'font-cache',
                    expiration: { maxEntries: 10, maxAgeSeconds: 31536000 }, // 1 year
                },
            },
            {
                // Cache images/avatars
                urlPattern: /\.(png|jpg|jpeg|svg|webp)$/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'image-cache',
                    expiration: { maxEntries: 50, maxAgeSeconds: 604800 }, // 1 week
                },
            },
        ],
        // Precache app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    },
    manifest: {
        name: 'Level Up',
        short_name: 'LevelUp',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
    },
})
```

---

### 3.4 — Re-render Prevention

Your `DataCacheContext` already prevents wasteful fetches. Add these improvements:

```jsx
// 1. Memoize expensive dashboard computations
// In Dashboard.jsx

import { useMemo } from 'react';

// Instead of computing inline:
const weeklyChartData = useMemo(() => {
    if (!stats?.weeklyData) return [];
    return stats.weeklyData.map(d => ({
        day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(d._id).getDay()],
        burn: d.burned || 0,
    }));
}, [stats?.weeklyData]);

// 2. Prevent QuestCard re-renders
// Wrap with React.memo since quests only change on completion
import { memo } from 'react';

const QuestCard = memo(function QuestCard({ quest, compact }) {
    // ... component code
});

// 3. Debounce profile form saves
// In Profile.jsx — instead of saving on every slider change
const saveTimeoutRef = useRef(null);

function handleFieldChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
        saveProfile({ [field]: value });
    }, 800); // Save 800ms after last change
}
```

---

### 3.5 — Image Optimization

Your current profile picture system encodes base64 strings into MongoDB — this works but is inefficient. For now, keep it simple:

```js
// Improve existing Profile.jsx image resize
function resizeImage(file, maxSize = 150, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = maxSize;
                canvas.height = maxSize;
                const ctx = canvas.getContext('2d');
                
                // Center crop to square
                const minDim = Math.min(img.width, img.height);
                const sx = (img.width - minDim) / 2;
                const sy = (img.height - minDim) / 2;
                ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);
                
                resolve(canvas.toDataURL('image/webp', quality)); // WebP is 30% smaller
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
```

**Future (when you have budget):** Move profile pictures to Cloudinary free tier (25GB) or UploadThing.

---

### 3.6 — API Response Compression Check

Already have `compression()` middleware. Verify it's working:

```js
// In server.js — ensure compression is before routes
app.use(compression({ 
    threshold: 1024,  // Only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));
```

Add `lean()` to Mongoose queries that return JSON (skip Mongoose document overhead):

```js
// Example: In GET /api/workouts
const workouts = await Workout.find(filter)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();  // Returns plain objects, ~3x faster

// In GET /api/users/leaderboard
const users = await User.find()
    .sort({ xp: -1 })
    .limit(10)
    .select('username xp streak profilePicture')
    .lean();
```

---

## PHASE 4: FUTURE SCALABILITY

### 4.1 — Razorpay Subscription Integration

Install: `npm install razorpay` (server only)

```js
// server/config/constants.js
module.exports = {
    PLANS: {
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
            priceMonthly: 99,    // ₹99/month
            priceYearly: 799,    // ₹799/year (~₹67/month)
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
    },
};
```

```js
// server/routes/payments.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.use(protect);

// Create subscription
router.post('/subscribe', async (req, res) => {
    try {
        const { planId } = req.body; // razorpay plan ID
        
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 12, // Max 12 billing cycles
            notes: { userId: req.user.id },
        });
        
        res.json({ 
            success: true, 
            subscriptionId: subscription.id,
            shortUrl: subscription.short_url, // Razorpay hosted checkout
        });
    } catch (err) {
        console.error('Razorpay error:', err);
        res.status(500).json({ message: 'Payment setup failed' });
    }
});

// Verify payment webhook (called by Razorpay)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(req.body)
        .digest('hex');
    
    if (signature !== expectedSignature) {
        return res.status(400).json({ message: 'Invalid signature' });
    }
    
    const event = JSON.parse(req.body);
    
    switch (event.event) {
        case 'subscription.activated':
        case 'subscription.charged': {
            const userId = event.payload.subscription.entity.notes?.userId;
            if (userId) {
                await User.findByIdAndUpdate(userId, {
                    'subscription.plan': 'pro',
                    'subscription.razorpayId': event.payload.subscription.entity.id,
                    'subscription.status': 'active',
                    'subscription.currentPeriodEnd': new Date(event.payload.subscription.entity.current_end * 1000),
                });
            }
            break;
        }
        case 'subscription.cancelled':
        case 'subscription.completed': {
            const userId = event.payload.subscription.entity.notes?.userId;
            if (userId) {
                await User.findByIdAndUpdate(userId, {
                    'subscription.status': 'cancelled',
                    // Don't downgrade immediately — let them use until period end
                });
            }
            break;
        }
    }
    
    res.json({ received: true });
});

module.exports = router;
```

**User schema addition for subscriptions:**
```js
// Add to UserSchema
subscription: {
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    razorpayId: String,
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'expired' },
    currentPeriodEnd: Date,
},
```

**Middleware to check plan limits:**
```js
// server/middleware/planLimit.js
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
        const todayStart = new Date(); todayStart.setHours(0,0,0,0);
        
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
```

---

### 4.2 — Guild Wars (Future Feature Scaffold)

Don't build this yet. When you're ready, here's the schema:

```js
// Concept: Weekly guild vs guild challenges
// Only build when you have 50+ active guilds

const GuildWarSchema = new mongoose.Schema({
    week: { type: String },              // "2025-W03"
    guild1: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
    guild2: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
    guild1XP: { type: Number, default: 0 },
    guild2XP: { type: Number, default: 0 },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
});
```

---

### 4.3 — Boss Fights (Solo Challenges)

Concept: Weekly "boss" with a collective XP target.

```js
// Don't build until you have 100+ WAU
// Concept schema:
const BossSchema = new mongoose.Schema({
    name: String,           // "The Iron Giant"
    description: String,
    targetXP: Number,       // 50,000 XP to defeat
    currentXP: Number,      // Community progress
    image: String,          // SVG or URL
    rewards: {
        xpBonus: Number,    // Bonus XP for each participant
        badge: String,      // Special badge name
    },
    startsAt: Date,
    endsAt: Date,
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    defeated: { type: Boolean, default: false },
});
```

---

### 4.4 — Native App Wrapper (When Ready)

Use **Capacitor** (from the Ionic team). It wraps your existing web app into a native container. No rewrite needed.

```bash
# When you're ready (not now):
npm install @capacitor/core @capacitor/cli
npx cap init "Level Up" com.levelup.fitness
npx cap add android

# Build web app, then sync
npm run build
npx cap sync
npx cap open android  # Opens in Android Studio
```

Capacitor gives you:
- Native push notifications (replace web-push)
- App Store deployment
- Splash screens and native UI elements
- Access to device sensors (step counter via Health Connect)

**Don't do this until you have 500+ weekly actives.** The PWA is enough for now.

---

### 4.5 — Analytics Dashboard (For You, The Founder)

Simple admin page — don't overthink it.

```js
// server/routes/admin.js — protect with a simple token check
router.get('/dashboard', async (req, res) => {
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const now = new Date();
    const dayAgo = new Date(now - 86400000);
    const weekAgo = new Date(now - 604800000);
    const monthAgo = new Date(now - 2592000000);
    
    const [
        totalUsers,
        dau,       // Daily Active Users
        wau,       // Weekly Active Users
        mau,       // Monthly Active Users
        totalWorkouts,
        todayWorkouts,
        avgStreak,
        topRanks,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ 'streakData.lastActiveDate': { $gte: dayAgo } }),
        User.countDocuments({ 'streakData.lastActiveDate': { $gte: weekAgo } }),
        User.countDocuments({ 'streakData.lastActiveDate': { $gte: monthAgo } }),
        Workout.countDocuments(),
        Workout.countDocuments({ date: { $gte: dayAgo } }),
        User.aggregate([{ $group: { _id: null, avg: { $avg: '$streak' } } }]),
        User.aggregate([
            { $group: { _id: '$xp', count: { $sum: 1 } } },
            // ... group by rank tiers
        ]),
    ]);
    
    res.json({
        users: { total: totalUsers, dau, wau, mau },
        engagement: { totalWorkouts, todayWorkouts, avgStreak: avgStreak[0]?.avg || 0 },
        retention: { dau_mau: mau > 0 ? (dau / mau * 100).toFixed(1) : 0 },
    });
});
```

---

## Implementation Priority / Roadmap

| Week | What to Build | Why |
|------|--------------|-----|
| **1** | Remove Three.js, add lazy loading, `.lean()` queries | Halves load time on low-end phones |
| **2** | Extract XP/Streak services, Quest model + seed data | Clean foundation for all gamification |
| **3** | Quest routes + QuestCard component + dashboard integration | The "aha moment" feature |
| **4** | Share card (Canvas API) + Web Push notifications | Growth engine — users share results |
| **5** | Offline sync queue + service worker caching | Retention on unreliable networks |
| **6** | Guild system (create, join, leaderboard) | Social retention loop |
| **7** | Quick log + UX polish + bug fixes | Reduce friction, increase DAU |
| **8** | Razorpay integration + plan limits | Monetization |

**Don't build Guild Wars, Boss Fights, or native wrapper until you have traction (100+ WAU).**

---

## Key Principles

1. **One MongoDB `User.save()` per request** — batch all mutations
2. **No cron jobs** — use lazy evaluation (check on first request of the day)
3. **Every new feature goes behind a plan check** — easy to monetize later
4. **Embed vs. Reference**: < 100 items? Embed in User doc. > 100? Separate collection.
5. **Test on a ₹8K phone with Jio sim** — if it's fast there, it's fast everywhere
6. **Ship weekly** — one feature per week, deployed Friday, observe weekend usage
