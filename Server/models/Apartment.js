// models/Apartment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApartmentSchema = new mongoose.Schema({
  apartment_id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  price_per_night: { type: Number, required: true },
  rooms: { type: Number },
  bathrooms: { type: Number },
  image: { type: String },
  compound: { type: mongoose.Schema.Types.ObjectId, ref: 'Compound' },
});

module.exports = mongoose.model('Apartment', ApartmentSchema);