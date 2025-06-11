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

    // Update the compound price based on linked apartments
    // Assuming updateCompoundPrice needs the compound object, not just ID
    await updateCompoundPrice(compound._id); 

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
const getAvailableCompounds = async (req, res) => {
  try {
    const { arrival_date, departure_date } = req.body;

    if (!arrival_date || !departure_date) {
      return res
        .status(400)
        .json({ error: 'Both arrival_date and departure_date are required.' });
    }

    const arrivalDate = new Date(arrival_date);
    const departureDate = new Date(departure_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight for comparison

    // Date Validation:
    if (isNaN(arrivalDate.getTime()) || isNaN(departureDate.getTime())) {
        return res.status(400).json({ error: "Invalid arrival or departure date format." });
    }
    if (arrivalDate < today) { // NEW: Arrival date cannot be in the past
        return res.status(400).json({ error: "Arrival date cannot be in the past." });
    }
    if (arrivalDate >= departureDate) { // Departure must be strictly after arrival
        return res.status(400).json({ error: "Departure date must be strictly after arrival date." });
    }

    // Step 1: Find booked apartments
    const bookedApartmentIds = await Booking.find({
      status: 'Confirmed',
      $and: [
        { arrival_date: { $lt: departureDate } },
        { departure_date: { $gt: arrivalDate } },
      ],
    }).distinct('apartment_id');

    // Step 2: Find available apartments and their compounds
    const availableApartments = await Apartment.find({
      _id: { $nin: bookedApartmentIds },
    }).populate('compound');

    if (!availableApartments.length) {
      return res.status(200).json({ compounds: [] });
    }

    // Determine the base URL for images from your backend's perspective
    // This should match how your Node.js server serves the /uploads directory.
    const IMAGE_SERVE_BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;


    const compoundsMap = new Map();

    for (const apartment of availableApartments) {
      const compound = apartment.compound;
      if (!compound) { // Skip if compound population failed for some reason
        console.warn(`Apartment ${apartment._id} has no associated compound.`);
        continue;
      }
      const compoundId = compound._id.toString();

      if (!compoundsMap.has(compoundId)) {
        // Construct the full absolute URL for compound image
        let compoundImageUrl = null;
        if (compound.image) {
            if (compound.image.startsWith('http://') || compound.image.startsWith('https://')) {
                compoundImageUrl = compound.image; // Already an absolute URL (e.g., from Cloudinary)
            } else {
                // Assume it's a relative path (e.g., /uploads/compounds/image.jpg) and prepend BASE_URL
                const imagePath = compound.image.startsWith('/') ? compound.image : `/${compound.image}`;
                compoundImageUrl = `${IMAGE_SERVE_BASE_URL}${imagePath}`;
            }
        }
        
        compoundsMap.set(compoundId, {
          compound: {
            _id: compound._id,
            name: compound.name,
            location: compound.location,
            price_per_night: compound.price_per_night,
            image: compoundImageUrl, // Use the correctly formatted URL
            compound_id: compound.compound_id,
          },
          apartments: [],
        });
      }

      // Add apartment details
      compoundsMap.get(compoundId).apartments.push({
        _id: apartment._id,
        apartment_id: apartment.apartment_id,
        name: apartment.name,
        price_per_night: apartment.price_per_night,
        rooms: apartment.rooms,
        bathrooms: apartment.bathrooms,
        image: apartment.image, // Apartment image URL is likely already absolute/correct from DB
      });
    }

    const updatedCompounds = Array.from(compoundsMap.values());
    res.status(200).json({ compounds: updatedCompounds });
  } catch (error) {
    console.error('Error fetching available compounds:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching available compounds.' });
  }
};

// Optimized Function to update compound prices
const updateCompoundPrice = async (compoundId) => {
  try {
    // Fetch apartments for the compound in a single query
    const apartments = await Apartment.find({ compound: compoundId, price_per_night: { $gt: 0 } });

    if (apartments.length > 0) {
      // Select a random apartment with a valid price
      const randomApartment = apartments[Math.floor(Math.random() * apartments.length)];
      console.log(`Selected Apartment for Compound ${compoundId}:`, randomApartment);

      // Update the compound's price
      await Compound.findByIdAndUpdate(compoundId, {
        price_per_night: randomApartment.price_per_night,
      });
    } else {
      console.warn(`No valid apartments with price > 0 for Compound ${compoundId}.`);
      await Compound.findByIdAndUpdate(compoundId, { price_per_night: 0 });
    }
  } catch (error) {
    console.error(`Error updating price for Compound ${compoundId}:`, error);
  }
};




// Get all compounds with name and max price
const getAllCompounds = async (req, res) => {
  try {
    const compounds = await Compound.find().populate('apartments').lean();

    // Modify each compound to include a full image URL if stored locally
    compounds.forEach((compound) => {
      // Ensure the image URL is correctly formatted for display
      if (compound.image) {
        if (!compound.image.startsWith('http://') && !compound.image.startsWith('https://')) {
            // Prepend base URL if it's a relative path
            const IMAGE_SERVE_BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
            compound.image = `${IMAGE_SERVE_BASE_URL}${compound.image.startsWith('/') ? compound.image : `/${compound.image}`}`;
        }
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
