const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { MONGO_URI } = require('./connection/config');
const routes = require('./routes'); // Import main routes file
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// MongoDB Connection
mongoose.connect(MONGO_URI, {})
    .then(() => console.log('MongoDB connected to Atlas Cloud'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware
// Middleware

// --- START CORRECTED CORS CONFIG ---
// Read allowed origins from environment variables
const allowedOrigins = [
    process.env.FRONTEND_URL,  // Should be "https://gogovillas.com"
    process.env.FRONTEND_WWW, 
    process.env.LOCAL_TEST   // Should be "https://www.gogovillas.com"
    // Add 'http://localhost:xxxx' if you need it for local testing
].filter(Boolean); // Removes undefined entries if env vars aren't set

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl/Postman/mobile apps)
    // OR allow requests from origins in the allowedOrigins list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Block requests from other origins
      console.error(`CORS blocked for origin: ${origin}`); // Log blocked origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow credentials (cookies, auth headers)
};

app.use(cors(corsOptions)); // Apply the corrected CORS middleware
// --- END CORRECTED CORS CONFIG --


app.use(morgan('combined')); // Combined format is better for production logging
app.use(express.json()); // For parsing JSON request bodies

// Debug: Log incoming requests and cookies (for development only)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`Incoming ${req.method} request to ${req.url}`);
        console.log('Headers:', req.headers);
        next();
    });
}

app.use('/api', routes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the API!' });
});

// Routes
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Serve Static Files for Uploaded Assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Handle 404 for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Resource not found.' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
