// models/Testimonial.js

const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    client_name: {
        type: String,
        required: true
    },
    client_photo: {
        type: String // This will store the path or URL of the uploaded image
    },
    content: {
        type: String,
        required: true
    },
    client_occupation: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
