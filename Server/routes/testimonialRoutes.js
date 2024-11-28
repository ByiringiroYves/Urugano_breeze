// testimonialRoutes.js

const express = require('express');
const testimonialController = require('../controllers/testimonialController');
const { getTestimonials } = require('../controllers/testimonialController');
const { upload, setUploadType } = require('../middleware/upload');

const router = express.Router();

// Define the route for adding a testimonial
router.post(
    '/add',
    setUploadType('testimonials'), // Specify 'testimonials' folder
    upload.single('client_photo'), // Handle single file upload
    testimonialController.addTestimonial
);

//router.post('/add', upload.single('client_photo'), addTestimonial);
router.get('/', getTestimonials);

module.exports = router;
