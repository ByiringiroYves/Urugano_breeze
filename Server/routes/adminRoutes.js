const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController'); // Correct path to your adminController.js

// Define the POST route for creating an admin
router.post('/create-admin', AdminController.createAdmin);
router.post('/login', AdminController.login); // Login route
router.post('/verify-code', AdminController.verifyCode); // Verify code route

module.exports = router;
