// controllers/searchController.js

const Apartment = require('../models/Apartment');

exports.searchApartments = async (req, res) => {
    const { location, checkIn, checkOut, guests } = req.query;

    try {
        const apartments = await Apartment.find({
            location: new RegExp(location, 'i'),
            availableDates: { $gte: checkIn, $lte: checkOut },
            maxGuests: { $gte: guests }
        });
        res.json(apartments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
