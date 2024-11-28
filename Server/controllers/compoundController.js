const Compound = require('../models/Compound');
const Apartment = require('../models/Apartment');
const Booking = require('../models/Booking'); // Assuming bookings are stored in a Booking model


// Function to generate a unique compound_id
async function generateUniqueCompoundId() {
  let compoundId;
  let isUnique = false;

  while (!isUnique) {
      // Generate a random compound_id (1-99)
      compoundId = Math.floor(Math.random() * 99) + 1;

      // Check if this compound_id already exists in the database
      const existingCompound = await Compound.findOne({ compound_id: compoundId });
      if (!existingCompound) {
          isUnique = true;
      }
  }

  return compoundId;
}

// Create a new compound
const createCompound = async (req, res) => {
  try {
    const { name, location } = req.body;
    const uploadedFile = req.file; // Access the uploaded file

    // Generate a unique compound_id
    const compound_id = await generateUniqueCompoundId();

    // Create and save the new compound
    const compound = new Compound({
      compound_id,
      name,
      location,
      price_per_night: 0, // Initialize with a default price
      image: uploadedFile ? `/uploads/compounds/${uploadedFile.filename}` : null, // Save image path
    });

    await compound.save();

    res.status(201).json({
      message: 'Compound created successfully',
      compound,
    });
  } catch (error) {
    console.error('Error creating compound:', error);
    res.status(500).json({ error: 'An error occurred while creating the compound.' });
  }
};


// Search compounds with available apartments based on the selected dates
// Search for available compounds based on arrival and departure dates

// API to search for compounds with available apartments
// Get compounds with available apartments
const getAvailableCompounds = async (req, res) => {
  try {
      const { arrival_date, departure_date } = req.body;

      if (!arrival_date || !departure_date) {
          return res.status(400).json({ error: 'Both arrival_date and departure_date are required.' });
      }

      const arrivalDate = new Date(arrival_date);
      const departureDate = new Date(departure_date);

      // Step 1: Find apartments that are already booked during the requested dates
      const conflictingBookings = await Booking.find({
          status: "Confirmed",
          $and: [
              { arrival_date: { $lt: departureDate } },
              { departure_date: { $gt: arrivalDate } }
          ]
      }).select("apartment_id");

      const bookedApartmentIds = conflictingBookings.map(booking => booking.apartment_id);

      // Step 2: Find apartments that are not booked
      const availableApartments = await Apartment.find({
          _id: { $nin: bookedApartmentIds }
      }).populate("compound"); // Populate compound for each apartment

      // Step 3: Group apartments by compounds
      const compoundsMap = new Map();

      availableApartments.forEach((apartment) => {
          const compoundId = apartment.compound._id.toString();

          if (!compoundsMap.has(compoundId)) {
            const BASE_URL = 'http://localhost:5000';
              compoundsMap.set(compoundId, {
                  compound: {
                      _id: apartment.compound._id,
                      name: apartment.compound.name,
                      location: apartment.compound.location,
                      price_per_night: apartment.compound.price_per_night,
                      image: `${BASE_URL}${apartment.compound.image}`,
                      compound_id: apartment.compound.compound_id,
                  },
                  apartments: []
              });
          }

          // Add only necessary apartment fields
          compoundsMap.get(compoundId).apartments.push({
              _id: apartment._id,
              apartment_id: apartment.apartment_id,
              name: apartment.name,
              price_per_night: apartment.price_per_night,
              rooms: apartment.rooms,
              bathrooms: apartment.bathrooms,
              image: apartment.image,
          });
      });

      // Convert the Map to an array for the response
      const compounds = Array.from(compoundsMap.values());

      res.status(200).json({ compounds });
  } catch (error) {
      console.error('Error fetching available compounds:', error);
      res.status(500).json({ error: 'An error occurred while fetching available compounds.' });
  }
};

// Function to update compound price based on apartments
const updateCompoundPrice = async (compoundId) => {
  const compound = await Compound.findById(compoundId).populate('apartments');
  
  if (compound.apartments.length > 0) {
    const randomApartment = compound.apartments[Math.floor(Math.random() * compound.apartments.length)];
    compound.price_per_night = randomApartment.price_per_night;
  } else {
    compound.price_per_night = 0;
  }

  await compound.save();
};


// Get all compounds with name and max price
const getAllCompounds = async (req, res) => {
  try {
    const compounds = await Compound.find().populate('apartments').lean();

    // Modify each compound to include a full image URL if stored locally
    compounds.forEach((compound) => {
      if (compound.image) {
        compound.image = `${process.env.BASE_URL || 'http://localhost:5000'}${compound.image}`;
      }
    });

    res.status(200).json(compounds);
  } catch (error) {
    console.error('Error fetching compounds:', error);
    res.status(500).json({ error: 'An error occurred while fetching compounds.' });
  }
};

    

// Delete a compound by ID
const deleteCompound = async (req, res) => {
    try {
        const compoundId = req.params.id;

        const compound = await Compound.findById(compoundId);
        if (!compound) {
            return res.status(404).json({ error: 'Compound not found' });
        }

        await Apartment.deleteMany({ _id: { $in: compound.apartments } });
        await Compound.findByIdAndDelete(compoundId);

        res.json({ message: 'Compound and associated apartments deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the compound' });
    }
};

module.exports = {
    createCompound,
    updateCompoundPrice,
    getAllCompounds,
    getAvailableCompounds,
    deleteCompound
};
