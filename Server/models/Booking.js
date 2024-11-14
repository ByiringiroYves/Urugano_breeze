// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    reservation_id: { type: Number, unique: true }, // Auto-generated reservation ID
    property: { type: String, required: true },     // Apartment name
    guest: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    book_date: { type: Date, default: Date.now },   // Auto-generated booking date
    arrival_date: { type: Date, required: true },
    departure_date: { type: Date, required: true },
    nights: { type: Number },                       // Calculated based on dates
    total_price: { type: Number },                  // Calculated based on nights and price per night
    status: { type: String, default: 'Confirmed' }
});

module.exports = mongoose.model('Booking', bookingSchema);
