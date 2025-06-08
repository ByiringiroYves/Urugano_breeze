const Booking = require('../models/Booking');
const Counter = require('../models/Counter'); // Assuming you have a Counter model for reservation_id
const Apartment = require('../models/Apartment'); // Ensure Apartment model is imported
const People = require('../models/people'); // Ensure People model is imported (check casing if it's 'People' or 'people')
const nodemailer = require('nodemailer'); // Required for sending emails
const path = require('path'); // Required for resolving email template paths
const crypto = require('crypto'); // Required for generating secure tokens
require('dotenv').config();

// Helper function to format dates for emails (NEW: Defined on backend)
const formatDateForEmail = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toISOString().split('T')[0]; // Formats to YYYY-MM-DD
};


// Function to get next reservation_id
const getNextReservationId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { name: 'reservation_id' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
};

// Function to send booking confirmation email
const sendBookingConfirmationEmail = async (recipientEmail, guestName, reservationId, bookingDetailsUrl) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail", // Use your email service
            auth: {
                user: process.env.EMAIL_USER, // Your email address from .env
                pass: process.env.EMAIL_PASSWORD, // Your email password from .env
            },
        });

        // Adjust logoPath if your uploads directory is structured differently relative to bookingController.js
        const logoPath = path.join(__dirname, "../uploads/email/logo.png"); 
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `GOGO Homes & Apartment: Your Booking Confirmation #${reservationId}`,
            html: `
                <p>Dear ${guestName},</p>
                <p>Thank you for booking with GOGO Homes & Apartment!</p>
                <p>Your reservation (ID: <strong>#${reservationId}</strong>) has been confirmed.</p>
                <p>You can view and manage your booking details here: <a href="${bookingDetailsUrl}">${bookingDetailsUrl}</a></p>
                <p>We look forward to hosting you!</p>
                <p>Best regards,<br>The GOGO Homes & Apartment Team<br>
                <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a><br>
                +45-40641002</p>
                <img src="cid:unique@signature" alt="GOGO Logo" style="width: 250px; height: 50px;" />
            `,
            attachments: [
                {
                    filename: "logo.png",
                    path: logoPath,
                    cid: "unique@signature", // Unique ID for the image
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log(`Booking confirmation email sent to ${recipientEmail} for reservation #${reservationId}`);
    } catch (error) {
        console.error("Error sending booking confirmation email:", error);
        // Log the error but don't re-throw to avoid blocking the createBooking response
    }
};

// Function to send booking cancellation email
const sendCancellationConfirmationEmail = async (recipientEmail, guestName, reservationId) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const logoPath = path.join(__dirname, "../uploads/email/logo.png"); 
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `GOGO Homes & Apartment: Your Booking Cancellation Confirmation #${reservationId}`,
            html: `
                <p>Dear ${guestName},</p>
                <p>This is to confirm that your reservation (ID: <strong>#${reservationId}</strong>) has been successfully **canceled**.</p>
                <p>If you have any questions or require further assistance, please do not hesitate to contact us.</p>
                <p>Best regards,<br>The GOGO Homes & Apartment Team<br>
                <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a><br>
                +45-40641002</p>
                <img src="cid:unique@signature" alt="GOGO Logo" style="width: 250px; height: 50px;" />
            `,
            attachments: [
                {
                    filename: "logo.png",
                    path: logoPath,
                    cid: "unique@signature",
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log(`Cancellation confirmation email sent to ${recipientEmail} for reservation #${reservationId}`);
    } catch (error) {
        console.error("Error sending cancellation email:", error);
    }
};

// Function to send booking modification email
const sendModificationConfirmationEmail = async (recipientEmail, guestName, reservationId, bookingDetailsUrl, updatedFields) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const logoPath = path.join(__dirname, "../uploads/email/logo.png"); 
        
        let updatedDetailsHtml = '';
        // Use formatDateForEmail here, which is now defined in this controller
        if (updatedFields.new_arrival_date) updatedDetailsHtml += `<p><strong>New Arrival Date:</strong> ${formatDateForEmail(updatedFields.new_arrival_date)}</p>`;
        if (updatedFields.new_departure_date) updatedDetailsHtml += `<p><strong>New Departure Date:</strong> ${formatDateForEmail(updatedFields.new_departure_date)}</p>`;
        if (updatedFields.new_apartment_name) updatedDetailsHtml += `<p><strong>New Apartment:</strong> ${updatedFields.new_apartment_name}</p>`;


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `GOGO Homes & Apartment: Your Reservation Update Confirmation #${reservationId}`,
            html: `
                <p>Dear ${guestName},</p>
                <p>This is to confirm that your reservation (ID: <strong>#${reservationId}</strong>) has been successfully **updated**.</p>
                ${updatedDetailsHtml}
                <p>You can view your updated booking details here: <a href="${bookingDetailsUrl}">${bookingDetailsUrl}</a></p>
                <p>If you did not make these changes, please contact us immediately.</p>
                <p>Best regards,<br>The GOGO Homes & Apartment Team<br>
                <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a><br>
                +45-40641002</p>
                <img src="cid:unique@signature" alt="GOGO Logo" style="width: 250px; height: 50px;" />
            `,
            attachments: [
                {
                    filename: "logo.png",
                    path: logoPath,
                    cid: "unique@signature",
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log(`Modification confirmation email sent to ${recipientEmail} for reservation #${reservationId}`);
    } catch (error) {
        console.error("Error sending modification email:", error);
    }
};


// Create a new booking
const createBooking = async (req, res) => {
  try {
      // Destructure all expected fields from req.body, including new ones
      const {
          apartment_name,
          guest,          // Full Name from billing
          email,
          phone,
          country,        // Billing country
          city,           // Billing city
          street_address, // New: Billing street address
          arrival_date,
          departure_date,
          // --- Raw Card Information (for educational/test purposes ONLY) ---
          cardName,       // Name on card from your form
          cardNum,        // Card number from your form
          expMonth,       // Expiry month from your form
          expYear,        // Expiry year from your form
          cvv             // CVV from your form
      } = req.body;

      // --- Basic Input Validation (Expand as needed for all fields) ---
      const requiredFields = {
          apartment_name, guest, email, phone, country, city,
          arrival_date, departure_date
      };
      for (const [field, value] of Object.entries(requiredFields)) {
          if (!value) {
              return res.status(400).json({ error: `Missing required field: ${field}` });
          }
      }
      // Add more specific validation (e.g., email format, date validity, card number format)

      // Fetch apartment details based on the name
      const apartment = await Apartment.findOne({ name: apartment_name });
      if (!apartment) {
          return res.status(404).json({ error: `Apartment with name "${apartment_name}" not found.` });
      }

      // --- Check for overlapping bookings for the same apartment ---
      const arrDate = new Date(arrival_date);
      const depDate = new Date(departure_date);
      if (isNaN(arrDate.getTime()) || isNaN(depDate.getTime()) || depDate <= arrDate) {
          return res.status(400).json({ error: "Invalid arrival or departure date." });
      }

      const overlappingBooking = await Booking.findOne({
          apartment_id: apartment._id,
          status: { $ne: 'Canceled' }, // Consider only non-canceled bookings
          $or: [
              {
                  arrival_date: { $lt: depDate },
                  departure_date: { $gt: arrDate },
              },
          ],
      });

      if (overlappingBooking) {
          return res.status(400).json({
              error: `The apartment "${apartment_name}" is already booked between ${overlappingBooking.arrival_date.toISOString().split('T')[0]} and ${overlappingBooking.departure_date.toISOString().split('T')[0]}.`,
          });
      }

      // Calculate nights and total price
      const nights = Math.ceil(
          (depDate - arrDate) / (1000 * 60 * 60 * 24)
      );
      if (nights <= 0) {
        return res.status(400).json({ error: "Departure date must be after arrival date, resulting in at least 1 night." });
      }
      const total_price = nights * apartment.price_per_night;

      // Generate reservation ID
      const reservation_id = await getNextReservationId();
      // NEW: Generate cryptographically strong secure token
      const secure_token = crypto.randomBytes(32).toString('hex'); // 64-character hex string

      // Create new booking object with all details
      const booking = new Booking({
          reservation_id,
          apartment_id: apartment._id,
          apartment_name: apartment.name,
          guest,
          email,
          phone,
          country,
          city,
          street_address, // Added street_address
          arrival_date: arrDate,
          departure_date: depDate,
          nights,
          total_price,
          secure_token, // NEW: Save the secure token with the booking
          // --- Storing Raw Card Information (Educational/Test Purposes ONLY) ---
          card_name_on: cardName,
          card_number: cardNum,
          card_exp_month: expMonth,
          card_exp_year: expYear,
          card_cvv: cvv,
          // status: "Confirmed" // Default is set in schema
      });

      // Save booking to database (pre-save hook in schema will validate card expiry)
      await booking.save();
      
      // --- Create or Update Person/Client record ---
      const personData = {
        Clients_Name: guest,
        Email: email,
        Phones: phone,
        City: city,
        Country: country,
        Street_Address: street_address, // Added street_address to People model
    };

    // Check for duplicate person by email and update or create
    await People.findOneAndUpdate(
        { Email: email },
        { $set: personData },
        { upsert: true, new: true, runValidators: true }
    );

    // --- Send Booking Confirmation Email with secure_token in the URL ---
    // Dynamically choose frontendBaseUrl based on the request origin for email links
    const frontendBaseUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'; 
    const bookingDetailsUrl = `${frontendBaseUrl}/html/bookingdetails.html?reservation_id=${booking.reservation_id}&token=${booking.secure_token}`;
    
    sendBookingConfirmationEmail(booking.email, booking.guest, booking.reservation_id, bookingDetailsUrl)
        .catch(err => console.error("Error sending booking confirmation email:", err)); // Log error, but don't block response

      res.status(201).json({ message: "Booking created successfully. Payment due at property.", booking });
  } catch (error) {
      console.error("Error creating booking:", error);
      if (error.name === 'ValidationError') {
        // Mongoose validation validation error (e.g., from pre-save hook like card expiry)
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ error: messages.join(', ') });
      }
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
          status: "Confirmed", // Only consider confirmed bookings (not 'Canceled')
          $or: [
              {
                  arrival_date: { $lt: departure }, // Booking starts before the requested departure
                  departure_date: { $gt: arrival }, // Booking ends after the requested arrival
              },
          ],
      }).distinct("apartment_id"); // Get IDs of unavailable apartments

      // console.log("Unavailable Apartment IDs:", unavailableApartmentIds);

      // Find apartments that are available (not in the unavailable list)
      // Also consider calendar_blocks from Apartment model
      const availableApartments = await Apartment.find({
          _id: { $nin: unavailableApartmentIds },
          $not: { // Ensure the requested period does not overlap with any calendar_block
              calendar_blocks: {
                  $elemMatch: {
                      arrival_date: { $lt: departure },
                      departure_date: { $gt: arrival }
                  }
              }
          }
      }).populate("compound"); // Assuming Apartment schema has a 'compound' field to populate

      if (!availableApartments.length) {
          return res.status(404).json({ error: "No available apartments found for the given dates." });
      }

      // Group available apartments by compound
      const compoundsMap = new Map();
      const total_nights_for_stay = Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));

      availableApartments.forEach((apartment) => {
          // Ensure apartment.compound is populated and has an _id
          if (!apartment.compound || !apartment.compound._id) {
              console.warn(`Apartment ${apartment._id} is missing compound data or compound._id`);
              return; // Skip this apartment if compound data is missing
          }
          const compoundId = apartment.compound._id.toString();

          if (!compoundsMap.has(compoundId)) {
              compoundsMap.set(compoundId, {
                  compound: apartment.compound, // The populated compound object
                  total_price_for_stay_in_compound: 0, // Initialize price for this compound
                  total_nights: total_nights_for_stay,
                  apartments_in_compound: [],
              });
          }

          const compoundEntry = compoundsMap.get(compoundId);
          compoundEntry.total_price_for_stay_in_compound += apartment.price_per_night * total_nights_for_stay;
          compoundEntry.apartments_in_compound.push(apartment);
      });

      const compounds = Array.from(compoundsMap.values());
      // const conflictingBookings = await Booking.find({
      //   status: "Confirmed",
      //   $or: [
      //       { arrival_date: { $lt: departure }, departure_date: { $gt: arrival } },
      //   ],
      // });
      // console.log("Conflicting Bookings:", conflictingBookings);
    
      
      res.status(200).json({ compounds });
  } catch (error) {
      console.error("Error searching for available compounds:", error);
      res.status(500).json({ error: "An error occurred while searching for available compounds." });
  }
};

// Get a single booking by reservation_id AND secure_token
const getBookingById = async (req, res) => {
    try {
        const { reservation_id } = req.params; // Expect reservation_id from URL params
        const { token } = req.query; // NEW: Expect token from query parameters

        if (!reservation_id || !token) {
            return res.status(400).json({ error: 'Reservation ID and token are required.' });
        }

        // Find the booking by BOTH reservation_id and secure_token
        const booking = await Booking.findOne({ 
            reservation_id: parseInt(reservation_id),
            secure_token: token
        }); 

        if (!booking) {
            // Return 404 or 403 to indicate not found or unauthorized access
            return res.status(404).json({ error: 'Booking not found or unauthorized access.' });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error('Error fetching single booking:', error);
        res.status(500).json({ error: 'An error occurred while fetching booking details.' });
    }
};

// NEW: Update Booking Function
const updateBooking = async (req, res) => {
    try {
        const { reservation_id } = req.params; // Get reservation_id from URL params
        const { token, new_arrival_date, new_departure_date, new_apartment_name } = req.body; // Get data from body

        // 1. Validate required fields (reservation_id, token, and at least one new date/apartment)
        if (!reservation_id || !token || (!new_arrival_date && !new_departure_date && !new_apartment_name)) {
            return res.status(400).json({ error: 'Reservation ID, token, and at least one field (dates or apartment) to update are required.' });
        }

        // 2. Find the booking by reservation_id AND secure_token for authorization
        const booking = await Booking.findOne({
            reservation_id: parseInt(reservation_id),
            secure_token: token
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or unauthorized to update.' });
        }

        if (booking.status === 'Canceled') {
            return res.status(400).json({ error: 'Cannot modify a canceled booking.' });
        }

        let updateFields = {};
        let apartmentToUpdate = booking.apartment_name;
        let newArrDate = booking.arrival_date;
        let newDepDate = booking.departure_date;
        let apartmentObj = null; // To hold the new apartment's details if name changes

        // 3. Handle new apartment name if provided
        if (new_apartment_name && new_apartment_name !== booking.apartment_name) {
            apartmentObj = await Apartment.findOne({ name: new_apartment_name });
            if (!apartmentObj) {
                return res.status(404).json({ error: `New apartment "${new_apartment_name}" not found.` });
            }
            updateFields.apartment_id = apartmentObj._id;
            updateFields.apartment_name = apartmentObj.name;
            apartmentToUpdate = apartmentObj.name; // Use new name for availability check
        } else {
            // If apartment name is not changing, get current apartment object for price_per_night
            apartmentObj = await Apartment.findById(booking.apartment_id);
            if (!apartmentObj) {
                return res.status(404).json({ error: `Original apartment "${booking.apartment_name}" not found.` });
            }
        }

        // 4. Handle new dates if provided
        if (new_arrival_date) {
            newArrDate = new Date(new_arrival_date);
            if (isNaN(newArrDate.getTime())) {
                return res.status(400).json({ error: "Invalid new arrival date format." });
            }
            updateFields.arrival_date = newArrDate;
        }
        if (new_departure_date) {
            newDepDate = new Date(new_departure_date);
            if (isNaN(newDepDate.getTime())) {
                return res.status(400).json({ error: "Invalid new departure date format." });
            }
            updateFields.departure_date = newDepDate;
        }

        // Re-validate date order after updates
        if (newDepDate <= newArrDate) {
            return res.status(400).json({ error: "New departure date must be after new arrival date." });
        }

        // 5. Check for availability of the NEW dates for the (potentially new) apartment
        const overlappingBooking = await Booking.findOne({
            _id: { $ne: booking._id }, // Exclude the current booking from the check
            apartment_id: updateFields.apartment_id || booking.apartment_id, // Use new ID or old ID
            status: { $ne: 'Canceled' },
            $or: [
                {
                    arrival_date: { $lt: newDepDate },
                    departure_date: { $gt: newArrDate },
                },
            ],
        });

        if (overlappingBooking) {
            return res.status(400).json({
                error: `The apartment "${apartmentToUpdate}" is not available for the new dates. It is booked between ${overlappingBooking.arrival_date.toISOString().split('T')[0]} and ${overlappingBooking.departure_date.toISOString().split('T')[0]}.`,
            });
        }
        
        // Also check against calendar_blocks if changing dates
        const updatedApartmentCheck = apartmentObj || await Apartment.findById(updateFields.apartment_id || booking.apartment_id);
        if (updatedApartmentCheck && updatedApartmentCheck.calendar_blocks && updatedApartmentCheck.calendar_blocks.length > 0) {
            const blockedOverlap = updatedApartmentCheck.calendar_blocks.some(block => 
                (newArrDate < block.departure_date && newDepDate > block.arrival_date)
            );
            if (blockedOverlap) {
                return res.status(400).json({ error: `The apartment "${apartmentToUpdate}" is blocked for maintenance during the new selected dates.` });
            }
        }


        // 6. Recalculate nights and total price based on new dates and/or apartment price
        const newNights = Math.ceil(
            (newDepDate - newArrDate) / (1000 * 60 * 60 * 24)
        );
        updateFields.nights = newNights;
        // Use the price_per_night of the *new* apartment if it changed, otherwise the original
        updateFields.total_price = newNights * (apartmentObj ? apartmentObj.price_per_night : booking.total_price / booking.nights);


        // 7. Update the booking
        const updatedBooking = await Booking.findOneAndUpdate(
            { reservation_id: parseInt(reservation_id), secure_token: token },
            { $set: updateFields },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );

        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found or unauthorized to update.' });
        }

        // --- NEW: Send Modification Confirmation Email ---
        const frontendBaseUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'; 
        const bookingDetailsUrl = `${frontendBaseUrl}/html/bookingdetails.html?reservation_id=${updatedBooking.reservation_id}&token=${updatedBooking.secure_token}`;
        
        sendModificationConfirmationEmail(
            updatedBooking.email, 
            updatedBooking.guest, 
            updatedBooking.reservation_id, 
            bookingDetailsUrl, 
            {
                new_arrival_date: new_arrival_date ? formatDateForEmail(new_arrival_date) : formatDateForEmail(booking.arrival_date), // Use formatDateForEmail here
                new_departure_date: new_departure_date ? formatDateForEmail(new_departure_date) : formatDateForEmail(booking.departure_date), // Use formatDateForEmail here
                new_apartment_name: new_apartment_name ? new_apartment_name : booking.apartment_name,
            }
        ).catch(err => console.error("Error sending modification confirmation email:", err));

        res.status(200).json({ message: 'Booking updated successfully.', booking: updatedBooking });

    } catch (error) {
        console.error("Error updating booking:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: `Validation Error: ${messages.join(', ')}` });
        }
        res.status(500).json({ error: "An error occurred while updating the booking." });
    }
};


// Cancel booking by reservation_id AND secure_token
const cancelBooking = async (req, res) => {
    try {
        const { reservation_id } = req.params; // Assuming reservation_id is passed as a URL parameter
        const { token } = req.body; // NEW: Expect token from request body for PATCH

        if (!reservation_id || !token) {
            return res.status(400).json({ error: 'Reservation ID and token are required.' });
        }

        // Find the booking by BOTH reservation_id and secure_token
        const booking = await Booking.findOne({ 
            reservation_id: parseInt(reservation_id),
            secure_token: token
        }); 

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or unauthorized to cancel.' });
        }

        if (booking.status === 'Canceled') {
            return res.status(400).json({ error: 'Booking is already canceled.' });
        }

        // Update the status to "Canceled"
        booking.status = 'Canceled';
        await booking.save();

        // --- NEW: Send Cancellation Confirmation Email ---
        sendCancellationConfirmationEmail(
            booking.email, 
            booking.guest, 
            booking.reservation_id
        ).catch(err => console.error("Error sending cancellation email:", err));

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


//Hide Apartment (using calendar_blocks in Apartment model)
const hideApartment = async (req, res) => {
    try {
        const { apartment_name, arrival_date, departure_date } = req.body;

        if (!apartment_name || !arrival_date || !departure_date) {
            return res.status(400).json({ error: "Missing required fields: apartment_name, arrival_date, departure_date" });
        }

        const arrDate = new Date(arrival_date);
        const depDate = new Date(departure_date);

        if (isNaN(arrDate.getTime()) || isNaN(depDate.getTime()) || depDate <= arrDate) {
            return res.status(400).json({ error: "Invalid arrival or departure date for hiding." });
        }

        const apartment = await Apartment.findOne({ name: apartment_name });
        if (!apartment) {
            return res.status(404).json({ error: `Apartment with name "${apartment_name}" not found.` });
        }

        // Ensure calendar_blocks array exists
        if (!apartment.calendar_blocks) {
            apartment.calendar_blocks = [];
        }

        // Check for overlapping blocks to avoid duplicates or overly complex overlaps
        const existingBlock = apartment.calendar_blocks.find(block =>
            (arrDate < block.departure_date && depDate > block.arrival_date)
        );
        if (existingBlock) {
            return res.status(400).json({ error: `Apartment "${apartment_name}" already has an overlapping blocked period.` });
        }


        apartment.calendar_blocks.push({
            arrival_date: arrDate,
            departure_date: depDate,
            reason: req.body.reason || "Maintenance or Blocked" // Optional reason
        });

        await apartment.save();
        res.status(200).json({ message: `Apartment "${apartment_name}" successfully hidden/blocked for the specified period.` });
    }
    catch (error) {
        console.error("Error hiding apartment:", error);
        res.status(500).json({ error: "An error occurred while hiding the apartment." });
    }
};


//Unhide Apartment (removing a specific block from calendar_blocks)
const unhideApartment = async (req, res) => {
    try {
        const { apartment_name, block_id } = req.body; // Assuming you pass a block_id to identify which block to remove

        if (!apartment_name || !block_id) {
            return res.status(400).json({ error: "Missing required fields: apartment_name and block_id" });
        }

        const apartment = await Apartment.findOne({ name: apartment_name });
        if (!apartment) {
            return res.status(404).json({ error: `Apartment with name "${apartment_name}" not found.` });
        }

        if (!apartment.calendar_blocks || apartment.calendar_blocks.length === 0) {
            return res.status(400).json({ error: `Apartment "${apartment_name}" has no blocked periods to unhide.` });
        }

        const initialBlockCount = apartment.calendar_blocks.length;
        // Pull (remove) the block with the matching _id
        apartment.calendar_blocks.pull({ _id: block_id });


        if (apartment.calendar_blocks.length === initialBlockCount) {
             return res.status(404).json({ error: `Block with ID "${block_id}" not found for apartment "${apartment_name}".` });
        }

        await apartment.save();
        res.status(200).json({ message: `Specified block removed for apartment "${apartment_name}". It may now be available if not otherwise booked.` });
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
    getBookingById,
    updateBooking // IMPORTANT: Export the new function
};