/**
 * Guild Model — Groups of friends sharing XP totals
 */

const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 30, trim: true },
    code: { type: String, unique: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
    }],
    totalXP: { type: Number, default: 0 },
    weeklyXP: { type: Number, default: 0 },
    maxMembers: { type: Number, default: 10 },
}, { timestamps: true });

// Generate join code on first save
GuildSchema.pre('save', function (next) {
    if (!this.code) {
        this.code = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

// Index for leaderboard
GuildSchema.index({ weeklyXP: -1 });

module.exports = mongoose.model('Guild', GuildSchema);
