const express = require('express');
const { searchPeopleByName, deletePersonById } = require('../controllers/peopleController');

const router = express.Router();

// Search people by name
router.get('/search', searchPeopleByName);
router.delete('/:id', deletePersonById);

module.exports = router;
