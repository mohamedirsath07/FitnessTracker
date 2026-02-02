/**
 * ============================================
 * VERCEL SERVERLESS API HANDLER
 * ============================================
 * 
 * This file wraps the Express app for Vercel serverless deployment.
 * Vercel will invoke this function for all /api/* requests.
 */

// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');

// MongoDB connection caching for serverless
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        isConnected = conn.connections[0].readyState === 1;
        console.log('MongoDB connected for serverless');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
};

// Import the Express app
const app = require('../server/server');

// Serverless handler
module.exports = async (req, res) => {
    // Ensure database is connected
    await connectDB();

    // Let Express handle the request
    return app(req, res);
};
