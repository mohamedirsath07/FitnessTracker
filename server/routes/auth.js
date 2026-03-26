/**
 * ============================================
 * AUTHENTICATION ROUTES
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * WHAT IS A ROUTER?
 * Express Router is a mini-application that handles specific routes.
 * We use it to organize our code by feature (auth, users, workouts, etc.)
 * 
 * HTTP METHODS:
 * - GET: Retrieve data (e.g., get user profile)
 * - POST: Create new data (e.g., register user)
 * - PUT: Update existing data (e.g., update profile)
 * - DELETE: Remove data (e.g., delete workout)
 * 
 * ROUTE PARAMETERS:
 * Routes define URL patterns. Example:
 * - POST /api/auth/register -> register a new user
 * - POST /api/auth/login -> login a user
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { Resend } = require('resend');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

// Lazy-init Resend — allows server to start without RESEND_API_KEY in dev
let _resend;
function getResend() {
    if (!process.env.RESEND_API_KEY) return null;
    if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
    return _resend;
}
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

if (process.env.RESEND_API_KEY) {
    console.log('Resend email system initialized');
} else {
    console.warn('⚠  RESEND_API_KEY missing — email sending disabled');
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public (no auth required)
 * 
 * Request body should contain:
 * {
 *   "username": "string",
 *   "email": "string",
 *   "password": "string",
 *   "height": number (optional),
 *   "weight": number (optional),
 *   ... other profile fields
 * }
 */
router.post(
    '/register',
    // Validation middleware using express-validator
    [
        body('username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { username, email, password, height, weight, age, gender, bodyFat, goal, profilePicture } = req.body;

            // Check if user already exists
            let user = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email or username'
                });
            }

            // Generate email verification token
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

            // Create new user
            user = await User.create({
                username,
                email,
                password,  // Will be hashed by the pre-save middleware
                height: height || 170,
                weight: weight || 70,
                age: age || 25,
                gender: gender || 'male',
                bodyFat: bodyFat || 20,
                goal: goal || 'maintenance',
                profilePicture: profilePicture || '',
                emailVerified: false,
                verificationToken: hashedToken,
                verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            });

            // Send verification email (fire-and-forget — never blocks registration)
            const verifyUrl = `${CLIENT_URL}/verify-email?token=${rawToken}`;
            const resendClient = getResend();
            if (!resendClient) {
                console.warn('Skipping verification email — RESEND_API_KEY not configured');
            } else {
                resendClient.emails.send({
                    from: process.env.EMAIL_FROM || 'FitnessTracker <noreply@resend.dev>',
                    to: email,
                    subject: 'Verify your FitnessTracker account',
                    html: `
                        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
                            <h2 style="color:#2563eb">Welcome to FitnessTracker!</h2>
                            <p>Hi ${username}, click the button below to verify your email:</p>
                            <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Verify Email</a>
                            <p style="color:#888;font-size:13px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
                        </div>
                    `,
                }).catch(err => console.error('Verification email failed (non-fatal):', err.message));
            }

            // Send response (no JWT — user must verify first)
            res.status(201).json({
                success: true,
                message: 'Account created. Please check your email to verify your account.',
                needsVerification: true,
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during registration'
            });
        }
    }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token
 * @access  Public
 * 
 * Request body:
 * {
 *   "email": "string" (or "username": "string"),
 *   "password": "string"
 * }
 */
router.post(
    '/login',
    [
        body('password').exists().withMessage('Password is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, username, identifier, password } = req.body;

            // Support 'identifier' field (can be email or username)
            // Also support separate email/username fields for backwards compatibility
            const loginId = identifier || email || username;

            if (!loginId) {
                return res.status(400).json({
                    success: false,
                    message: 'Email or username is required'
                });
            }

            // Find user by email or username
            const user = await User.findOne({
                $or: [
                    { email: loginId.toLowerCase() },
                    { username: loginId }
                ]
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check password using the instance method we defined
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Block login if email not verified
            if (!user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: 'Please verify your email before logging in.',
                    needsVerification: true,
                    email: user.email,
                });
            }

            // Update streak
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (user.lastWorkoutDate) {
                const lastWorkout = new Date(user.lastWorkoutDate);
                lastWorkout.setHours(0, 0, 0, 0);

                const diffDays = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));

                if (diffDays > 1) {
                    // Streak broken - use updateOne to avoid triggering pre-save hook
                    await User.updateOne({ _id: user._id }, { $set: { streak: 0 } });
                    user.streak = 0;
                }
            }

            // Generate token
            const token = generateToken(user._id);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    height: user.height,
                    weight: user.weight,
                    goalWeight: user.goalWeight || user.weight,
                    bodyFat: user.bodyFat,
                    xp: user.xp,
                    streak: user.streak,
                    goal: user.goal,
                    dailyCalorieGoal: user.dailyCalorieGoal,
                    dailyBurnGoal: user.dailyBurnGoal,
                    profilePicture: user.profilePicture || ''
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private (requires auth)
 * 
 * No request body needed - user is identified by JWT token
 */
router.get('/me', protect, async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user.id);

        // Lazy migration: existing users who already have workouts skip onboarding
        if (!user.onboardingComplete && (user.analytics?.totalWorkouts || 0) > 0) {
            user.onboardingComplete = true;
            await user.save();
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                height: user.height,
                weight: user.weight,
                goalWeight: user.goalWeight || user.weight,
                age: user.age,
                gender: user.gender,
                bodyFat: user.bodyFat,
                xp: user.xp,
                streak: user.streak,
                goal: user.goal,
                dailyCalorieGoal: user.dailyCalorieGoal,
                dailyBurnGoal: user.dailyBurnGoal,
                profilePicture: user.profilePicture || '',
                level: user.getLevel(),
                onboardingComplete: user.onboardingComplete || false,
                streakFreezes: user.streakData?.freezesAvailable ?? 1
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Verification token is required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({ verificationToken: hashedToken });

        if (!user) {
            // Token not in DB — either already used (cleared on success) or truly invalid
            return res.status(400).json({
                success: false,
                message: 'This verification link is invalid or has already been used. If you already verified, you can log in.'
            });
        }

        // Already verified (race condition / idempotency guard)
        if (user.emailVerified) {
            user.verificationToken = null;
            user.verificationTokenExpiry = null;
            await user.save();
            return res.json({ success: true, message: 'Email is already verified. You can log in.' });
        }

        // Check expiry
        if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Verification token has expired. Please request a new one.'
            });
        }

        user.emailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        await user.save();

        res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ success: false, message: 'Server error verifying email' });
    }
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal whether the account exists
            return res.json({ success: true, message: 'If that email is registered, a verification link has been sent.' });
        }

        if (user.emailVerified) {
            return res.json({ success: true, message: 'Email is already verified. You can log in.' });
        }

        // Generate new token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.verificationToken = hashedToken;
        user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const verifyUrl = `${CLIENT_URL}/verify-email?token=${rawToken}`;
        try {
            await getResend().emails.send({
                from: process.env.EMAIL_FROM || 'FitnessTracker <noreply@resend.dev>',
                to: email,
                subject: 'Verify your FitnessTracker account',
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
                        <h2 style="color:#2563eb">Verify your email</h2>
                        <p>Click the button below to verify your email address:</p>
                        <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Verify Email</a>
                        <p style="color:#888;font-size:13px">This link expires in 24 hours.</p>
                    </div>
                `,
            });
        } catch (emailErr) {
            console.error('Resend verification email failed:', emailErr.message);
        }

        res.json({ success: true, message: 'If that email is registered, a verification link has been sent.' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Non-revealing response — always return success
        const genericMsg = 'If an account with that email exists, a password reset link has been sent.';

        if (!user) {
            return res.json({ success: true, message: genericMsg });
        }

        // Generate reset token (32 bytes = 64 hex chars)
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetToken = hashedToken;
        user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        const resetUrl = `${CLIENT_URL}/reset-password?token=${rawToken}`;
        const resendClient = getResend();
        if (!resendClient) {
            console.warn('Skipping password reset email — RESEND_API_KEY not configured');
        } else {
            resendClient.emails.send({
                from: process.env.EMAIL_FROM || 'FitnessTracker <noreply@resend.dev>',
                to: user.email,
                subject: 'Reset your FitnessTracker password',
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
                        <h2 style="color:#2563eb">Reset your password</h2>
                        <p>You requested a password reset. Click the button below to choose a new password:</p>
                        <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Reset Password</a>
                        <p style="color:#888;font-size:13px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
                    </div>
                `,
            }).catch(err => console.error('Password reset email failed:', err.message));
        }

        res.json({ success: true, message: genericMsg });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and new password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({ resetToken: hashedToken });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset link. Please request a new one.'
            });
        }

        // Check expiry separately for clearer messaging
        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            user.resetToken = null;
            user.resetTokenExpiry = null;
            await user.save();
            return res.status(400).json({
                success: false,
                message: 'Reset link has expired. Please request a new one.'
            });
        }

        // Update password — pre-save hook will hash it
        user.password = password;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        // No JWT issued — user must log in manually after reset
        res.json({ success: true, message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
