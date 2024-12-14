const express = require('express');
const { searchPeopleByName, deletePersonById } = require('../controllers/peopleController');
const { authenticateJWT } = require('../controllers/adminController'); // Import JWT middleware

const router = express.Router();

// Search people by name
router.get('/search', searchPeopleByName);
router.delete('/:id', deletePersonById);

// Admin Feature Page (Protected Route)
router.get('/admin-feature', authenticateJWT, (req, res) => {
    res.sendFile(path.join(__dirname, '../UI/html/people.html')); // Serve the admin dashboard page
});

module.exports = router;
