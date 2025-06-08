// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { 
    createBooking,  
    cancelBooking,  
    getAllBookings, 
    searchAvailableCompounds, 
    hideApartment, 
    unhideApartment,
    getBookingById, // Ensure getBookingById is imported from your controller
    updateBooking
} = require('../controllers/bookingController');

// POST route for creating a booking
router.post('/create', createBooking);

// PATCH route for canceling a booking by reservation_id
router.patch('/cancel/:reservation_id', cancelBooking);

// GET route for fetching all bookings
router.get('/', getAllBookings);

// GET route for fetching a single booking by reservation_id
router.get('/:reservation_id', getBookingById); // <--- THIS IS THE NEWLY ADDED ROUTE

// Search available compounds
router.post('/search', searchAvailableCompounds);

// Block/Unblock apartment's availability
router.post('/hide-apartment', hideApartment);
router.post('/unhide-apartment', unhideApartment);

// PATCH route for updating a booking by reservation_id (and token in body)
router.patch('/:reservation_id', updateBooking); // <--- NEW ROUTE FOR UPDATES

module.exports = router;