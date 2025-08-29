// routes/index.js

const express = require('express');
const router = express.Router();
const stripeRoutes = require('./stripeRoutes'); // Import Stripe routes
const adminRoutes = require('./adminRoutes');
const apartmentRoutes = require('./apartmentRoutes');
const compoundRoutes = require('./compoundRoutes');
const bookingRoutes = require('./bookingRoutes');
const testimonialRoutes = require('./testimonialRoutes');
const peopleRoutes = require('./peopleRoutes'); // Import the people routes
const advertisementRoutes = require('./advertisementRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const contactRoute = require('./contactRoute');

// Use the testimonial routes


// Attach each route to its respective path
router.use('/stripe-webhook', stripeRoutes); // Use the Stripe routes
router.use('/admin', adminRoutes);
router.use('/apartments', apartmentRoutes);
router.use('/compounds', compoundRoutes);
router.use('/bookings', bookingRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/people', peopleRoutes); // Attach the people routes
router.use('/advertisements', advertisementRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/contact', contactRoute); // Use the contact route


module.exports = router;
