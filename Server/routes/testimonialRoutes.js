// testimonialRoutes.js

const express = require('express');
const upload = require('../middleware/upload'); // Update path to point to your `upload.js`
const { addTestimonial, getTestimonials } = require('../controllers/testimonialController');

const router = express.Router();

// Define the route for adding a testimonial
router.post('/add', upload.single('client_photo'), addTestimonial);
router.get('/', getTestimonials);

module.exports = router;
