/**
 * Razorpay Payment Routes
 * Handles subscription creation and webhook verification.
 * Install: npm install razorpay
 *
 * Required .env variables:
 *   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
 *   RAZORPAY_PLAN_MONTHLY, RAZORPAY_PLAN_YEARLY
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

let razorpay = null;

// Lazy-init Razorpay only when keys exist
function getRazorpay() {
    if (razorpay) return razorpay;
    if (!process.env.RAZORPAY_KEY_ID) return null;
    try {
        const Razorpay = require('razorpay');
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        return razorpay;
    } catch {
        return null;
    }
}

/**
 * @route   POST /api/payments/subscribe
 * @desc    Create a Razorpay subscription
 * @access  Private
 */
router.post('/subscribe', protect, async (req, res) => {
    const rp = getRazorpay();
    if (!rp) return res.status(503).json({ message: 'Payments not configured' });

    try {
        const { planType } = req.body; // 'monthly' or 'yearly'
        const planId = planType === 'yearly'
            ? process.env.RAZORPAY_PLAN_YEARLY
            : process.env.RAZORPAY_PLAN_MONTHLY;

        if (!planId) return res.status(400).json({ message: 'Invalid plan' });

        const subscription = await rp.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: planType === 'yearly' ? 5 : 12,
            notes: { userId: req.user.id },
        });

        res.json({
            success: true,
            subscriptionId: subscription.id,
            shortUrl: subscription.short_url,
        });
    } catch (err) {
        console.error('Razorpay error:', err);
        res.status(500).json({ message: 'Payment setup failed' });
    }
});

/**
 * @route   GET /api/payments/status
 * @desc    Get current subscription status
 * @access  Private
 */
router.get('/status', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('subscription').lean();
        res.json({
            success: true,
            subscription: user?.subscription || { plan: 'free', status: 'expired' },
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch status' });
    }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Razorpay webhook handler
 * @access  Public (verified by signature)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        return res.status(503).json({ message: 'Webhook not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    try {
        switch (event.event) {
            case 'subscription.activated':
            case 'subscription.charged': {
                const userId = event.payload?.subscription?.entity?.notes?.userId;
                if (userId) {
                    await User.findByIdAndUpdate(userId, {
                        'subscription.plan': 'pro',
                        'subscription.razorpayId': event.payload.subscription.entity.id,
                        'subscription.status': 'active',
                        'subscription.currentPeriodEnd': new Date(
                            event.payload.subscription.entity.current_end * 1000
                        ),
                    });
                }
                break;
            }
            case 'subscription.cancelled':
            case 'subscription.completed': {
                const userId = event.payload?.subscription?.entity?.notes?.userId;
                if (userId) {
                    await User.findByIdAndUpdate(userId, {
                        'subscription.status': 'cancelled',
                    });
                }
                break;
            }
        }
    } catch (err) {
        console.error('Webhook processing error:', err);
    }

    res.json({ received: true });
});

module.exports = router;
