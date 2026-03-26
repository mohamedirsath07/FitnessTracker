/**
 * Push Notification Service
 * Uses web-push for sending notifications to subscribed users.
 * Generate VAPID keys: npx web-push generate-vapid-keys
 * Store in .env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
 */

const webpush = require('web-push');

// Only configure if VAPID keys exist
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        `mailto:${process.env.VAPID_EMAIL || 'admin@levelup.fitness'}`,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

/**
 * Send push notification to a user
 */
async function sendPush(user, payload) {
    if (!user.pushSubscription?.endpoint) return;
    if (!process.env.VAPID_PUBLIC_KEY) return; // Skip if not configured

    try {
        await webpush.sendNotification(
            user.pushSubscription,
            JSON.stringify(payload)
        );
    } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription expired or invalid — clear it
            user.pushSubscription = undefined;
            await user.save();
        }
        // Silently ignore other push errors
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
    questCompleted: (quest) => ({
        title: '✅ Quest Complete!',
        body: `"${quest.title}" done! +${quest.xpReward} XP earned.`,
        tag: 'quest-complete',
    }),
};

module.exports = { sendPush, notifications };
