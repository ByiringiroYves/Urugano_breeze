// routes/apartmentRoutes.js

const express = require('express');
const router = express.Router();
const apartmentController = require('../controllers/apartmentController'); // Corrected path to apartmentController
const { updateApartmentPriceByName } = require('../controllers/apartmentController');

// Routes for apartments
router.post('/create', apartmentController.createApartment);
router.get('/compound/:compound_id', apartmentController.getApartmentsByCompound);
router.patch('/update-price-by-name/:apartmentName', updateApartmentPriceByName);


module.exports = router;
