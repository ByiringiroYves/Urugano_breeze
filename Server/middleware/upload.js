// upload.js

const multer = require('multer');
const path = require('path');

// Dynamic storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Dynamically set the upload directory based on request context
        const uploadType = req.uploadType || 'general'; // Default to 'general' if no type is provided
        let uploadPath;

        switch (uploadType) {
            case 'testimonials':
                uploadPath = path.join(__dirname, '../uploads/testimonials');
                break;
            case 'compounds':
                uploadPath = path.join(__dirname, '../uploads/compounds');
                break;
            case 'apartments':
                uploadPath = path.join(__dirname, '../uploads/apartments');
                break;    
            default:
                uploadPath = path.join(__dirname, '../uploads/general');
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique file name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Middleware to configure Multer
const upload = multer({ storage });

// Middleware function to set upload type dynamically
const setUploadType = (type) => (req, res, next) => {
    req.uploadType = type;
    next();
};

module.exports = { upload, setUploadType };
