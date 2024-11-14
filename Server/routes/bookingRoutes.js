// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { createBooking,  cancelBooking,  getAllBookings } = require('../controllers/bookingController');

// POST route for creating a booking
router.post('/create', createBooking);
router.patch('/cancel/:reservation_id', cancelBooking);
router.get('/', getAllBookings);

module.exports = router;
