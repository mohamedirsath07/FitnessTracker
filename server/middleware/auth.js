/**
 * ============================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * WHAT IS MIDDLEWARE?
 * Middleware is a function that runs between receiving a request
 * and sending a response. It has access to:
 * - req (request object) - data coming from client
 * - res (response object) - data going back to client
 * - next (function) - call to pass control to next middleware
 * 
 * AUTHENTICATION FLOW:
 * 1. User logs in -> receives JWT token
 * 2. User stores token (localStorage/cookie)
 * 3. Every request sends token in Authorization header
 * 4. This middleware verifies the token is valid
 * 5. If valid, adds user info to req object
 * 6. If invalid, returns 401 Unauthorized error
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - requires authentication
 * 
 * Usage in routes:
 *   router.get('/profile', protect, getProfile);
 * 
 * The 'protect' middleware runs first, then 'getProfile' only if auth succeeds.
 */
const protect = async (req, res, next) => {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    // Common format: "Bearer eyJhbGciOiJIUzI1NiIs..."
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Extract the token (everything after 'Bearer ')
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, return error
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. No token provided.'
        });
    }

    try {
        // Verify the token using our secret key
        // jwt.verify() throws an error if token is invalid or expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // decoded contains the payload we put in when creating the token
        // { id: 'user_id_here', iat: issued_at, exp: expires_at }

        // Find the user and add to request object
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token may be invalid.'
            });
        }

        // Continue to the next middleware/route handler
        next();

    } catch (error) {
        // Token verification failed
        console.error('Auth middleware error:', error.message);

        // Different error messages based on error type
        let message = 'Not authorized. Token is invalid.';
        if (error.name === 'TokenExpiredError') {
            message = 'Token expired. Please log in again.';
        }

        return res.status(401).json({
            success: false,
            message
        });
    }
};

/**
 * Generate JWT Token
 * 
 * Helper function to create a signed JWT token.
 * Called after successful login or registration.
 * 
 * @param {string} id - The user's MongoDB _id
 * @returns {string} - Signed JWT token
 */
const generateToken = (id) => {
    return jwt.sign(
        { id },  // Payload - data stored in the token
        process.env.JWT_SECRET,  // Secret key for signing
        { expiresIn: '30d' }  // Token expires in 30 days
    );
};

module.exports = { protect, generateToken };
