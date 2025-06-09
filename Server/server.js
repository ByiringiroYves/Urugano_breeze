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
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_WWW,
    process.env.LOCAL_TEST
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());

// Debug: Log incoming requests and headers (for development only)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        // console.log(`Incoming ${req.method} request to ${req.url}`);
        // console.log('Headers:', req.headers);
        next();
    });
}

// Serve your API routes - MUST be before static serving if paths overlap
app.use('/api', routes);

// --- CORRECTED: Serve Static Files from the frontend UI directory ---
// frontendRootPath should point to Urugano_web/UI/
const frontendRootPath = path.join(__dirname, '../UI'); 
app.use(express.static(frontendRootPath));

// --- Specific routes for cleaner URLs (serving files from frontendRootPath/html/) ---
app.get('/about', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/about.html'));
});

app.get('/apartments', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/apartments.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/gallery.html'));
});

app.get('/testimonial', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/testimonial.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/contact.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/admin.html'));
});

app.get('/userdata', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/userdata.html'));
});

app.get('/thankyou', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/thankyou.html'));
});

app.get('/bookingdetails', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/bookingdetails.html'));
});

app.get('/urugano-apartments', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/urugano_apartments.html'));
});

app.get('/apartment-details', (req, res) => {
    const apartmentName = req.query.apartmentName;
    let filePath;

    switch (apartmentName) {
        case 'Karisimbi Apartment':
            filePath = path.join(frontendRootPath, 'html/Karisimbi Apartment.html');
            break;
        case 'Muhabura Apartment':
            filePath = path.join(frontendRootPath, 'html/Muhabura Apartment.html');
            break;
        case 'Gahinga Apartment':
            filePath = path.join(frontendRootPath, 'html/Gahinga Apartment.html');
            break;
        case 'Sabyinyo Apartment':
            filePath = path.join(frontendRootPath, 'html/Sabyinyo Apartment.html');
            break;
        case 'Space for Partying':
            filePath = path.join(frontendRootPath, 'html/Space for Partying.html');
            break;
        default:
            return res.status(404).send('Apartment not found');
    }
    res.sendFile(filePath);
});

// --- NEW ADMIN PANEL ROUTES ---
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/admin-dashboard.html'));
});

app.get('/people', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/people.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/booking.html'));
});

app.get('/testimonial-admin', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/testimonial-admin.html'));
});

app.get('/co-admins', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/co-admins.html'));
});

app.get('/modify-Apartment', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/modify-Apartment.html'));
});


// Catch-all for the main index.html (handles '/') and any other unmatched root paths
// This should be the LAST route for GET requests to serve your SPA entry point or default page
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendRootPath, 'html/index.html'));
});

// Error Handling Middleware (should be last express.use after all routes)
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Handle 404 for truly undefined routes (after all specific routes)
app.use((req, res) => {
    res.status(404).json({ error: 'Resource not found.' });
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
