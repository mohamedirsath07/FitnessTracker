/**
 * Seed script to create a demo user for local development.
 *
 * Usage:  node seeds/demoUser.js
 *
 * Demo credentials:
 *   Email:    demo@fitness.com
 *   Password: demo1234
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');

const DEMO_USER = {
    username: 'demouser',
    email: 'demo@fitness.com',
    password: 'demo1234',       // will be hashed by User model pre-save hook
    height: 175,
    weight: 75,
    goalWeight: 70,
    age: 25,
    gender: 'male',
    bodyFat: 18,
    goal: 'maintenance',
    emailVerified: true,        // skip email verification
    xp: 150,
    streak: 3,
};

async function seed() {
    await connectDB();

    // Remove existing demo user if present (idempotent)
    await User.deleteOne({ email: DEMO_USER.email });

    // Let the User model's pre-save hook handle password hashing
    await User.create(DEMO_USER);

    console.log('');
    console.log('✅ Demo user created successfully!');
    console.log('────────────────────────────────');
    console.log('   Email:    demo@fitness.com');
    console.log('   Password: demo1234');
    console.log('────────────────────────────────');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
