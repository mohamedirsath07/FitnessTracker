/**
 * Guild Routes — Create, join, leave guilds and guild leaderboard
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Guild = require('../models/Guild');

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
        console.error('Create guild error:', err);
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
        console.error('Join guild error:', err);
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
        console.error('Get guild error:', err);
        res.status(500).json({ message: 'Failed to fetch guild' });
    }
});

// Guild leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const guilds = await Guild.find()
            .sort({ weeklyXP: -1 })
            .limit(10)
            .select('name weeklyXP totalXP members code')
            .lean();

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
        console.error('Guild leaderboard error:', err);
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
        console.error('Leave guild error:', err);
        res.status(500).json({ message: 'Failed to leave guild' });
    }
});

module.exports = router;
