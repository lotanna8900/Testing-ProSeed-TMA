const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: './.env' });

const app = express();

// Connect to the database
connectDB();

// Initialize Telegram bot
require('./telegram/bot');

// Middleware to parse JSON
app.use(express.json());

// Use routes
app.use('/api/users', userRoutes);

// Export the app for Vercel's serverless functions
module.exports = app;
