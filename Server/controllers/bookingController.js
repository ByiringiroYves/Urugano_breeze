const Booking = require('../models/Booking');
const Counter = require('../models/Counter');
const Apartment = require('../models/Apartment'); // Ensure Apartment model is imported to get price
const People = require('../models/people'); // People model

// Function to get next reservation_id
const getNextReservationId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { name: 'reservation_id' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // Create if it doesn't exist
    );
    return counter.seq;
};

// Create a new booking
const createBooking = async (req, res) => {
  try {
      const { apartment_name, guest, email, phone, country, city, arrival_date, departure_date } = req.body;

      // Fetch apartment details based on the name
      const apartment = await Apartment.findOne({ name: apartment_name });
      if (!apartment) {
          return res.status(404).json({ error: `Apartment with name "${apartment_name}" not found.` });
      }

      // Check for overlapping bookings for the same apartment
      const overlappingBooking = await Booking.findOne({
          apartment_id: apartment._id,
          $or: [
              {
                  arrival_date: { $lt: new Date(departure_date) }, // Existing booking starts before the requested departure
                  departure_date: { $gt: new Date(arrival_date) }, // Existing booking ends after the requested arrival
              },
          ],
      });

      if (overlappingBooking) {
          return res.status(400).json({
              error: `The apartment "${apartment_name}" is already booked between ${overlappingBooking.arrival_date.toISOString()} and ${overlappingBooking.departure_date.toISOString()}.`,
          });
      }

      // Calculate nights and total price
      const nights = Math.ceil(
          (new Date(departure_date) - new Date(arrival_date)) / (1000 * 60 * 60 * 24)
      );
      const total_price = nights * apartment.price_per_night;

      // Generate reservation ID
      const reservation_id = await getNextReservationId();

      // Create new booking
      const booking = new Booking({
          reservation_id,
          apartment_id: apartment._id, // ObjectId reference
          apartment_name: apartment.name, // Store the name as well
          guest,
          email,
          phone,
          country,
          city,
          arrival_date,
          departure_date,
          nights,
          total_price,
      });

      // Save booking to database
      await booking.save();
      
      const person = {
        Clients_Name: guest,
        Email: email,
        Phones: phone,
        City: city,
        Country: country,
    };

    // Check for duplicate person by email
    const existingPerson = await People.findOne({ Email: email });
    if (!existingPerson) {
        const newPerson = new People(person);
        await newPerson.save();
    }
      res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "An error occurred while creating the booking." });
  }
};


// Search Compound

// Search available compounds based on arrival and departure dates
const searchAvailableCompounds = async (req, res) => {
  try {
      const { arrival_date, departure_date } = req.body;

      if (!arrival_date || !departure_date) {
          return res.status(400).json({ error: "Arrival and departure dates are required." });
      }

      const arrival = new Date(arrival_date);
      const departure = new Date(departure_date);

      if (arrival >= departure) {
          return res.status(400).json({ error: "Departure date must be later than arrival date." });
      }

      // Find apartments with conflicting bookings
      const unavailableApartmentIds = await Booking.find({
          status: "confirmed", // Only consider confirmed bookings
          $or: [
              {
                  arrival_date: { $lt: departure }, // Booking starts before the requested departure
                  departure_date: { $gt: arrival }, // Booking ends after the requested arrival
              },
          ],
      }).distinct("apartment"); // Get IDs of unavailable apartments

      console.log("Unavailable Apartment IDs:", unavailableApartmentIds);

      // Find apartments that are available (not in the unavailable list)
      const availableApartments = await Apartment.find({
          _id: { $nin: unavailableApartmentIds }, // Exclude unavailable apartments
      }).populate("compound");

      if (!availableApartments.length) {
          return res.status(404).json({ error: "No available apartments found for the given dates." });
      }

      // Group available apartments by compound
      const compoundsMap = new Map();

      availableApartments.forEach((apartment) => {
          const compoundId = apartment.compound._id.toString();

          if (!compoundsMap.has(compoundId)) {
              compoundsMap.set(compoundId, {
                  compound: apartment.compound,
                  total_price: 0,
                  total_nights: Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24)),
                  apartments: [],
              });
          }

          const compoundEntry = compoundsMap.get(compoundId);
          compoundEntry.total_price += apartment.price_per_night * compoundEntry.total_nights;
          compoundEntry.apartments.push(apartment);
      });

      const compounds = Array.from(compoundsMap.values());
      const conflictingBookings = await Booking.find({
        status: "confirmed",
        $or: [
            { arrival_date: { $lt: departure }, departure_date: { $gt: arrival } },
        ],
    });
    console.log("Conflicting Bookings:", conflictingBookings);
    
      
      res.status(200).json({ compounds });
  } catch (error) {
      console.error("Error searching for available compounds:", error);
      res.status(500).json({ error: "An error occurred while searching for available compounds." });
  }
};

// Cancel booking 
const cancelBooking = async (req, res) => {
    try {
        const { reservation_id } = req.params;

        // Find the booking by reservation_id
        const booking = await Booking.findOne({ reservation_id });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        // Update the status to "Canceled"
        booking.status = 'Canceled';
        await booking.save();

        res.status(200).json({ message: 'Booking canceled successfully.', booking });
    } catch (error) {
        console.error('Error canceling booking:', error);
        res.status(500).json({ error: 'An error occurred while canceling the booking.' });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ book_date: -1 }); // Sorting by book date in descending order
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ error: 'An error occurred while fetching bookings.' });
    }
};



//Hide Apertmet 
const hideApartment = async (req, res) => {
    try {
        const { apartment_name, arrival_date, departure_date } = req.body;

        if (!apartment_name || !arrival_date || !departure_date) {
            return res.status(400).json({ error: "Missing required fields: apartment_name, arrival_date, departure_date" });
        }

        const apartment = await Apartment.findOne({ name: apartment_name });
        if (!apartment) {
            return res.status(404).json({ error: `Apartment with name "${apartment_name}" not found.` });
        }

        apartment.calendar_blocks.push({
            arrival_date: new Date(arrival_date),
            departure_date: new Date(departure_date),
        });

        await apartment.save();
        res.status(200).json({ message: `Apartment "${apartment_name}" successfully hidden for the specified period.` });
    } catch (error) {
        console.error("Error hiding apartment:", error);
        res.status(500).json({ error: "An error occurred while hiding the apartment." });
    }
};


//unhide
const unhideApartment = async (req, res) => {
    try {
        const { apartment_name, arrival_date, departure_date } = req.body;

        if (!apartment_name || !arrival_date || !departure_date) {
            return res.status(400).json({ error: "Missing required fields: apartment_name, arrival_date, departure_date" });
        }

        const apartment = await Apartment.findOne({ name: apartment_name });
        if (!apartment) {
            return res.status(404).json({ error: `Apartment with name "${apartment_name}" not found.` });
        }

        apartment.calendar_blocks = apartment.calendar_blocks.filter(
            (block) =>
                !(new Date(block.arrival_date).getTime() === new Date(arrival_date).getTime() &&
                  new Date(block.departure_date).getTime() === new Date(departure_date).getTime())
        );

        await apartment.save();
        res.status(200).json({ message: `Apartment "${apartment_name}" successfully unhidden and available for booking.` });
    } catch (error) {
        console.error("Error unhiding apartment:", error);
        res.status(500).json({ error: "An error occurred while unhiding the apartment." });
    }
};




module.exports = {
    createBooking,
    getAllBookings,
    cancelBooking,
    searchAvailableCompounds,
    hideApartment,
    unhideApartment,
};
