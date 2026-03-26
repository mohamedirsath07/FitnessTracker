/**
 * Quest Routes — Get and manage daily/weekly quests
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { refreshQuests } = require('../services/questService');

router.use(protect);

/**
 * GET /api/quests — Get active quests (auto-refreshes if expired)
 */
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const quests = await refreshQuests(user);

        res.json({
            success: true,
            quests: (quests || []).filter(q => q.expiresAt > new Date()),
        });
    } catch (error) {
        console.error('Quest fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to load quests' });
    }
});

module.exports = router;
