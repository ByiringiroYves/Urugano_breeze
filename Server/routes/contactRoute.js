const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/contactController');

// Route to handle contact form submissions
router.post('/', sendContactEmail);
router.get('/test', (req, res) => {
    res.status(200).send('Contact Route Works');
});

module.exports = router;
