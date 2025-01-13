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


// Export the router
module.exports = router;
