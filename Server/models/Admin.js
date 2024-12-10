const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    Fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // Other fields...
});

module.exports = mongoose.model("Admin", AdminSchema);
