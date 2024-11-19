const Compound = require('../models/Compound');
const Apartment = require('../models/Apartment');


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

      // Generate a unique compound_id
      const compound_id = await generateUniqueCompoundId();

      // Create and save the new compound
      const compound = new Compound({
          compound_id,
          name,
          location,
          price_per_night: 0, // Initialize with a default price
      });

      await compound.save();

      res.status(201).json({
          message: 'Compound created successfully',
          compound
      });
  } catch (error) {
      console.error('Error creating compound:', error);
      res.status(500).json({ error: 'An error occurred while creating the compound.' });
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
    // Fetch all compounds and populate each with the apartments belonging to it
    const compounds = await Compound.find().populate({
      path: 'apartments',
      populate: { path: 'compound', select: 'name' } // Adjust as necessary
    }).lean();

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
    deleteCompound
};