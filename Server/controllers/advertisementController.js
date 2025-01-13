const nodemailer = require('nodemailer');
const People = require('../models/people');
const path = require('path');
const twilio = require('twilio');
const cloudinary = require('cloudinary').v2;
const axios = require('axios'); // For making HTTP requests
const FormData = require('form-data');
const fs = require('fs');

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_FROM;

// Validate Twilio environment variables
if (!accountSid || !authToken || !fromWhatsAppNumber) {
    console.error('Twilio configuration is missing. Ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM are set.');
}
const client = twilio(accountSid, authToken);
// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Function to send advertisement
const sendAdvertisement = async (req, res) => {
    try {
        const { advertisementText } = req.body;
        const uploadedFile = req.file;

        if (!advertisementText) {
            return res.status(400).json({ error: 'Advertisement text is required.' });
        }

        // Upload image to Cloudinary if provided
        let imageUrl = null;
        if (uploadedFile) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(uploadedFile.path, {
                    folder: 'advertisements',
                });
                imageUrl = uploadResponse.secure_url;
            } catch (error) {
                console.error('Error uploading to Cloudinary:', error);
                return res.status(500).json({ error: 'Failed to upload image to Cloudinary.' });
            }
        }

        // Fetch people from the database
        const people = await People.find().lean();

        // Email sending
        const emailPromises = people.map(async (person) => {
            const email = person.Email?.trim();
            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Check updates on GOGO Homes & Apartments',
                    text: advertisementText,
                    attachments: imageUrl ? [{ filename: path.basename(imageUrl), path: imageUrl }] : [],
                };
                return transporter.sendMail(mailOptions).catch((error) => {
                    console.error(`Failed to send email to ${email}:`, error.message);
                });
            }
            return Promise.resolve();
        });

        // WhatsApp sending with Twilio API
        const whatsappPromises = people.map(async (person) => {
            const phone = person.Phones?.trim(); // The recipient's phone number
            if (phone && /^\+\d+$/.test(phone)) { // Ensure the phone number is valid and includes a country code
                const messageBody = `*Check updates on GOGO Homes & Apartments*\n\n${advertisementText}`;

                try {
                    // If there's an uploaded image, send the message with media
                    const message = await client.messages.create({
                        from: `whatsapp:${fromWhatsAppNumber}`, // Twilio WhatsApp sender number
                        to: `whatsapp:${phone}`, // Recipient's phone number in WhatsApp format
                        body: messageBody, // Text message
                        mediaUrl: imageUrl ? [imageUrl] : undefined, // Attach the uploaded image URL
                    });

                    console.log(`WhatsApp message sent to ${phone}:`, message.sid);
                } catch (error) {
                    console.error(`Failed to send WhatsApp message to ${phone}:`, error.message || error);
                }
            } else {
                console.warn(`Invalid phone number format for WhatsApp: ${phone}`);
            }
            return Promise.resolve(); // Skip invalid phone numbers
        });

        // Wait for all promises
        await Promise.all([...emailPromises, ...whatsappPromises]);

        res.status(200).json({ message: 'Advertisement sent successfully via email and WhatsApp!' });
    } catch (error) {
        console.error('Error sending advertisement:', error);
        res.status(500).json({ error: 'An error occurred while sending the advertisement.' });
    }
};

module.exports = {
    sendAdvertisement,
};
