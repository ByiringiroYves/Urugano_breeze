// routes/apartmentRoutes.js

const express = require('express');
const router = express.Router();
const apartmentController = require('../controllers/apartmentController'); // Corrected path to apartmentController

// Routes for apartments
router.post('/create', apartmentController.createApartment);
router.get('/compound/:compound_id', apartmentController.getApartmentsByCompound);

module.exports = router;
