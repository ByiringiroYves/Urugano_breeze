const nodemailer = require('nodemailer');
const People = require('../models/people');
const path = require('path');
// const twilio = require('twilio'); // Twilio library import
// const cloudinary = require('cloudinary').v2; // Cloudinary library import
const axios = require('axios'); // For making HTTP requests
const FormData = require('form-data');
const fs = require('fs'); // Required for file system operations (like deleting temp files)
require('dotenv').config(); 

// COMMENTED OUT: Cloudinary Configuration (as per user's request to not use it)
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     secure: true
// });


// COMMENTED OUT: Twilio setup (leaving commented as per previous instruction)
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_FROM;

// COMMENTED OUT: Twilio validation
// if (!accountSid || !authToken || !fromWhatsAppNumber) {
//     console.error('Twilio configuration is missing. Ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM are set.');
// }
// const client = twilio(accountSid, authToken);

// Email setup (remains active)
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
        const uploadedFile = req.file; // This is the temporary file info from Multer

        if (!advertisementText) {
            // NEW: Ensure temporary file is deleted even on early exit
            if (uploadedFile && uploadedFile.path) {
                fs.unlink(uploadedFile.path, (err) => {
                    if (err) console.error('Error deleting temporary file (early exit):', err);
                });
            }
            return res.status(400).json({ error: 'Advertisement text is required.' });
        }

        // IMPORTANT: When not using Cloudinary, you attach the local file directly.
        // However, this file MUST exist and be accessible when Nodemailer sends the email.
        // And you MUST ensure it's cleaned up afterwards.
        let attachments = [];
        if (uploadedFile && uploadedFile.path) {
            attachments.push({
                filename: uploadedFile.originalname, // Original name from client
                path: uploadedFile.path // Path to the temporary file on your server
            });
            console.log(`Attaching local file: ${uploadedFile.path}`); // Debugging
        } else {
            console.warn('No uploaded file found for attachment.');
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
                    // Attach the local file path if available
                    attachments: attachments.length > 0 ? attachments : [], 
                };
                return transporter.sendMail(mailOptions).catch((error) => {
                    console.error(`Failed to send email to ${email}:`, error.message);
                });
            }
            return Promise.resolve();
        });

        // COMMENTED OUT: WhatsApp sending logic (leaving commented)
        // const whatsappPromises = people.map(async (person) => { /* ... */ });

        // Wait for all email promises to settle
        await Promise.allSettled(emailPromises); 

        res.status(200).json({ message: 'Advertisement sent successfully via email!' }); 
    } catch (error) {
        console.error('Error sending advertisement (general catch):', error);
        res.status(500).json({ error: 'An error occurred while sending the advertisement.' });
    } finally {
        // NEW: Always delete the temporary file created by multer in the finally block
        // This ensures cleanup even if email sending fails or a general error occurs.
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting temporary file in finally block:', err);
                // else console.log('Temporary file deleted in finally block:', req.file.path);
            });
        }
    }
};

module.exports = {
    sendAdvertisement,
};
