const nodemailer = require('nodemailer'); // Still needed for other email functions if they exist in this file, otherwise can remove
const People = require('../models/people');
const path = require('path');
// const twilio = require('twilio'); // COMMENTED OUT
// const cloudinary = require('cloudinary').v2; // COMMENTED OUT
const axios = require('axios'); // Used for Mailgun API calls
const FormData = require('form-data'); // Used for multipart form data if sending files directly to Mailgun API
const fs = require('fs'); // Required for file system operations
require('dotenv').config();

// COMMENTED OUT: Twilio setup
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_FROM;
// if (!accountSid || !authToken || !fromWhatsAppNumber) {
//     console.error('Twilio configuration is missing. Ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM are set.');
// }
// const client = twilio(accountSid, authToken);

// COMMENTED OUT: Nodemailer Transporter (if *all* emails are moving to Mailgun API)
// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: process.env.EMAIL_PORT == 465, 
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD,
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });

// Mailgun API Configuration (NEW)
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_API_BASE_URL = process.env.MAILGUN_API_BASE_URL; // e.g., 'https://api.mailgun.net/v3'

// Ensure Mailgun API config is present
if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_API_BASE_URL) {
    console.error('Mailgun API configuration is missing. Check MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_API_BASE_URL in .env');
}

// Function to introduce a delay (in milliseconds) - kept for potential throttling
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// Function to send advertisement
const sendAdvertisement = async (req, res) => {
    // Define uploadedFile outside the try block for access in finally
    let uploadedFile = req.file; 

    try {
        const { advertisementText } = req.body;
        
        if (!advertisementText) {
            // Ensure temporary file is deleted even on early exit
            if (uploadedFile && uploadedFile.path) {
                fs.unlink(uploadedFile.path, (err) => {
                    if (err) console.error('Error deleting temporary file (early exit):', err);
                });
            }
            return res.status(400).json({ error: 'Advertisement text is required.' });
        }

        const people = await People.find().lean();

        const successfulEmails = []; 
        const failedEmails = [];    

        // --- PRODUCTION SENDING LIMITS - IMPLEMENT DELAY ---
        const BATCH_SIZE = 5;      // Send 5 emails per batch
        const BATCH_DELAY_MS = 20000; // Wait 20 seconds between batches
        const EMAIL_DELAY_MS = 2000; // Wait 2 seconds between individual emails within a batch

        console.log(`Starting advertisement send to ${people.length} recipients via Mailgun API. Limit: 100/hour.`);


        for (let i = 0; i < people.length; i++) {
            const person = people[i];
            const email = person.Email?.trim();

            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                // --- Send email via Mailgun API ---
                const mailgunFormData = new FormData();
                mailgunFormData.append('from', `Gogo Villas <${process.env.EMAIL_FROM_ADDRESS}>`); // Use EMAIL_FROM_ADDRESS from .env
                mailgunFormData.append('to', email);
                mailgunFormData.append('subject', 'Check updates on Gogo Villas');
                mailgunFormData.append('text', advertisementText);

                if (uploadedFile && uploadedFile.path) {
                    // Attach the file if it exists locally
                    // Mailgun API requires file stream for attachment
                    mailgunFormData.append('attachment', fs.createReadStream(uploadedFile.path));
                }

                try {
                    await axios.post(
                        `${MAILGUN_API_BASE_URL}/${MAILGUN_DOMAIN}/messages`, // Correct Mailgun API endpoint
                        mailgunFormData,
                        {
                            headers: {
                                ...mailgunFormData.getHeaders(), // Important for FormData
                                'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}` // Basic Auth with API key
                            }
                        }
                    );
                    console.log(`Mailgun API email sent to ${email}`);
                    successfulEmails.push(email);
                } catch (apiError) {
                    // Log specific Mailgun API error response for debugging
                    console.error(`Failed to send email to ${email} via Mailgun API:`, apiError.response ? apiError.response.data : apiError.message);
                    failedEmails.push({ email, error: apiError.response ? apiError.response.data : apiError.message });
                }
            } else {
                console.warn(`Invalid email format for recipient: ${email}`);
                failedEmails.push({ email: email || 'N/A', error: 'Invalid format' });
            }

            // Implement delay logic
            if ((i + 1) % BATCH_SIZE === 0 && (i + 1) < people.length) {
                console.log(`Waiting ${BATCH_DELAY_MS / 1000} seconds before next batch (${i + 1}/${people.length} emails sent)...`);
                await delay(BATCH_DELAY_MS);
            } else if ((i + 1) < people.length) {
                await delay(EMAIL_DELAY_MS); 
            }
        }

        res.status(200).json({ 
            message: `Advertisement sending completed. Sent to ${successfulEmails.length} recipients. ${failedEmails.length} failed.`,
            successfulEmails: successfulEmails,
            failedEmails: failedEmails
        });

    } catch (error) {
        console.error('Error sending advertisement (general catch):', error);
        res.status(500).json({ error: 'An error occurred while sending the advertisement.' });
    } finally {
        if (uploadedFile && uploadedFile.path) {
            fs.unlink(uploadedFile.path, (err) => {
                if (err) console.error('Error deleting temporary file in finally block:', err);
            });
        }
    }
};

module.exports = {
    sendAdvertisement,
};
