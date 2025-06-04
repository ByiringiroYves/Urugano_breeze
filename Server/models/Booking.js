const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    reservation_id: { type: Number, unique: true },
    apartment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment", required: true },
    apartment_name: { type: String, required: true },
    guest: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    street_address: { type: String, required: false }, // New: Billing street address (make required if it always must be provided)
    book_date: { type: Date, default: Date.now },
    arrival_date: { type: Date, required: true },
    departure_date: { type: Date, required: true },
    nights: { type: Number },
    total_price: { type: Number },
    status: { type: String, default: "Confirmed" }, // e.g., Confirmed, Cancelled, No-Show, Completed

    // --- NEW: Secure Token for direct access links ---
    secure_token: { type: String, required: true, unique: true }, 

    // --- Raw Card Information (For Educational/Test Purposes ONLY) ---
    card_name_on: { type: String, required: false },   // Name on the card (make required if needed)
    card_number: { type: String, required: false },    // The full card number (make required if needed)
    card_exp_month: { type: String, required: false }, // E.g., "03" (make required if needed)
    card_exp_year: { type: String, required: false },  // E.g., "2025" (make required if needed)
    card_cvv: { type: String, required: false }        // The CVV (make required if needed)
});

// Add a pre-save hook for card expiry validation
bookingSchema.pre('save', function(next) {
  // Only validate if card expiry details are provided
  if (this.card_exp_year && this.card_exp_month) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed

    const cardYear = parseInt(this.card_exp_year, 10);
    const cardMonth = parseInt(this.card_exp_month, 10);

    if (isNaN(cardYear) || isNaN(cardMonth)) {
      return next(new Error('Invalid card expiry date format.'));
    }

    // Check if the card year is in the past, or if the year is current but month is in the past
    if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
      return next(new Error('Card has expired.'));
    }
  }
  next(); // Proceed with saving if validation passes or no card details provided
});

module.exports = mongoose.model("Booking", bookingSchema);
