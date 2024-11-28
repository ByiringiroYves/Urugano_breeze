// routes/compoundRoutes.js
const express = require('express');
const compoundController = require('../controllers/compoundController');
const router = express.Router();
const { upload, setUploadType } = require('../middleware/upload');
const { deleteCompound } = require('../controllers/compoundController');
const { getAvailableCompounds } = require('../controllers/compoundController');

// Route to create a compound
router.post('/create', setUploadType('compounds'), // Specify 'compounds' folder
    upload.single('image'), // Handle single file upload
    compoundController.createCompound
);

// Route to get all compounds
router.get('/', compoundController.getAllCompounds);

router.post('/search', getAvailableCompounds);

// delete a compound 
router.delete('/:id', deleteCompound);

module.exports = router;
