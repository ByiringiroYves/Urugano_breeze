const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    reservation_id: { type: Number, unique: true },
    apartment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment", required: true }, // ObjectId reference to Apartment
    apartment_name: { type: String, required: true }, // Apartment name
    guest: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    book_date: { type: Date, default: Date.now },
    arrival_date: { type: Date, required: true },
    departure_date: { type: Date, required: true },
    nights: { type: Number },
    total_price: { type: Number },
    status: { type: String, default: "Confirmed" },
});

module.exports = mongoose.model("Booking", bookingSchema);
