const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Define routes
router.get('/total-bookings', dashboardController.getTotalBookings);
router.get('/active-admins', dashboardController.getActiveAdmins);
router.get('/recent-bookings', dashboardController.getRecentBookings);
router.get('/top-apartments', dashboardController.getTopApartments);


module.exports = router;
