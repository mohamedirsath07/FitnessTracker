/**
 * ============================================
 * DATABASE CONFIGURATION
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * This file handles connecting to MongoDB using Mongoose.
 * 
 * WHAT IS MONGOOSE?
 * Mongoose is an ODM (Object Data Modeling) library that:
 * - Provides a schema-based solution for MongoDB
 * - Handles connection to the database
 * - Gives us helpful methods to create, read, update, delete data
 * 
 * WHY USE A SEPARATE CONFIG FILE?
 * - Keeps database logic separate from main server code
 * - Makes it easy to change database settings in one place
 * - Can be reused across different parts of the app
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB database
 * 
 * @async - This function is asynchronous (uses async/await)
 * 
 * We use async/await because connecting to a database takes time.
 * JavaScript continues running other code while waiting (non-blocking).
 */
const connectDB = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4 // Force IPv4
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      
      // Handle connection events for monitoring
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      return conn;
      
    } catch (error) {
      console.error(`❌ MongoDB Connection Attempt ${attempt}/${retries} Failed: ${error.message}`);
      
      if (attempt === retries) {
        console.error('All connection attempts failed. Exiting...');
        process.exit(1);
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`⏳ Retrying in ${waitTime / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Export the function so other files can use it
// This is CommonJS syntax (used in Node.js)
module.exports = connectDB;
