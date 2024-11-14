const Apartment = require('../models/Apartment');
const Compound = require('../models/Compound');
const { updateCompoundPrice } = require('../utils/compoundUtils'); // Ensure this path is correct

// Create a new apartment and associate it with a compound
const createApartment = async (req, res) => {
    try {
        const { name, price_per_night, compoundId } = req.body;

        // Find the compound by its ObjectId
        const compound = await Compound.findById(compoundId);
        if (!compound) {
            return res.status(404).json({ error: 'Compound not found.' });
        }

        // Create the apartment with the compound's ObjectId as a reference
        const apartment = new Apartment({
            name,
            price_per_night,
            compound: compound._id // Reference to the compound
        });

        // Save the apartment to the database
        await apartment.save();

        // Add the apartment to the compound's apartments array and save the compound
        compound.apartments.push(apartment._id);
        await compound.save();

        // Update the compound price based on its apartments
        await updateCompoundPrice(compound._id);

        res.status(201).json({
            message: 'Apartment created successfully',
            apartment
        });
    } catch (error) {
        console.error('Error creating apartment:', error);
        res.status(500).json({ error: 'An error occurred while creating the apartment.' });
    }
};

// Get all apartments in a specific compound
const getApartmentsByCompound = async (req, res) => {
    const { compound_id } = req.params;
    try {
        // Check if the compound exists by its custom `compound_id`
        const compound = await Compound.findOne({ compound_id }).populate('apartments');
        if (!compound) {
            return res.status(404).json({ error: `Compound with id ${compound_id} not found.` });
        }

        // Return compound details with all associated apartments
        res.status(200).json({
            compound: {
                compound_id: compound.compound_id,
                name: compound.name,
                location: compound.location,
                price_per_night: compound.price_per_night
            },
            apartments: compound.apartments.map(apartment => ({
                id: apartment._id,
                name: apartment.name,
                price_per_night: apartment.price_per_night
            }))
        });
    } catch (error) {
        console.error('Error fetching apartments:', error);
        res.status(500).json({ error: 'Error fetching apartments', details: error.message });
    }
};

// Update price per night for a specific apartment by name
const updateApartmentPriceByName = async (req, res) => {
    try {
        const { apartmentName } = req.params;
        const { price_per_night } = req.body;

        // Find the apartment by name and update the price
        const apartment = await Apartment.findOneAndUpdate(
            { name: apartmentName },
            { price_per_night },
            { new: true } // Return the updated document
        );

        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found.' });
        }

        // Update compound price based on new apartment prices
        await updateCompoundPrice(apartment.compound);

        res.status(200).json({
            message: 'Apartment price updated successfully',
            apartment,
        });
    } catch (error) {
        console.error('Error updating apartment price:', error);
        res.status(500).json({ error: 'An error occurred while updating the apartment price.' });
    }
};


module.exports = {
    createApartment,
    getApartmentsByCompound,
    updateApartmentPriceByName
};
