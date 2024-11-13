// models/Apartment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const apartmentSchema = new Schema({
  apartment_id: {
    type: Number,
    unique: true,
    required: true,
    default: () => Math.floor(Math.random() * 100) // Random 2-digit number for apartment_id
  },
  name: {
    type: String,
    required: true
  },
  price_per_night: {
    type: Number,
    required: true
  },
  compound: {
    type: Schema.Types.ObjectId,
    ref: 'Compound'
  }
});

// Automatically assign an apartment_id if not provided
apartmentSchema.pre('save', async function (next) {
  if (!this.apartment_id) {
    const lastApartment = await this.constructor.findOne().sort('-apartment_id');
    this.apartment_id = lastApartment ? lastApartment.apartment_id + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Apartment', apartmentSchema);
