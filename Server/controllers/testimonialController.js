const Testimonial = require('../models/Testimonial'); // Assuming we have a Testimonial model

// Create a new testimonial
exports.createTestimonial = async (req, res) => {
    try {
        const testimonial = new Testimonial(req.body);
        await testimonial.save();
        res.status(201).json(testimonial);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// Get all testimonials
exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};