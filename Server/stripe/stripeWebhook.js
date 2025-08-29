const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { STRIPE_WEBHOOK_SECRET } = require('../connection/config');
const Booking = require('../models/Booking');
const Apartment = require('../models/Apartment');
const { sendBookingConfirmationEmail, sendWelcomeEmail, getNextReservationId } = require('../controllers/bookingController');
const People = require('../models/people');
const crypto = require('crypto');

// Helper function to format dates
const formatDateForEmail = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toISOString().split('T')[0];
};

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Stripe Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event based on its type
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const sessionMetadata = session.metadata;

            console.log(`Checkout Session Completed. Session ID: ${session.id}`);
            console.log('Session metadata:', sessionMetadata);

            try {
                if (session.mode === 'setup') {
                    // Get data from metadata
                    const { apartment_name, guest, email, phone, country, city, street_address, arrival_date, departure_date, nights, total_price } = sessionMetadata;

                    // Fetch apartment details and validate again
                    const apartment = await Apartment.findOne({ name: apartment_name });
                    if (!apartment) {
                         throw new Error(`Apartment with name "${apartment_name}" not found.`);
                    }

                    // Create the booking record in the database
                    const arrDate = new Date(arrival_date);
                    const depDate = new Date(departure_date);
                    const reservation_id = await getNextReservationId();
                    const secure_token = crypto.randomBytes(32).toString('hex');
                    
                    const newBooking = new Booking({
                        reservation_id, apartment_id: apartment._id, apartment_name,
                        guest, email, phone, country, city, street_address,
                        arrival_date: arrDate, departure_date: depDate, nights: parseInt(nights), total_price: parseInt(total_price), secure_token,
                        status: 'Pending Pre-authorization',
                    });
                    
                    const setupIntentId = session.setup_intent;
                    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
                    const paymentMethodId = setupIntent.payment_method;

                    // Now, create the PaymentIntent to pre-authorize the amount (one night's price)
                    const oneNightPrice = apartment.price_per_night;

                    const paymentIntent = await stripe.paymentIntents.create({
                        amount: oneNightPrice,
                        currency: 'rwf', // RWF is zero-decimal
                        payment_method: paymentMethodId,
                        customer: session.customer,
                        capture_method: 'manual', // Pre-authorize the amount
                        off_session: true,
                        metadata: { booking_id: newBooking._id.toString(), reservation_id: newBooking.reservation_id },
                    });

                    newBooking.stripe_payment_intent_id = paymentIntent.id;
                    newBooking.status = 'Confirmed';
                    await newBooking.save();

                    // Save the person's data
                    const personData = { Clients_Name: guest, Email: email, Phones: phone, City: city, Country: country, Street_Address: street_address };
                    await People.findOneAndUpdate({ Email: email }, { $set: personData }, { upsert: true, new: true, runValidators: true });
                    
                    // Send confirmation email
                    const frontendBaseUrl = process.env.FRONTEND_URL || process.env.FRONTEND_WWW || process.env.LOCAL_TEST || 'http://localhost:3000';
                    const bookingDetailsUrl = `${frontendBaseUrl}/html/bookingdetails.html?reservation_id=${newBooking.reservation_id}&token=${newBooking.secure_token}`;
                    
                    sendBookingConfirmationEmail(email, guest, newBooking.reservation_id, bookingDetailsUrl, arrDate, apartment.price_per_night, parseInt(nights), parseInt(total_price));

                    console.log(`Booking #${newBooking.reservation_id} created, pre-authorized, and confirmed via webhook.`);

                } else if (session.mode === 'payment') {
                    // This is the case where a direct payment was made
                    const reservationId = sessionMetadata.reservation_id;
                    const booking = await Booking.findOne({ reservation_id: parseInt(reservationId) });
                    if (booking) {
                         booking.status = 'Paid';
                         booking.stripe_payment_intent_id = session.payment_intent;
                         await booking.save();
                    }
                }
            } catch (error) {
                console.error("Error processing checkout.session.completed webhook:", error);
                // In case of error, you might want to log it and potentially notify an administrator
                // For a booking initiated via checkout session, if it fails here, the booking is never created.
            }
            break;

        case 'payment_intent.payment_failed':
            const paymentIntentFailed = event.data.object;
            const reservationIdFailed = paymentIntentFailed.metadata.reservation_id;
            console.error(`Payment Intent Failed for Reservation #${reservationIdFailed}`);
            const bookingFailed = await Booking.findOne({ reservation_id: parseInt(reservationIdFailed) });
            if (bookingFailed) {
                 bookingFailed.status = 'Pre-authorization Failed';
                 await bookingFailed.save();
            }
            break;

        case 'charge.refunded':
            const chargeRefunded = event.data.object;
            const reservationIdRefunded = chargeRefunded.metadata.reservation_id;
            console.log(`Charge Refunded for Reservation #${reservationIdRefunded}`);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

module.exports = { handleStripeWebhook };