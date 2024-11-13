// routes/admin.js

const express = require('express');
const router = express.Router();
const { createAdmin } = require('../controllers/adminController'); // Adjusted path with correct casing

// Define the POST route for creating an admin
router.post('/create-admin', createAdmin);

module.exports = router;
