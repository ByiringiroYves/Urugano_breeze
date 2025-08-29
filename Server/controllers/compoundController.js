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
    today.setHours(0, 0, 0, 0);

    // Date validation
    if (isNaN(arrivalDate.getTime()) || isNaN(departureDate.getTime())) {
      return res.status(400).json({ error: 'Invalid arrival or departure date format.' });
    }
    if (arrivalDate < today) {
      return res.status(400).json({ error: 'Arrival date cannot be in the past.' });
    }
    if (arrivalDate >= departureDate) {
      return res.status(400).json({ error: 'Departure date must be strictly after arrival date.' });
    }

    // Step 1: Find booked apartment IDs
    const bookedApartmentIds = await Booking.find({
      status: 'Confirmed',
      $and: [
        { arrival_date: { $lt: departureDate } },
        { departure_date: { $gt: arrivalDate } },
      ],
    }).distinct('apartment_id');

    // Step 2: Use MongoDB Aggregation to find and group available apartments
    const compounds = await Apartment.aggregate([
      // Filter out booked apartments
      {
        $match: {
          _id: { $nin: bookedApartmentIds },
        },
      },
      // Join with the 'compounds' collection
      {
        $lookup: {
          from: 'compounds', // The collection name in your DB
          localField: 'compound', // Field on the Apartment schema (ObjectId)
          foreignField: '_id', // Field on the Compound schema
          as: 'compoundDetails',
        },
      },
      // The lookup returns an array, so we must destructure it
      {
        $unwind: '$compoundDetails',
      },
      // Group by compound and add apartments to an array
      {
        $group: {
          _id: '$compoundDetails._id',
          compound: { $first: '$compoundDetails' },
          apartments: {
            $push: {
              _id: '$_id',
              apartment_id: '$apartment_id',
              name: '$name',
              price_per_night: '$price_per_night',
              rooms: '$rooms',
              bathrooms: '$bathrooms',
              image: '$image',
            },
          },
        },
      },
      // Project to the final desired format
      {
        $project: {
          _id: 0,
          compound: {
            _id: '$compound._id',
            name: '$compound.name',
            location: '$compound.location',
            price_per_night: '$compound.price_per_night',
            image: '$compound.image',
            compound_id: '$compound.compound_id',
          },
          apartments: '$apartments',
        },
      },
    ]);

    // Handle image URLs (This is the only remaining manual step)
    const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
    const formattedCompounds = compounds.map(c => {
        let compoundImageUrl = null;
        if (c.compound.image) {
            compoundImageUrl =
              c.compound.image.startsWith('http://') || c.compound.image.startsWith('https://')
                ? c.compound.image
                : `${BASE_URL}${c.compound.image.startsWith('/') ? c.compound.image : '/' + c.compound.image}`;
        }
        return {
            ...c,
            compound: { ...c.compound, image: compoundImageUrl }
        };
    });

    res.status(200).json({ compounds: formattedCompounds });
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
