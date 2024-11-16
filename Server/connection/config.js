// config.js
require('dotenv').config(); // Load environment variables from .env file

module.exports = {
    MONGO_URI: process.env.MONGO_URI, // Get MONGO_URI from .env file
};

