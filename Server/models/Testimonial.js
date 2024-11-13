// models/Testimonial.js

const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    imagePath: { type: String },
    name: { type: String, required: true },
    content: { type: String, required: true },
    occupation: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);
