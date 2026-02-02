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
const connectDB = require('./config/db');

// Import route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const mealRoutes = require('./routes/meals');
const progressRoutes = require('./routes/progress');

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
    'http://localhost:3000',
    process.env.CLIENT_URL,
    // Add your Vercel URL patterns
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        // Check if origin is allowed or matches Vercel pattern
        if (allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.includes('fitnesstracker')) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true  // Allow cookies to be sent
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
 * Request Logging (Development)
 * 
 * This simple middleware logs every request.
 * In production, you might use a library like 'morgan'.
 */
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();  // Always call next() to continue the chain
    });
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

// Health check endpoint (useful for deployment)
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'FitnessTracker API is running!',
        timestamp: new Date().toISOString()
    });
});

// Mount route files
app.use('/api/auth', authRoutes);       // /api/auth/register, /api/auth/login, etc.
app.use('/api/users', userRoutes);      // /api/users/profile, /api/users/stats
app.use('/api/workouts', workoutRoutes);// /api/workouts, /api/workouts/:id
app.use('/api/meals', mealRoutes);      // /api/meals, /api/meals/today
app.use('/api/progress', progressRoutes);// /api/progress, /api/progress/weight

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
