// models/Compound.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const compoundSchema = new mongoose.Schema({
  compound_id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  price_per_night: { type: Number, default: 0 },
  image: { type: String }, // Field to store the image URL or path
  apartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Apartment' }],
});

module.exports = mongoose.model('Compound', compoundSchema);
