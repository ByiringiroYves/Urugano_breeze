// controllers/bookingController.js
const Booking = require('../models/Booking');
const Counter = require('../models/Counter');
const Apartment = require('../models/Apartment'); // Ensure Apartment model is imported to get price
const People = require('../models/people');   // People model

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
        const { property, guest, email, phone, country, city, arrival_date, departure_date} = req.body;

        // Fetch apartment price
        const apartment = await Apartment.findOne({ name: property });
        if (!apartment) {
            return res.status(404).json({ error: `${property} not found.` });
        }

        // Calculate nights and total price
        const nights = Math.ceil((new Date(departure_date) - new Date(arrival_date)) / (1000 * 60 * 60 * 24));
        const total_price = nights * apartment.price_per_night;

        // Get the next reservation_id
        const reservation_id = await getNextReservationId();

        // Create new booking document
        const booking = new Booking({
            reservation_id,
            property,
            guest,
            email,
            phone,
            country,
            city,
            arrival_date,
            departure_date,
            nights,
            total_price
        });
        
        // Save to database

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
      
        res.status(201).json({ message: 'Booking created successfully', booking });
      } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'An error occurred while creating the booking.' });
    }
};


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

module.exports = {
    createBooking,
    getAllBookings,
    cancelBooking
};
