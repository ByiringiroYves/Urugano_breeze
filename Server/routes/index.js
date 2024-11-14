// routes/index.js

const express = require('express');
const adminRoutes = require('./admin');
const apartmentRoutes = require('./apartmentRoutes');
const compoundRoutes = require('./compoundRoutes');
const bookingRoutes = require('./bookingRoutes');
const testimonialRoutes = require('./testimonialRoutes');

// Use the testimonial routes



const router = express.Router();

// Attach each route to its respective path
router.use('/admin', adminRoutes);
router.use('/apartments', apartmentRoutes);
router.use('/compounds', compoundRoutes);
router.use('/bookings', bookingRoutes);
router.use('/testimonials', testimonialRoutes);

module.exports = router;
