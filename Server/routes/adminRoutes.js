const express = require('express');
const path = require('path');
const AdminController = require('../controllers/adminController'); // Import the admin controller
const { authenticateJWT } = require('../controllers/adminController'); // Import JWT middleware

const router = express.Router();

// Log the loaded AdminController for debugging
console.log("AdminController loaded:", AdminController);

// Public Routes
router.post('/create-admin', AdminController.createAdmin); // Route to create an admin
router.post('/login', AdminController.loginAdmin); // Login route
router.post('/verify-code', AdminController.verifyCode); // Verify code route

// Protected Routes (require JWT authentication middleware)
router.get('/profile', authenticateJWT, AdminController.getProfile); // Fetch profile
router.post('/logout', authenticateJWT, AdminController.logoutAdmin); // Logout route

// Admin Feature Page (Protected Route)
// Protect admin pages with authenticateJWT middleware
router.get('/html/admin-dashboard.html', authenticateJWT, (req, res) => {
    res.sendFile(path.join(__dirname, '../UI/html/admin-dashboard.html'));
});

router.get('/html/co-admins.html', authenticateJWT, (req, res) => {
    res.sendFile(path.join(__dirname, '../UI/html/co-admins.html'));
});

router.get('/html/booking.html', authenticateJWT, (req, res) => {
    res.sendFile(path.join(__dirname, '../UI/html/booking.html'));
});

router.get('/html/modify-Apartment.html', authenticateJWT, (req, res) => {
    res.sendFile(path.join(__dirname, '../UI/html/modify-Apartment.html'));
});

router.get('/html/people.html', authenticateJWT, (req, res) => {
    res.sendFile(path.join(__dirname, '../UI/html/people.html'));
});

router.get('/html/testimonial-admin.html', authenticateJWT, (req, res) => {
    res.sendFile(path.join(__dirname, '../UI/html/testimonial-admin.html'));
});

// Export the router
module.exports = router;
