// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { 
    initiateBooking,  
    cancelBooking,  
    getAllBookings, 
    searchAvailableCompounds, 
    hideApartment, 
    unhideApartment,
    getBookingById, 
    updateBooking,
    markBookingAsPaid, // NEW import for marking booking as paid
    cancelMultipleBookings // Ensure cancelMultipleBookings is imported
} = require('../controllers/bookingController');

// For admin route protection (from AdminController)
//const { authenticateJWT } = require('../controllers/adminController'); 

// POST route for creating a booking (public)
router.post('/create', initiateBooking);

// PATCH route for canceling multiple bookings by IDs (admin action)
// This MUST come BEFORE the general :reservation_id route to prevent conflicts.
router.patch('/cancel-multiple', cancelMultipleBookings); 

// PATCH route for canceling a single booking by reservation_id (public link)
router.patch('/cancel/:reservation_id', cancelBooking);

// PATCH route for updating a booking by reservation_id (public link)
router.patch('/:reservation_id', updateBooking);

// GET route for fetching all bookings (THIS ROUTE MUST BE PROTECTED IF ADMIN-ONLY)
router.get('/', getAllBookings); 

// GET route for fetching a single booking by reservation_id (public link)
router.get('/:reservation_id', getBookingById); 


// Search available compounds (public)
router.post('/search', searchAvailableCompounds);

// NEW route for marking a booking as paid (admin action)
router.patch('/:reservation_id/mark-as-paid', markBookingAsPaid)

// Block/Unblock apartment's availability (admin actions)
router.post('/hide-apartment', hideApartment); 
router.post('/unhide-apartment', unhideApartment); 
module.exports = router;
