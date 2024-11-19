const express = require('express');
const multer = require('multer');
const path = require('path');
const { sendAdvertisement } = require('../controllers/advertisementController');

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/ads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

// Route to send advertisement
router.post('/send', upload.single('advertisement_image'), sendAdvertisement);

module.exports = router;
