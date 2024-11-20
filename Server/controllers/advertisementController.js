const nodemailer = require('nodemailer');
const People = require('../models/people');
const path = require('path');
const twilio = require('twilio');
const cloudinary = require('cloudinary').v2;

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_FROM;
const client = twilio(accountSid, authToken);
const axios = require('axios'); // For making HTTP requests
const FormData = require('form-data');
const fs = require('fs');

// Cloudinary setup (global configuration)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
                return transporter.sendMail(mailOptions);
            }
            return Promise.resolve();
        });

        // WhatsApp sending via Meta API
// WhatsApp sending with Meta API
// WhatsApp sending with Meta API
const whatsappPromises = people.map(async (person) => {
    const phone = person.Phones?.trim();
    if (phone && /^\+\d+$/.test(phone)) {
        const messageBody = `*Check updates on GOGO Homes & Apartments*\n\n${advertisementText}`;

        try {
            let mediaId = null;

            // Upload the image to Meta's media endpoint if there is an uploaded file
            if (uploadedFile) {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(uploadedFile.path));
                formData.append('type', 'image/jpeg'); // Adjust type if necessary

                const mediaResponse = await axios.post(
                    `https://graph.facebook.com/v16.0/${process.env.WHATSAPP_BUSINESS_PHONE_ID}/media`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                            ...formData.getHeaders(), // Correctly set headers for multipart/form-data
                        },
                    }
                );

                mediaId = mediaResponse.data.id; // Retrieve media ID
            }

            // Send message with or without media
            const payload = {
                messaging_product: 'whatsapp',
                to: phone,
                type: mediaId ? 'image' : 'text',
                text: mediaId ? undefined : { body: messageBody },
                image: mediaId ? { id: mediaId, caption: messageBody } : undefined,
            };

            // Send message to Meta API
            const response = await axios.post(
                `https://graph.facebook.com/v16.0/${process.env.WHATSAPP_BUSINESS_PHONE_ID}/messages`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log(`Message sent to ${phone}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error sending WhatsApp message to ${phone}:`, error.response?.data || error.message);
            return Promise.resolve(); // Skip to the next person
        }
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
