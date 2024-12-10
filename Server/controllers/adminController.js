const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const nodemailer = require("nodemailer");
const { storeVerificationCode, getVerificationCode } = require("../utils/verificationUtils");
const path = require("path");
require('dotenv').config();

// Utility function to validate email format
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Utility function to validate password strength
const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/.test(password);

// Utility function to send verification email
const sendVerificationEmail = async (email, verificationCode) => {
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
      to: email,
      subject: "GOGO Admin Account Verification Code",
      html: `
        <p>Dear GOGO Staff,</p>
        <p>Your verification code (OTP) is:</p>
        <p style="font-size: 20px; font-weight: bold; color: #000;">${verificationCode}</p>
        <p>This code is valid for the next 10 minutes.</p>
        <p>If you did not request this code, please ignore this email or contact our support team if you suspect any issues.</p>
        <p>Best regards,<br>The GOGO Homes & Apartment Support Team<br>
        <a href="mailto:gogohomesapartment@gmail.com">gogohomesapartment@gmail.com</a><br>
        +4 (540) 641-002</p>
        <img src="cid:unique@signature" alt="GOGO Logo" style="width: 250px; height: 50px;" />`,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "unique@signature",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email.");
  }
};

// Controller to create an admin user
const createAdmin = async (req, res) => {
  try {
    const { Fullname, email, password, confirmpassword } = req.body;

    if (!Fullname || !email || !password || !confirmpassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const normalizedEmail = email.toLowerCase();
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      Fullname,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await admin.save();

    res.status(201).json({ message: "Admin created successfully.", admin });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ error: "An error occurred while creating the admin user." });
  }
};

// Controller to handle login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    storeVerificationCode(normalizedEmail, verificationCode);

    await sendVerificationEmail(normalizedEmail, verificationCode);

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // 1-day expiration
    );

    res.status(200).json({
      message: "Login successful. Verification code sent.",
      token,
      verificationCodeSent: true,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login." });
  }
};

// Verify 2FA Code
const verifyCode = (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and verification code are required." });
  }

  const normalizedEmail = email.toLowerCase();
  const storedData = getVerificationCode(normalizedEmail);

  if (!storedData || storedData.code !== code) {
    return res.status(400).json({ error: "Invalid or expired verification code." });
  }

  res.status(200).json({ message: "Verification successful!" });
};

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization token required." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};

// Fetch Admin Profile
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found." });
    }

    res.status(200).json({
      fullName: admin.Fullname,
      email: admin.email,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "An error occurred while fetching profile." });
  }
};

// Logout Admin
const logoutAdmin = (req, res) => {
  res.status(200).json({ message: "Logged out successfully!" });
};

module.exports = {
  createAdmin,
  loginAdmin,
  verifyCode,
  getProfile,
  logoutAdmin,
  authenticateJWT,
};
