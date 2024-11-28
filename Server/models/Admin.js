const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        confirmationCode: { type: Number, default: null }, // 6-digit code
        codeExpiresAt: { type: Date, default: null }, // Expiration time for the code
    },
    { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
