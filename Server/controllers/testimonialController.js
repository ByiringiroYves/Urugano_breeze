const Testimonial = require('../models/Testimonial');
const path = require('path');
const fs = require('fs');

// POST: Add a new testimonial
const addTestimonial = async (req, res) => {
    try {
        const { client_name, content, client_occupation } = req.body;
        const client_photo = req.file ? req.file.path : null;

        // Your logic for saving the testimonial in the database
        const testimonial = new Testimonial({
            client_name,
            content,
            client_occupation,
            client_photo
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
