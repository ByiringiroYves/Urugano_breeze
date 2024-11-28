const Booking = require('../models/Booking');
const Apartment = require('../models/Apartment');
const Compound = require('../models/Compound');
const { updateCompoundPrice } = require('../utils/compoundUtils'); // Ensure this path is correct

// Create a new apartment and associate it with a compound
const generateUniqueApartmentId = async () => {
    let apartmentId;
    let isUnique = false;

    while (!isUnique) {
        // Generate a random apartment_id (1-9999)
        apartmentId = Math.floor(Math.random() * 9999) + 1;

        // Check if this apartment_id already exists in the database
        const existingApartment = await Apartment.findOne({ apartment_id: apartmentId });
        if (!existingApartment) {
            isUnique = true;
        }
    }

    return apartmentId;
};

const createApartment = async (req, res) => {
    try {
        const { name, price_per_night, compoundId, rooms, bathrooms } = req.body;
        const imageFile = req.file;

        // Find the compound by its ObjectId
        const compound = await Compound.findById(compoundId);
        if (!compound) {
            return res.status(404).json({ error: 'Compound not found.' });
        }

        // Generate a unique apartment_id
        const apartment_id = await generateUniqueApartmentId();

        // Create the apartment object
        const apartment = new Apartment({
            apartment_id,
            name,
            price_per_night,
            rooms,
            bathrooms,
            image: imageFile ? imageFile.path : null, // Store image path
            compound: compound._id, // Reference to the compound
        });

        // Save the apartment
        await apartment.save();

        // Add the apartment to the compound's apartments array and save the compound
        compound.apartments.push(apartment._id);
        await compound.save();

        res.status(201).json({
            message: 'Apartment created successfully',
            apartment,
        });
    } catch (error) {
        console.error('Error creating apartment:', error);
        res.status(500).json({ error: 'An error occurred while creating the apartment.' });
    }
};


const getAvailableApartments = async (req, res) => {
    try {
        const { arrival_date, departure_date } = req.body;

        if (!arrival_date || !departure_date) {
            return res.status(400).json({ error: "Arrival and departure dates are required." });
        }

        const unavailableApartmentIds = await Booking.find({
            status: "Confirmed", // Ensure correct case
            $and: [
                { arrival_date: { $lt: new Date(departure_date) } },
                { departure_date: { $gt: new Date(arrival_date) } }
            ]
        }).distinct("apartment_id");

        const availableApartments = await Apartment.find({
            _id: { $nin: unavailableApartmentIds },
        });

        if (!availableApartments.length) {
            return res.status(404).json({ error: "No available apartments found for the given dates." });
        }

        res.status(200).json({ availableApartments });
    } catch (error) {
        console.error("Error fetching available apartments:", error);
        res.status(500).json({ error: "An error occurred while fetching available apartments." });
    }
};

const getAvailableApartment = async (req, res) => {
    try {
        const { arrival_date, departure_date, apartment_name } = req.body;

        if (!arrival_date || !departure_date || !apartment_name) {
            return res.status(400).json({ error: "Arrival date, departure date, and apartment name are required." });
        }

        // Check if the apartment is unavailable
        const unavailableApartments = await Booking.find({
            apartment_name,
            status: "Confirmed",
            $and: [
                { arrival_date: { $lt: new Date(departure_date) } },
                { departure_date: { $gt: new Date(arrival_date) } }
            ]
        });

        if (unavailableApartments.length) {
            return res.status(404).json({ error: `${apartment_name} is booked for the selected dates.` });
        }

        res.status(200).json({ message: `${apartment_name} is available for the selected dates.` });
    } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({ error: "An error occurred while checking availability." });
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
                price_per_night: apartment.price_per_night,
                rooms: apartment.rooms,
                bathrooms: apartment.bathrooms,
                image: apartment.image, // Include image in response
            }))
        });
    } catch (error) {
        console.error('Error fetching apartments:', error);
        res.status(500).json({ error: 'Error fetching apartments', details: error.message });
    }
};

// Update price, rooms, and bathrooms for a specific apartment by name
const updateApartmentDetailsByName = async (req, res) => {
    try {
        const { apartmentName } = req.params;
        const { price_per_night, rooms, bathrooms } = req.body;

        // Check if an image is uploaded
        const image = req.file ? req.file.path : undefined;

        // Find the apartment by name and update the price, rooms, and bathrooms
        const updateFields = { price_per_night, rooms, bathrooms };
        if (image) updateFields.image = image; // Only update the image if it's provided

        const apartment = await Apartment.findOneAndUpdate(
            { name: apartmentName },
            updateFields,
            { new: true } // Return the updated document
        );

        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found.' });
        }

        // Update compound price based on new apartment details
        await updateCompoundPrice(apartment.compound);

        res.status(200).json({
            message: 'Apartment details updated successfully',
            apartment,
        });
    } catch (error) {
        console.error('Error updating apartment details:', error);
        res.status(500).json({ error: 'An error occurred while updating the apartment details.' });
    }
};



module.exports = {
    createApartment,
    getApartmentsByCompound,
    updateApartmentDetailsByName,
    getAvailableApartments,
    getAvailableApartment,
};
