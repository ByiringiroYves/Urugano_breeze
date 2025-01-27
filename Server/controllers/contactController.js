const nodemailer = require('nodemailer');

const sendContactEmail = async (req, res) => {
  try {
    const { name, email, phoneNumber, message } = req.body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Configure the transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email details with HTML content
    const mailOptions = {
      from: `"Gogo Villas Contact Form" <${email}>`,
      to: process.env.EMAIL_USER, // Send to the configured email
      subject: 'Gogo Villas Client Inquiries',
      html: `
        <h2>Gogo Villas Client Inquiries</h2>
        <p>You have received a new message from the contact form:</p>
        ${message}
        <ul>
          <strong>Client Name:</strong> ${name}
          <strong>Client Email:</strong> ${email}
          <strong>Phone Number:</strong> ${phoneNumber}
        </ul>
        <p>Best regards,</p>
        <p>Gogo Villas</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond to the client
    res.status(200).json({ message: 'Your inquiry has been sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'An error occurred while sending the email. Please try again later.' });
  }
};

module.exports = { sendContactEmail };
