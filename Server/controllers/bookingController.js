const Booking = require('../models/Booking');
const Counter = require('../models/Counter');
const Apartment = require('../models/Apartment');
const People = require('../models/people');
const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Initialize Stripe

// Helper function to format dates for emails
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

// Nodemailer Transporter Configuration (Using Gmail SMTP with App Password)
const transporter = nodemailer.createTransport({
    service: "gmail", // Explicitly use 'gmail' service
    auth: {
        user: process.env.EMAIL_USER,    // Your Gmail address from .env
        pass: process.env.EMAIL_PASSWORD, // Your Gmail App Password from .env
    },
});

// Function to send a welcome email after payment is confirmed
const sendWelcomeEmail = async (recipientEmail, guestName, reservationId) => {
    try {
        const logoPath = path.join(__dirname, "../uploads/email/logo.png");
        const mailOptions = {
            from: process.env.EMAIL_FROM_ADDRESS,
            to: recipientEmail,
            subject: `Welcome to Gogo Villas! Your Reservation #${reservationId}'s Payment is Confirmed.`,
            html: `
                <p>Dear ${guestName},</p>
                <p>We are delighted to confirm that your payment for reservation #${reservationId} has been successfully processed.</p>
                <p>We look forward to welcoming you to Gogo Villas!</p>
                <p>Best regards,<br>The GOGO Villas Team</p>
                <img src="cid:unique@signature" alt="GOGO Logo" style="width: 250px; height: 50px;" />
            `,
            attachments: [{ filename: "logo.png", path: logoPath, cid: "unique@signature" }],
        };
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${recipientEmail} for reservation #${reservationId}`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

// Function to send booking confirmation email
const sendBookingConfirmationEmail = async (recipientEmail, guestName, reservationId, bookingDetailsUrl, arrivalDate, pricePerNight, nights, total_price) => {
    try {
        const logoPath = path.join(__dirname, "../uploads/email/logo.png"); 
        
        const freeCancellationDeadline = new Date(arrivalDate);
        freeCancellationDeadline.setHours(23, 59, 59, 999);
        const formattedDeadline = freeCancellationDeadline.toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short'
        });

        const lateCancellationFee = pricePerNight;

        const mailOptions = {
            from: process.env.EMAIL_FROM_ADDRESS,
            to: recipientEmail,
            subject: `Gogo Villas: Your Booking Confirmation #${reservationId}`,
            html: `
                <p>Dear ${guestName},</p>
                <p>Thank you for booking with Gogo Villas!</p>
                <p>Your reservation (ID: <strong>#${reservationId}</strong>) has been confirmed.</p>
                <p>A hold has been placed on your card for RWF ${lateCancellationFee.toLocaleString()} (equal to one night's price of the booked apartment) as a cancellation fee guarantee.</p>
                <p>The total amount of RWF ${total_price.toLocaleString()} is due upon arrival at the property.</p>
                <p>You can view and manage your booking details here: <a href="${bookingDetailsUrl}">${bookingDetailsUrl}</a></p>
                <p>We look forward to hosting you!</p>

                <p style="margin-top: 20px; font-weight: bold;">NOTICE: Cancellation Policy</p>
                <p>You have a free cancellation fee until **midnight of ${formatDateForEmail(arrivalDate)}** (${formattedDeadline}).</p>
                <p>After this deadline, the held amount of **RWF ${lateCancellationFee.toLocaleString()}** will be charged.</p>

                <p>Should you have any questions or need assistance, please do not hesitate to contact us</p>
                
                <p>Best regards,<br>The GOGO Villas Team<br>
                <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a><br>
                +45-40641002</p>
                <img src="cid:unique@signature" alt="GOGO Logo" style="width: 250px; height: 50px;" />
            `,
            attachments: [{ filename: "logo.png", path: logoPath, cid: "unique@signature" }],
        };

        await transporter.sendMail(mailOptions);
        console.log(`Booking confirmation email sent to ${recipientEmail} for reservation #${reservationId}`);
    } catch (error) {
        console.error("Error sending booking confirmation email:", error);
    }
};


// Function to send booking cancellation email
const sendCancellationConfirmationEmail = async (recipientEmail, guestName, reservationId) => {
    try {
        const logoPath = path.join(__dirname, "../uploads/email/logo.png"); 
        
        const mailOptions = {
            from: process.env.EMAIL_FROM_ADDRESS, // Use consistent EMAIL_FROM_ADDRESS
            to: recipientEmail,
            subject: `Gogo Villas: Your Booking Cancellation Confirmation #${reservationId}`,
            html: `
                <p>Dear ${guestName},</p>
                <p>This is to confirm that your reservation (ID: <strong>#${reservationId}</strong>) has been successfully **canceled**.</p>
                <p>If you have any questions or require further assistance, please do not hesitate to contact us.</p>
                <p>Best regards,<br>The GOGO Villas Team<br>

                <p>should you have any questions or need assistance, please do not hesitate to contact us</p>

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
// MODIFIED: Added total_price and nights parameters to the function signature
const sendModificationConfirmationEmail = async (recipientEmail, guestName, reservationId, bookingDetailsUrl, updatedFields, nights, total_price) => {
    try {
        const logoPath = path.join(__dirname, "../uploads/email/logo.png"); 
        
        let updatedDetailsHtml = '';
        if (updatedFields.new_arrival_date) updatedDetailsHtml += `<p><strong>New Arrival Date:</strong> ${formatDateForEmail(updatedFields.new_arrival_date)}</p>`;
        if (updatedFields.new_departure_date) updatedDetailsHtml += `<p><strong>New Departure Date:</strong> ${formatDateForEmail(updatedFields.new_departure_date)}</p>`; 
        if (updatedFields.new_apartment_name) updatedDetailsHtml += `<p><strong>New Apartment:</strong> ${updatedFields.new_apartment_name}</p>`;
        
        // NEW: Add total nights and total amount to modification email
        updatedDetailsHtml += `<p><strong>Total Nights:</strong> ${nights}</p>`;
        updatedDetailsHtml += `<p><strong>Total Amount:</strong> RWF ${total_price.toLocaleString()} (Payment Handled via Stripe)</p>`; // Modified line


        const mailOptions = {
            from: process.env.EMAIL_FROM_ADDRESS, 
            to: recipientEmail,
            subject: `Gogo Villas: Your Reservation Update Confirmation #${reservationId}`,
            html: `
                <p>Dear ${guestName},</p>
                <p>This is to confirm that your reservation (ID: <strong>#${reservationId}</strong>) has been successfully **updated**.</p>
                ${updatedDetailsHtml}
                <p>You can view your updated booking details here: <a href="${bookingDetailsUrl}">${bookingDetailsUrl}</a></p>
                <p>If you did not make these changes, please contact us immediately.</p>
                <p>Best regards,<br>The GOGO Villa Team<br>
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


// NEW: Function to initiate a booking and create a Stripe session
const initiateBooking = async (req, res) => {
    try {
        const {
            apartment_name, guest, email, phone, country, city, street_address, arrival_date, departure_date
        } = req.body;

        const requiredFields = { apartment_name, guest, email, phone, country, city, arrival_date, departure_date };
        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        const apartment = await Apartment.findOne({ name: apartment_name });
        if (!apartment) {
            return res.status(404).json({ error: `Apartment with name "${apartment_name}" not found.` });
        }

        const arrDate = new Date(arrival_date);
        const depDate = new Date(departure_date);
        if (isNaN(arrDate.getTime()) || isNaN(depDate.getTime()) || depDate <= arrDate) {
            return res.status(400).json({ error: "Invalid arrival or departure date." });
        }

        const overlappingBooking = await Booking.findOne({
            apartment_id: apartment._id,
            status: { $nin: ['Canceled', 'Paid'] },
            $or: [
                { arrival_date: { $lt: depDate }, departure_date: { $gt: arrDate } },
            ],
        });

        if (overlappingBooking) {
            return res.status(400).json({
                error: `The apartment "${apartment_name}" is already booked between ${overlappingBooking.arrival_date.toISOString().split('T')[0]} and ${overlappingBooking.departure_date.toISOString().split('T')[0]}.`,
            });
        }

        const nights = Math.ceil((depDate - arrDate) / (1000 * 60 * 60 * 24));
        if (nights <= 0) {
            return res.status(400).json({ error: "Departure date must be after arrival date, resulting in at least 1 night." });
        }
        const total_price = nights * apartment.price_per_night;

        const frontendBaseUrl = process.env.FRONTEND_URL || process.env.FRONTEND_WWW || process.env.LOCAL_TEST || 'http://localhost:3000';
        const successUrl = `${frontendBaseUrl}/html/thankyou.html`;
        const cancelUrl = `${frontendBaseUrl}/html/userdata.html?apartmentName=${encodeURIComponent(apartment_name)}&totalAmount=${total_price}&arrivalDate=${arrival_date}&departureDate=${departure_date}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'setup',
            customer_email: email,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                apartment_name, guest, email, phone, country, city, street_address,
                arrival_date, departure_date, nights: nights.toString(), total_price: total_price.toString(),
            },
        });

        res.status(201).json({ message: "Booking initiated. Redirecting to payment.", stripeSessionUrl: session.url });
    } catch (error) {
        console.error("Error initiating booking:", error);
        res.status(500).json({ error: "An error occurred while initiating the booking." });
    }
};


// Search Compound
const searchAvailableCompounds = async (req, res) => {
  try {
      const { arrival_date, departure_date } = req.body;

      if (!arrival_date || !departure_date) {
          return res.status(400).json({ error: "Arrival and departure dates are required." });
      }

      const arrival = new Date(arrival_date);
      const departure = new Date(departure_date);

      if (arrival >= departure) {
          return res.status(400).json({ error: "Departure date must be strictly after arrival date." });
      }
      if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) { 
        return res.status(400).json({ error: "Invalid arrival or departure date format." });
      }


      const unavailableApartmentIds = await Booking.find({
          status: { $ne: 'Canceled' }, 
          $or: [
              { arrival_date: { $lt: departure }, departure_date: { $gt: arrival } },
          ],
      }).distinct("apartment_id"); 

      const availableApartments = await Apartment.find({
          _id: { $nin: unavailableApartmentIds },
          $not: { 
              calendar_blocks: { $elemMatch: { arrival_date: { $lt: departure }, departure_date: { $gt: arrival } } }
          }
      }).populate("compound"); 

      if (!availableApartments.length) {
          return res.status(404).json({ error: "No available apartments found for the given dates." });
      }

      const compoundsMap = new Map();
      const total_nights_for_stay = Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));

      availableApartments.forEach((apartment) => {
          if (!apartment.compound || !apartment.compound._id) {
              console.warn(`Apartment ${apartment._id} is missing compound data or compound._id`);
              return; 
          }
          const compoundId = apartment.compound._id.toString();

          if (!compoundsMap.has(compoundId)) {
              compoundsMap.set(compoundId, {
                  compound: apartment.compound, 
                  total_price_for_stay_in_compound: 0, 
                  total_nights: total_nights_for_stay,
                  apartments_in_compound: [],
              });
          }

          const compoundEntry = compoundsMap.get(compoundId);
          compoundEntry.total_price_for_stay_in_compound += apartment.price_per_night * total_nights_for_stay;
          compoundEntry.apartments_in_compound.push(apartment);
      });

      const compounds = Array.from(compoundsMap.values());
      res.status(200).json({ compounds });
  } catch (error) {
      console.error("Error searching for available compounds:", error);
      res.status(500).json({ error: "An error occurred while searching for available compounds." });
  }
};

// Get a single booking by reservation_id AND secure_token
const getBookingById = async (req, res) => {
    try {
        const { reservation_id } = req.params; 
        const { token } = req.query; 

        if (!reservation_id || !token) {
            return res.status(400).json({ error: 'Reservation ID and token are required.' });
        }

        const booking = await Booking.findOne({ 
            reservation_id: parseInt(reservation_id),
            secure_token: token
        }); 

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or unauthorized access.' });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error('Error fetching single booking:', error);
        res.status(500).json({ error: 'An error occurred while fetching booking details.' });
    }
};

// Update Booking Function
const updateBooking = async (req, res) => {
    try {
        const { reservation_id } = req.params; 
        const { token, new_arrival_date, new_departure_date, new_apartment_name } = req.body; 

        if (!reservation_id || !token || (!new_arrival_date && !new_departure_date && !new_apartment_name)) {
            return res.status(400).json({ error: 'Reservation ID, token, and at least one field (dates or apartment) to update are required.' });
        }

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
        let apartmentObj = null; 

        if (new_apartment_name && new_apartment_name !== booking.apartment_name) {
            apartmentObj = await Apartment.findOne({ name: new_apartment_name });
            if (!apartmentObj) {
                return res.status(404).json({ error: `New apartment "${new_apartment_name}" not found.` });
            }
            updateFields.apartment_id = apartmentObj._id;
            updateFields.apartment_name = apartmentObj.name;
            apartmentToUpdate = apartmentObj.name; 
        } else {
            apartmentObj = await Apartment.findById(booking.apartment_id);
            if (!apartmentObj) {
                return res.status(404).json({ error: `Original apartment "${booking.apartment_name}" not found.` });
            }
        }

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

        if (newDepDate <= newArrDate) {
            return res.status(400).json({ error: "New departure date must be after new arrival date." });
        }

        const overlappingBooking = await Booking.findOne({
            _id: { $ne: booking._id }, 
            apartment_id: updateFields.apartment_id || booking.apartment_id, 
            status: { $ne: 'Canceled' },
            $or: [
                { arrival_date: { $lt: newDepDate }, departure_date: { $gt: newArrDate } },
            ],
        });

        if (overlappingBooking) {
            return res.status(400).json({
                error: `The apartment "${apartmentToUpdate}" is not available for the new dates. It is booked between ${overlappingBooking.arrival_date.toISOString().split('T')[0]} and ${overlappingBooking.departure_date.toISOString().split('T')[0]}.`,
            });
        }
        
        const updatedApartmentCheck = apartmentObj || await Apartment.findById(updateFields.apartment_id || booking.apartment_id);
        if (updatedApartmentCheck && updatedApartmentCheck.calendar_blocks && updatedApartmentCheck.calendar_blocks.length > 0) {
            const blockedOverlap = updatedApartmentCheck.calendar_blocks.some(block => 
                (newArrDate < block.departure_date && newDepDate > block.arrival_date)
            );
            if (blockedOverlap) {
                return res.status(400).json({ error: `The apartment "${apartmentToUpdate}" is blocked for maintenance during the new selected dates.` });
            }
        }


        const newNights = Math.ceil(
            (newDepDate - newArrDate) / (1000 * 60 * 60 * 24)
        );
        updateFields.nights = newNights;
        updateFields.total_price = newNights * (apartmentObj ? apartmentObj.price_per_night : booking.total_price / booking.nights);


        const updatedBooking = await Booking.findOneAndUpdate(
            { reservation_id: parseInt(reservation_id), secure_token: token },
            { $set: updateFields },
            { new: true, runValidators: true } 
        );

        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found or unauthorized to update.' });
        }

        const frontendBaseUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'; 
        const bookingDetailsUrl = `${frontendBaseUrl}/html/bookingdetails.html?reservation_id=${updatedBooking.reservation_id}&token=${updatedBooking.secure_token}`;
        
        sendModificationConfirmationEmail(
            updatedBooking.email, 
            updatedBooking.guest, 
            updatedBooking.reservation_id, 
            bookingDetailsUrl, 
            {
                new_arrival_date: new_arrival_date ? formatDateForEmail(new_arrival_date) : formatDateForEmail(booking.arrival_date), 
                new_departure_date: new_departure_date ? formatDateForEmail(new_departure_date) : formatDateForEmail(booking.departure_date), 
                new_apartment_name: new_apartment_name ? new_apartment_name : booking.apartment_name,
            },
            newNights, // Pass nights to the email function
            updatedBooking.total_price // Pass total_price to the email function
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
        const { reservation_id } = req.params;
        const { token } = req.body;

        if (!reservation_id || !token) {
            return res.status(400).json({ error: 'Reservation ID and token are required.' });
        }

        const booking = await Booking.findOne({ reservation_id: parseInt(reservation_id), secure_token: token });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or unauthorized to cancel.' });
        }
        if (booking.status === 'Canceled') {
            return res.status(400).json({ error: 'Booking is already canceled.' });
        }

        const today = new Date();
        const arrivalDate = new Date(booking.arrival_date);

        if (booking.stripe_payment_intent_id) {
            if (today < arrivalDate) {
                // Cancellation is timely, release the pre-authorization
                await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
                console.log(`Pre-authorization for reservation #${booking.reservation_id} canceled.`);
                booking.status = 'Canceled';
                await booking.save();
                sendCancellationConfirmationEmail(booking.email, booking.guest, booking.reservation_id);
                return res.status(200).json({ message: 'Booking canceled successfully. Pre-authorization released.', booking });
            } else {
                // Late cancellation, capture the pre-authorized amount
                const capturedIntent = await stripe.paymentIntents.capture(booking.stripe_payment_intent_id);
                console.log(`Pre-authorized amount for reservation #${booking.reservation_id} captured as a late cancellation fee.`);
                booking.status = 'Canceled (Late Fee Charged)';
                await booking.save();
                sendCancellationConfirmationEmail(booking.email, booking.guest, booking.reservation_id);
                return res.status(200).json({ message: 'Booking canceled successfully. Late cancellation fee charged.', booking });
            }
        } else {
            // No payment intent exists, just update status
            booking.status = 'Canceled';
            await booking.save();
            sendCancellationConfirmationEmail(booking.email, booking.guest, booking.reservation_id);
            return res.status(200).json({ message: 'Booking canceled successfully.', booking });
        }
    } catch (error) {
        console.error('Error canceling booking:', error);
        res.status(500).json({ error: 'An error occurred while canceling the booking.' });
    }
};


// NEW: Function to be called by the admin to mark a booking as paid
const markBookingAsPaid = async (req, res) => {
    try {
        const { reservation_id } = req.params;
        const booking = await Booking.findOne({ reservation_id: parseInt(reservation_id) });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }
        if (booking.status === 'Paid') {
            return res.status(400).json({ error: 'Booking is already marked as paid.' });
        }
        if (booking.status === 'Canceled') {
            return res.status(400).json({ error: 'Cannot mark a canceled booking as paid.' });
        }

        // Release the pre-authorized amount
        if (booking.stripe_payment_intent_id) {
            await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
            console.log(`Pre-authorization for reservation #${booking.reservation_id} released.`);
        }

        booking.status = 'Paid';
        await booking.save();

        // Send a welcome email to the customer
        sendWelcomeEmail(booking.email, booking.guest, booking.reservation_id);

        res.status(200).json({ message: `Booking #${reservation_id} marked as paid successfully.`, booking });
    } catch (error) {
        console.error("Error marking booking as paid:", error);
        res.status(500).json({ error: "An error occurred while marking the booking as paid." });
    }
};





const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ book_date: -1 }); 
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

        if (!apartment.calendar_blocks) {
            apartment.calendar_blocks = [];
        }

        const existingBlock = apartment.calendar_blocks.find(block =>
            (arrDate < block.departure_date && depDate > block.arrival_date)
        );
        if (existingBlock) {
            return res.status(400).json({ error: `Apartment "${apartment_name}" already has an overlapping blocked period.` });
        }


        apartment.calendar_blocks.push({
            arrival_date: arrDate,
            departure_date: depDate,
            reason: req.body.reason || "Maintenance or Blocked" 
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
        const { apartment_name, block_id } = req.body; 

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


// NEW: Controller to cancel multiple bookings

// NEW: Controller to cancel multiple bookings

const cancelMultipleBookings = async (req, res) => {

    try {

        const { reservationIds } = req.body; // Expect an array of objects: [{ reservation_id: id }, ...]



        if (!reservationIds || !Array.isArray(reservationIds) || reservationIds.length === 0) {

            return res.status(400).json({ error: 'No bookings provided for cancellation.' });

        }



        const failedCancellations = [];

        const cancellationPromises = [];



        for (const reservation_id of reservationIds) { // Iterate directly over IDs

            cancellationPromises.push((async () => {

                try {

                    const booking = await Booking.findOne({

                        reservation_id: parseInt(reservation_id) // Find by ID only

                    });



                    if (!booking) {

                        console.warn(`Booking #${reservation_id} not found.`);

                        return { success: false, reservation_id, error: 'Booking not found.' };

                    }



                    if (booking.status === 'Canceled') {

                        console.warn(`Booking #${reservation_id} already canceled.`);

                        return { success: false, reservation_id, error: 'Booking already canceled.' };

                    }



                    booking.status = 'Canceled';

                    await booking.save();



                    // Send cancellation confirmation email for each

                    sendCancellationConfirmationEmail(

                        booking.email,

                        booking.guest,

                        booking.reservation_id

                    ).catch(err => console.error(`Error sending email for cancellation of #${booking.reservation_id}:`, err));



                    return { success: true, reservation_id };

                } catch (error) {

                    console.error(`Error canceling booking #${reservation_id}:`, error);

                    return { success: false, reservation_id, error: error.message || 'Internal server error.' };

                }

            })());

        }



        const results = await Promise.allSettled(cancellationPromises);

        const successfulCancellations = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

        const failedCancellationsReport = results.filter(r => r.status === 'fulfilled' && !r.value.success).map(r => r.value);

        // Also capture rejections, if any promise rejected

        results.filter(r => r.status === 'rejected').forEach(r => failedCancellationsReport.push({ reservation_id: 'N/A', error: r.reason.message || 'Promise rejected' }));



        if (successfulCancellations === 0 && failedCancellationsReport.length > 0) {

            return res.status(400).json({

                message: `Failed to cancel all bookings. Details: ${failedCancellationsReport.map(f => `ID ${f.reservation_id}: ${f.error}`).join('; ')}`,

                failedCancellations: failedCancellationsReport

            });

        }



        res.status(200).json({

            message: `${successfulCancellations} booking(s) cancelled successfully. ${failedCancellationsReport.length > 0 ? `(${failedCancellationsReport.length} failed)` : ''}`,

            successfulCancellations: successfulCancellations,

            failedCancellations: failedCancellationsReport

        });



    } catch (error) {

        console.error('Error in cancelMultipleBookings controller:', error);

        res.status(500).json({ error: 'An unexpected error occurred while processing multiple cancellations.' });

    }

};



module.exports = {
    initiateBooking,
    getAllBookings,
    cancelBooking,
    searchAvailableCompounds,
    hideApartment,
    unhideApartment,
    getBookingById,
    updateBooking,
    cancelMultipleBookings,
    markBookingAsPaid, // NEW export
};