const nodemailer = require('nodemailer');
const People = require('../models/people');
const path = require('path');
const fs = require('fs');
const twilio = require('twilio'); // Twilio for WhatsApp

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Twilio Auth Token
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_FROM; // Twilio WhatsApp Number
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
        const uploadedFile = req.file; // Image from Multer

        // Validate inputs
        if (!advertisementText) {
            return res.status(400).json({ error: 'Advertisement text is required.' });
        }

        // Get all people with valid emails and phone numbers
        const people = await People.find().lean();

        // Prepare image attachment
        const attachmentPath = uploadedFile ? path.join(__dirname, '../uploads/ads', uploadedFile.filename) : null;

        // Email sending
        const emailPromises = people.map(async person => {
            const email = person.Email?.trim(); // Remove extra spaces
            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Validate email format
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Check updates on GOGO Homes & Apartments',
                    text: advertisementText,
                    attachments: attachmentPath ? [{ path: attachmentPath }] : [],
                };
                return transporter.sendMail(mailOptions);
            }
            return Promise.resolve(); // Skip invalid emails
        });

        // WhatsApp sending
        const whatsappPromises = people.map(async person => {
            const phone = person.Phones?.trim(); // Remove extra spaces
            if (phone && /^\+\d+$/.test(phone)) { // Validate phone format
                const messageBody = `*Check updates on GOGO Homes & Apartments*\n\n${advertisementText}`;
                const mediaUrl = uploadedFile ? `${process.env.BASE_URL}/uploads/ads/${uploadedFile.filename}` : null;
                return client.messages.create({
                    from: `whatsapp:${fromWhatsAppNumber}`,
                    to: `whatsapp:${phone}`,
                    body: messageBody,
                    mediaUrl: mediaUrl ? [mediaUrl] : undefined,
                });
            }
            return Promise.resolve(); // Skip invalid phone numbers
        });

        // Wait for all promises to complete
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
