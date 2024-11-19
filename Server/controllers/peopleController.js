const People = require('../models/people');

// Search people by name
const searchPeopleByName = async (req, res) => {
  try {
    const { name } = req.query;

    // Validate if the query parameter exists
    if (!name) {
      return res.status(400).json({ error: 'Name query parameter is required.' });
    }

    // Perform a case-insensitive search for names matching the input
    const results = await People.find({
      Clients_Name: { $regex: name, $options: 'i' } // Case-insensitive search
    });

    if (results.length === 0) {
      return res.status(404).json({ message: 'No matching records found.' });
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error('Error searching people:', error);
    res.status(500).json({ error: 'An error occurred while searching for people.' });
  }
};

// Delete a person by ID
const deletePersonById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the person by ID
        const deletedPerson = await People.findByIdAndDelete(id);

        if (!deletedPerson) {
            return res.status(404).json({ error: 'Person not found.' });
        }

        res.status(200).json({
            message: 'Person deleted successfully.',
            person: deletedPerson
        });
    } catch (error) {
        console.error('Error deleting person:', error);
        res.status(500).json({ error: 'An error occurred while deleting the person.' });
    }
};


module.exports = {
    deletePersonById,
  searchPeopleByName,
};
