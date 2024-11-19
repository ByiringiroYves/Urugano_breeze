const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Remember to hash passwords in a real app!
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);