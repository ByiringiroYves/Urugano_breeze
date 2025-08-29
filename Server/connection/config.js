// config.js
require('dotenv').config(); // Load environment variables from .env file

module.exports = {
    MONGO_URI: process.env.MONGO_URI, // Get MONGO_URI from .env file
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET, // Get STRIPE_WEBHOOK_SECRET from .env file
};