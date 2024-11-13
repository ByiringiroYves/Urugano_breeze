const Admin = require('../models/Admin'); // Assuming you have an Admin model

// Controller to create an admin user
exports.createAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Add validation here as needed
        const admin = new Admin({ username, email, password });
        await admin.save();

        res.status(201).json({ message: 'Admin created successfully', admin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the admin user' });
    }
};
