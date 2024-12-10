const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { MONGO_URI } = require('./connection/config');
const routes = require('./routes'); // Import main routes file
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected to Atlas Cloud'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend's origin
    credentials: true, // Allow sending cookies and credentials
}));

app.use(morgan('dev')); // For logging HTTP requests
app.use(express.json()); // For parsing JSON request bodies

// Debug: Log incoming requests and cookies
app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Routes
app.use('/api', routes); // Attach main routes

// Serve Static Files
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
