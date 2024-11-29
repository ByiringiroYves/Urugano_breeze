const bcrypt = require('bcrypt');
const Admin = require('../models/Admin'); // Assuming you have an Admin model
const nodemailer = require('nodemailer'); // For sending emails
const { storeVerificationCode, getVerificationCode } = require('../utils/verificationUtils');
const path = require('path');

// Utility function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    return emailRegex.test(email);
};

// Utility function to validate password strength
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
    return passwordRegex.test(password);
};

// Utility function to send verification email
const sendVerificationEmail = async (email, verificationCode) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email provider's service
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASSWORD, // Your email password
            },
        });
        //const username = email.split('@')[0]; 
        const logoPath = path.join(__dirname, '../uploads/email/logo.png');
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'GOGO Admin Account Verification Code',
            html: `
            <p>Dear GOGO Staff,</p>
            <p>Your verification code(OTP) is:</p>
            <p style="font-size: 20px; font-weight: bold; color: #000;">${verificationCode}</p>
            <p>this code is valid for the next 10 minutes.</p>
            <p>If you did not request this code, please ignore this email or contact our support team if you suspect any issues.</p>
            <p>Best regards,<br>
            <p></p>
            The GOGO Homes & Apatrment Support Team<br>
            <a href="mailto:gogohomesapartment@gmail.com">gogohomesapartment@gmail.com</a><br>
            +4 (540) 641-002</p>
            <img src="cid:unique@signature" alt="GOGO Logo" style="width: 250px; height: 50px;" />            
              `,
              attachments: [
                {
                    filename: 'logo.png', // The file name
                    path: logoPath, // Path to your image
                    cid: 'unique@signature' // Same as the `src` value in the HTML
                }
            ]     

            };

        await transporter.sendMail(mailOptions);
      //  console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send verification email");
    }
};

// Controller to create an admin user
exports.createAdmin = async (req, res) => {
    try {
        const { email, password, confirmpassword } = req.body;

        // Validate required fields
        if (!email || !password || !confirmpassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if passwords match
        if (password !== confirmpassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Validate password strength
        if (!isValidPassword(password)) {
            return res.status(400).json({
                error: "Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
            });
        }

        // Normalize email to lowercase and check if it already exists
        const normalizedEmail = email.toLowerCase();
        const existingAdmin = await Admin.findOne({ email: normalizedEmail });
        if (existingAdmin) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash the password before saving
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new admin (excluding confirmpassword)
        const admin = new Admin({ email: normalizedEmail, password: hashedPassword });
        await admin.save();

        res.status(201).json({ message: "Admin created successfully", admin });
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ error: "An error occurred while creating the admin user" });
    }
};

// Controller to handle login with 2FA
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const normalizedEmail = email.toLowerCase();
        const admin = await Admin.findOne({ email: normalizedEmail });
        if (!admin) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate and store verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        storeVerificationCode(normalizedEmail, verificationCode);

        // Send verification code via email
        await sendVerificationEmail(normalizedEmail, verificationCode);
        res.status(200).json({ message: "Verification code sent to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred during login" });
    }
};

// Controller to verify the 2FA code
exports.verifyCode = (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const normalizedEmail = email.toLowerCase();
    console.log(`Verifying code for email: ${normalizedEmail} with code: ${code}`);

    const storedData = getVerificationCode(normalizedEmail); // Retrieve and decrypt code
    if (!storedData) {
        console.log('No stored data found or verification code expired.');
        return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    const { code: storedCode } = storedData;

    if (storedCode !== code) {
        console.log('Invalid code provided.');
        return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
    }

    console.log('Verification successful for email:', normalizedEmail);
    return res.status(200).json({ message: 'Verification successful!' });
};
