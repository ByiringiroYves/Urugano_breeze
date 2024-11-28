const express = require('express');
const router = express.Router();
const { upload, setUploadType } = require('../middleware/upload');
const {
    createApartment,
    getApartmentsByCompound,
    updateApartmentDetailsByName,
    getAvailableApartments,
    getAvailableApartment,
} = require('../controllers/apartmentController');

// Route to create a new apartment (with image upload)
router.post('/create', 
    setUploadType('apartments'), // Specify 'compounds' folder
    upload.single('image'), createApartment);

// Route to get apartments in a specific compound (by compound_id)
router.get('/compound/:compound_id', getApartmentsByCompound);

// Route to update apartment details (with image upload)
router.put('/update/:apartmentName', upload.single('image'), updateApartmentDetailsByName);

router.post('/available-apartments', getAvailableApartments);
router.post('/available-apartment', getAvailableApartment);

module.exports = router;
