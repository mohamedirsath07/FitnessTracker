/**
 * Seed quest templates into the database.
 * Run once: node seeds/quests.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Quest = require('../models/Quest');

const quests = [
    // =============================================
    // DAILY QUESTS — EASY (7)
    // =============================================
    { questId: 'burn_100', type: 'daily', category: 'workout', title: 'Light Burn', description: 'Burn 100+ calories through workouts', target: 100, xpReward: 25, difficulty: 'easy', icon: '🔥', minRank: 'E' },
    { questId: 'burn_200', type: 'daily', category: 'workout', title: 'Burn 200 Cal', description: 'Burn 200+ calories through workouts', target: 200, xpReward: 50, difficulty: 'easy', icon: '🔥', minRank: 'E' },
    { questId: 'any_workout', type: 'daily', category: 'workout', title: 'Do Any Workout', description: 'Complete at least one workout', target: 1, xpReward: 30, difficulty: 'easy', icon: '💪', minRank: 'E' },
    { questId: 'two_workouts', type: 'daily', category: 'workout', title: 'Double Session', description: 'Complete 2 separate workouts today', target: 2, xpReward: 50, difficulty: 'easy', icon: '💪', minRank: 'D' },
    { questId: 'log_meal', type: 'daily', category: 'nutrition', title: 'Log a Meal', description: 'Log at least one meal today', target: 1, xpReward: 20, difficulty: 'easy', icon: '🍽️', minRank: 'E' },
    { questId: 'log_2_meals', type: 'daily', category: 'nutrition', title: 'Log 2 Meals', description: 'Log at least 2 meals today', target: 2, xpReward: 35, difficulty: 'easy', icon: '🍽️', minRank: 'E' },
    { questId: 'log_3_meals', type: 'daily', category: 'nutrition', title: 'Log 3 Meals', description: 'Log at least 3 meals today', target: 3, xpReward: 50, difficulty: 'easy', icon: '🍽️', minRank: 'E' },

    // =============================================
    // DAILY QUESTS — MEDIUM (8)
    // =============================================
    { questId: 'burn_250', type: 'daily', category: 'workout', title: 'Quarter K Burn', description: 'Burn 250+ calories through workouts', target: 250, xpReward: 60, difficulty: 'medium', icon: '🔥', minRank: 'D' },
    { questId: 'burn_300', type: 'daily', category: 'workout', title: 'Burn 300 Cal', description: 'Burn 300+ calories through workouts', target: 300, xpReward: 75, difficulty: 'medium', icon: '🔥', minRank: 'D' },
    { questId: 'burn_400', type: 'daily', category: 'workout', title: 'Burn 400 Cal', description: 'Burn 400+ calories through intense effort', target: 400, xpReward: 90, difficulty: 'medium', icon: '🔥', minRank: 'C' },
    { questId: 'three_workouts', type: 'daily', category: 'workout', title: 'Triple Threat', description: 'Complete 3 separate workouts today', target: 3, xpReward: 70, difficulty: 'medium', icon: '💪', minRank: 'C' },
    { questId: 'four_workouts', type: 'daily', category: 'workout', title: 'Quad Session', description: 'Complete 4 separate workouts today', target: 4, xpReward: 85, difficulty: 'medium', icon: '💪', minRank: 'B' },
    { questId: 'log_4_meals', type: 'daily', category: 'nutrition', title: 'Full Day Tracking', description: 'Log 4 meals throughout the day', target: 4, xpReward: 65, difficulty: 'medium', icon: '🍽️', minRank: 'D' },
    { questId: 'log_5_meals', type: 'daily', category: 'nutrition', title: 'Nutrition Master', description: 'Log 5 meals with full tracking', target: 5, xpReward: 80, difficulty: 'medium', icon: '🍽️', minRank: 'C' },
    { questId: 'log_6_meals', type: 'daily', category: 'nutrition', title: 'Full Fuel Day', description: 'Log 6 meals — every 3 hours', target: 6, xpReward: 90, difficulty: 'medium', icon: '🍽️', minRank: 'B' },

    // =============================================
    // DAILY QUESTS — HARD (6)
    // =============================================
    { questId: 'burn_500', type: 'daily', category: 'workout', title: 'Burn 500 Cal', description: 'Burn 500+ calories through intense workouts', target: 500, xpReward: 120, difficulty: 'hard', icon: '💥', minRank: 'C' },
    { questId: 'burn_600', type: 'daily', category: 'workout', title: 'Burn 600 Cal', description: 'Burn 600+ calories — serious grind', target: 600, xpReward: 140, difficulty: 'hard', icon: '💥', minRank: 'B' },
    { questId: 'burn_750', type: 'daily', category: 'workout', title: 'Inferno', description: 'Burn 750+ calories in a single day', target: 750, xpReward: 150, difficulty: 'hard', icon: '💥', minRank: 'A' },
    { questId: 'five_workouts', type: 'daily', category: 'workout', title: 'Iron Day', description: 'Complete 5 separate workouts in one day', target: 5, xpReward: 130, difficulty: 'hard', icon: '💥', minRank: 'A' },
    { questId: 'six_workouts', type: 'daily', category: 'workout', title: 'Beast Mode', description: 'Complete 6 separate workouts in one day', target: 6, xpReward: 150, difficulty: 'hard', icon: '💥', minRank: 'A' },
    { questId: 'log_7_meals', type: 'daily', category: 'nutrition', title: 'Meal Prep Pro', description: 'Log 7 meals — full bodybuilder schedule', target: 7, xpReward: 120, difficulty: 'hard', icon: '🍽️', minRank: 'B' },

    // =============================================
    // WEEKLY QUESTS — EASY (8)
    // =============================================
    { questId: 'weekly_2_workouts', type: 'weekly', category: 'workout', title: '2 Workouts This Week', description: 'Complete at least 2 workouts this week', target: 2, xpReward: 60, difficulty: 'easy', icon: '📅', minRank: 'E' },
    { questId: 'weekly_3_workouts', type: 'weekly', category: 'workout', title: '3 Workouts This Week', description: 'Complete 3 workouts in a single week', target: 3, xpReward: 100, difficulty: 'easy', icon: '📅', minRank: 'E' },
    { questId: 'weekly_4_workouts', type: 'weekly', category: 'workout', title: '4 Workouts This Week', description: 'Complete 4 workouts in a single week', target: 4, xpReward: 120, difficulty: 'easy', icon: '📅', minRank: 'D' },
    { questId: 'weekly_burn_1000', type: 'weekly', category: 'workout', title: 'Burn 1K This Week', description: 'Burn 1000+ total calories this week', target: 1000, xpReward: 100, difficulty: 'easy', icon: '📅', minRank: 'E' },
    { questId: 'weekly_5_meals', type: 'weekly', category: 'nutrition', title: 'Log 5 Meals This Week', description: 'Log at least 5 meals throughout the week', target: 5, xpReward: 70, difficulty: 'easy', icon: '📅', minRank: 'E' },
    { questId: 'weekly_7_meals', type: 'weekly', category: 'nutrition', title: 'Log 7 Meals This Week', description: 'Log a meal every day this week', target: 7, xpReward: 90, difficulty: 'easy', icon: '📅', minRank: 'E' },
    { questId: 'weekly_10_meals', type: 'weekly', category: 'nutrition', title: 'Log 10 Meals This Week', description: 'Log 10 meals across the week', target: 10, xpReward: 110, difficulty: 'easy', icon: '📅', minRank: 'D' },
    { questId: 'weekly_streak_3', type: 'weekly', category: 'streak', title: '3-Day Streak', description: 'Maintain a 3-day workout streak', target: 3, xpReward: 100, difficulty: 'easy', icon: '🔥', minRank: 'E' },

    // =============================================
    // WEEKLY QUESTS — MEDIUM (8)
    // =============================================
    { questId: 'weekly_5_workouts', type: 'weekly', category: 'workout', title: '5 Workouts This Week', description: 'Complete 5 workouts in a single week', target: 5, xpReward: 160, difficulty: 'medium', icon: '📅', minRank: 'E' },
    { questId: 'weekly_6_workouts', type: 'weekly', category: 'workout', title: '6 Workouts This Week', description: 'Complete 6 workouts in a single week', target: 6, xpReward: 200, difficulty: 'medium', icon: '📅', minRank: 'C' },
    { questId: 'weekly_burn_1500', type: 'weekly', category: 'workout', title: 'Burn 1.5K This Week', description: 'Burn 1500+ total calories this week', target: 1500, xpReward: 150, difficulty: 'medium', icon: '🏆', minRank: 'D' },
    { questId: 'weekly_burn_2000', type: 'weekly', category: 'workout', title: 'Burn 2K This Week', description: 'Burn 2000+ total calories this week', target: 2000, xpReward: 200, difficulty: 'medium', icon: '🏆', minRank: 'D' },
    { questId: 'weekly_burn_2500', type: 'weekly', category: 'workout', title: 'Burn 2.5K This Week', description: 'Burn 2500+ total calories this week', target: 2500, xpReward: 220, difficulty: 'medium', icon: '🏆', minRank: 'C' },
    { questId: 'weekly_14_meals', type: 'weekly', category: 'nutrition', title: 'Log 14 Meals This Week', description: 'Log 2 meals per day, every day', target: 14, xpReward: 180, difficulty: 'medium', icon: '📅', minRank: 'C' },
    { questId: 'weekly_streak_5', type: 'weekly', category: 'streak', title: '5-Day Streak', description: 'Maintain a 5-day workout streak', target: 5, xpReward: 200, difficulty: 'medium', icon: '🔥', minRank: 'D' },
    { questId: 'weekly_streak_6', type: 'weekly', category: 'streak', title: '6-Day Streak', description: 'Maintain a 6-day workout streak', target: 6, xpReward: 250, difficulty: 'medium', icon: '🔥', minRank: 'C' },

    // =============================================
    // WEEKLY QUESTS — HARD (6)
    // =============================================
    { questId: 'weekly_7_workouts', type: 'weekly', category: 'workout', title: '7 Workouts This Week', description: 'Work out every single day this week', target: 7, xpReward: 250, difficulty: 'hard', icon: '🏆', minRank: 'B' },
    { questId: 'weekly_burn_3000', type: 'weekly', category: 'workout', title: 'Burn 3K This Week', description: 'Burn 3000+ total calories this week', target: 3000, xpReward: 280, difficulty: 'hard', icon: '🏆', minRank: 'B' },
    { questId: 'weekly_burn_4000', type: 'weekly', category: 'workout', title: 'Burn 4K This Week', description: 'Burn 4000+ total calories — elite week', target: 4000, xpReward: 350, difficulty: 'hard', icon: '🏆', minRank: 'A' },
    { questId: 'weekly_21_meals', type: 'weekly', category: 'nutrition', title: 'Full Nutrition Week', description: 'Log 3 meals per day, every day', target: 21, xpReward: 250, difficulty: 'hard', icon: '🏆', minRank: 'B' },
    { questId: 'weekly_streak_7', type: 'weekly', category: 'streak', title: '7-Day Streak', description: 'Maintain a 7-day workout streak', target: 7, xpReward: 350, difficulty: 'hard', icon: '🔥', minRank: 'E' },
    { questId: 'weekly_streak_perfect', type: 'weekly', category: 'streak', title: 'Perfect Week', description: '7-day streak + log 21 meals — ultimate discipline', target: 7, xpReward: 400, difficulty: 'hard', icon: '👑', minRank: 'A' },
];

async function seed() {
    try {
        await connectDB();
        console.log('Connected to database');

        // Upsert each quest
        for (const quest of quests) {
            await Quest.findOneAndUpdate(
                { questId: quest.questId },
                quest,
                { upsert: true, new: true }
            );
            console.log(`  ✓ ${quest.questId}`);
        }

        console.log(`\nSeeded ${quests.length} quest templates`);
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
