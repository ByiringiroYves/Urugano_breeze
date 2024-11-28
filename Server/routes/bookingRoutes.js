// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { createBooking,  cancelBooking,  getAllBookings, searchAvailableCompounds } = require('../controllers/bookingController');

// POST route for creating a booking
router.post('/create', createBooking);
router.patch('/cancel/:reservation_id', cancelBooking);
router.get('/', getAllBookings);

// Search available compounds
router.post('/search', searchAvailableCompounds);

module.exports = router;
