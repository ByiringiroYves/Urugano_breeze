// routes/compoundRoutes.js
const express = require('express');
const compoundController = require('../controllers/compoundController');
const router = express.Router();
const { deleteCompound } = require('../controllers/compoundController');

// Route to create a compound
router.post('/create', compoundController.createCompound);

// Route to get all compounds
router.get('/', compoundController.getAllCompounds);

// delete a compound 
router.delete('/:id', deleteCompound);

module.exports = router;
