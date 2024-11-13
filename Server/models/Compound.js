// models/Compound.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const compoundSchema = new Schema({
  compound_id: {
    type: Number,
    unique: true,
    required: true,
    default: () => Math.floor(Math.random() * 100) // Random 2-digit number for compound_id
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price_per_night: {
    type: Number,
    default: 0 // Initial price set to 0, will update based on apartments
  },
  apartments: [{
    type: Schema.Types.ObjectId,
    ref: 'Apartment'
  }]
});

module.exports = mongoose.model('Compound', compoundSchema);