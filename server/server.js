/**
 * ============================================
 * FITNESSTRACKER - MAIN SERVER FILE
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * This is the entry point of your backend application.
 * Think of it as the "main()" function of your server.
 * 
 * WHAT THIS FILE DOES:
 * 1. Loads environment variables (.env file)
 * 2. Connects to MongoDB database
 * 3. Sets up Express app with middleware
 * 4. Mounts all API routes
 * 5. Starts the server listening for requests
 * 
 * EXPRESS MIDDLEWARE CHAIN:
 * When a request comes in, it passes through each middleware in order:
 * 
 * Request → cors → express.json → routes → Response
 *              ↓          ↓           ↓
 *          (allows   (parses      (handles
 *          cross-    JSON         the route
 *          origin)   body)        logic)
 */

// Load environment variables FIRST (before other imports)
// This makes process.env.VAR_NAME available throughout the app
require('dotenv').config();

// Import dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Import route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const mealRoutes = require('./routes/meals');
const progressRoutes = require('./routes/progress');
const questRoutes = require('./routes/quests');
// v1: Frozen — guild, admin, payments routes disabled for launch focus
// const guildRoutes = require('./routes/guilds');
// const adminRoutes = require('./routes/admin');
// const paymentRoutes = require('./routes/payments');

/**
 * Connect to MongoDB
 * Only connect when running as standalone server (not in serverless)
 * In serverless mode, connection is handled by api/index.js
 */
if (require.main === module) {
    connectDB();
}

/**
 * Create Express Application
 * 
 * express() returns an Express application object.
 * This object has methods for:
 * - Routing HTTP requests (app.get, app.post, etc.)
 * - Configuring middleware (app.use)
 * - Starting the server (app.listen)
 */
const app = express();

/**
 * ============================================
 * MIDDLEWARE SETUP
 * ============================================
 * 
 * Order matters! Middleware runs in the order it's defined.
 */

/**
 * CORS (Cross-Origin Resource Sharing)
 * 
 * By default, browsers block requests from one domain to another.
 * For example, your React app on localhost:5173 can't call
 * your API on localhost:5000 without CORS.
 * 
 * cors() middleware adds headers that tell the browser:
 * "It's okay, allow requests from other origins"
 */
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.CLIENT_URL,
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        // Check if origin is in allowlist or matches Vercel deployment pattern
        if (allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Body Parsers
 * 
 * express.json() - Parses JSON bodies
 *   Request body like {"name": "John"} becomes req.body = {name: "John"}
 * 
 * express.urlencoded() - Parses form data
 *   Form submissions like name=John become req.body = {name: "John"}
 */
app.use(express.json({ limit: '10mb' }));  // Limit body size for security
app.use(express.urlencoded({ extended: true }));

/**
 * Security Middleware
 * 
 * helmet() - Sets various HTTP security headers
 * compression() - Compresses response bodies for performance
 */
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disabled for API server
}));
app.use(compression());

/**
 * Rate Limiting
 * 
 * Prevents abuse by limiting number of requests per IP.
 * General: 100 requests per 15 minutes
 * Auth: 20 requests per 15 minutes (stricter for login/register)
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general rate limiter to all routes
app.use('/api/', generalLimiter);

/**
 * Request Logging
 * 
 * Uses morgan for structured HTTP request logging.
 * 'dev' format in development, 'combined' in production.
 */
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

/**
 * ============================================
 * API ROUTES
 * ============================================
 * 
 * app.use(path, router) mounts a router at a specific path.
 * All routes in that router are relative to the mount path.
 * 
 * Example:
 *   app.use('/api/auth', authRoutes)
 *   
 *   If authRoutes has: router.post('/login', ...)
 *   The full path becomes: POST /api/auth/login
 */

// Health check endpoint (useful for deployment monitoring)
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    res.json({
        success: true,
        message: 'FitnessTracker API is running!',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        environment: process.env.NODE_ENV || 'development',
        database: dbStates[dbState] || 'unknown',
        version: require('./package.json').version,
    });
});

// Mount route files (auth routes get stricter rate limiting)
app.use('/api/auth', authLimiter, authRoutes);       // /api/auth/register, /api/auth/login, etc.
app.use('/api/users', userRoutes);      // /api/users/profile, /api/users/stats
app.use('/api/workouts', workoutRoutes);// /api/workouts, /api/workouts/:id
app.use('/api/meals', mealRoutes);      // /api/meals, /api/meals/today
app.use('/api/progress', progressRoutes);// /api/progress, /api/progress/weight
app.use('/api/quests', questRoutes);     // /api/quests
// v1: Frozen — guild, admin, payments routes disabled for launch focus
// app.use('/api/guilds', guildRoutes);     // /api/guilds
// app.use('/api/admin', adminRoutes);      // /api/admin/dashboard
// app.use('/api/payments', paymentRoutes); // /api/payments/subscribe

/**
 * ============================================
 * ERROR HANDLING
 * ============================================
 * 
 * Error-handling middleware has 4 parameters: (err, req, res, next)
 * Express knows it's an error handler because of the 4 parameters.
 * 
 * This catches any errors thrown in routes above.
 */

// 404 Handler - Route not found
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

/**
 * ============================================
 * START SERVER
 * ============================================
 */
const PORT = process.env.PORT || 5000;

// Only start server when running directly (not in serverless)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🏋️  FitnessTracker API Server                          ║
║                                                          ║
║   Running on: http://localhost:${PORT}                     ║
║   Environment: ${process.env.NODE_ENV || 'development'}                       ║
║                                                          ║
║   Available Routes:                                      ║
║   • GET  /api/health         - Health check              ║
║   • POST /api/auth/register  - Register user             ║
║   • POST /api/auth/login     - Login user                ║
║   • GET  /api/auth/me        - Get current user          ║
║   • PUT  /api/users/profile  - Update profile            ║
║   • GET  /api/users/stats    - Get user stats            ║
║   • CRUD /api/workouts       - Workout operations        ║
║   • CRUD /api/meals          - Meal operations           ║
║   • GET  /api/progress       - Progress history          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Export app for serverless use
module.exports = app;
