/**
 * Quest Model — Template definitions for daily/weekly quests
 */

const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
    questId: { type: String, unique: true, required: true },
    type: { type: String, enum: ['daily', 'weekly'], required: true },
    category: { type: String, enum: ['workout', 'nutrition', 'streak', 'social'], required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    target: { type: Number, required: true },
    xpReward: { type: Number, required: true },
    icon: { type: String, default: '⚡' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    minRank: { type: String, default: 'E' },
    requiredStreak: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Quest', QuestSchema);
