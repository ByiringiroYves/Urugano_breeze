// utils/compoundUtils.js

const Compound = require('../models/Compound');

const updateCompoundPrice = async (compoundId) => {
    try {
        const compound = await Compound.findById(compoundId).populate('apartments');

        if (!compound) {
            throw new Error('Compound not found');
        }

        // Select a random apartment's price if apartments are available
        if (compound.apartments.length > 0) {
            const randomIndex = Math.floor(Math.random() * compound.apartments.length);
            const selectedApartment = compound.apartments[randomIndex];
            compound.price_per_night = selectedApartment.price_per_night;
        } else {
            compound.price_per_night = 0; // Default to 0 if no apartments
        }

        await compound.save();
    } catch (error) {
        console.error('Error updating compound price:', error);
    }
};

module.exports = {
    updateCompoundPrice
};
