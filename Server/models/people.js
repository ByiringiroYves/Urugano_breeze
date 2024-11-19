// models/People.js
const mongoose = require('mongoose');

const PeopleSchema = new mongoose.Schema({
    Clients_Name: {
        type: String,
        required: true,
        trim: true,
    },
    Email: {
        type: String,
        required: true,
        unique: true, // Ensures no duplicate emails are added
        trim: true,
        lowercase: true,
    },
    Phones: {
        type: String,
        required: true,
    },
    City: {
        type: String,
        required: true,
        trim: true,
    },
    Country: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('People', PeopleSchema);
