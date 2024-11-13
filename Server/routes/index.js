// routes/index.js

const express = require('express');
const adminRoutes = require('./admin');
const apartmentRoutes = require('./apartmentRoutes');
const compoundRoutes = require('./compoundRoutes');

const router = express.Router();

// Attach each route to its respective path
router.use('/admin', adminRoutes);
router.use('/apartments', apartmentRoutes);
router.use('/compounds', compoundRoutes);

module.exports = router;
