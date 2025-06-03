const Testimonial = require('../models/Testimonial');
const path = require('path');
// const fs = require('fs'); // fs might not be needed if you're just constructing paths

// POST: Add a new testimonial
const addTestimonial = async (req, res) => {
    try {
        const { client_name, content, client_occupation } = req.body;
        let client_photo_url_path = null; // Initialize to null

        if (req.file) {
            // Assuming your 'setUploadType('testimonials')' middleware configures uploads
            // into a subfolder that's publicly served under '/uploads/testimonials/'
            // req.file.filename should contain the actual filename (e.g., '12345-myimage.jpg')
            // as stored by your upload middleware (e.g., multer).
            // Construct the web-accessible relative URL path.
            client_photo_url_path = `/uploads/testimonials/${req.file.filename}`;
        } else {
            // Handle cases where no photo is uploaded, if you want to allow that
            // Or return an error if client_photo is required
            // For now, it defaults to null if no file, or you can set a default path
        }

        const testimonial = new Testimonial({
            client_name,
            content,
            client_occupation,
            client_photo: client_photo_url_path // Save the URL path
        });

        await testimonial.save();
        res.status(201).json({ message: 'Testimonial created successfully', testimonial });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({ error: 'An error occurred while creating the testimonial.' });
    }
};

// GET: Fetch all testimonials
const getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ created_at: -1 });
        res.status(200).json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
};

module.exports = {
    addTestimonial,
    getTestimonials
};
