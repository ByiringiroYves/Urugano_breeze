const { encrypt, decrypt } = require('./encryptionUtils'); // Import existing utilities

const verificationCodes = {}; // In-memory storage for verification codes

/**
 * Stores a verification code for a specific email, encrypted for security.
 * @param {string} email - The user's email address.
 * @param {string} code - The verification code.
 */
function storeVerificationCode(email, code) {
    const normalizedEmail = email.trim().toLowerCase();
    const encryptedCode = encrypt(code); // Encrypt the verification code using encryptionUtils
    verificationCodes[normalizedEmail] = {
        encryptedCode,
        expiresAt: Date.now() + 10 * 60 * 1000, // Code is valid for 10 minutes
    };
    console.log(`Stored encrypted verification code for email: ${normalizedEmail}`);
}

/**
 * Retrieves and decrypts the verification code for a specific email.
 * @param {string} email - The user's email address.
 * @returns {Object|null} - Returns the decrypted code object or null if not found/expired.
 */
function getVerificationCode(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const data = verificationCodes[normalizedEmail];

    // Check if data exists and is not expired
    if (!data || Date.now() > data.expiresAt) {
        console.log(`Verification code expired or not found for email: ${normalizedEmail}`);
        return null;
    }

    // Decrypt the stored verification code using encryptionUtils
    const decryptedCode = decrypt(data.encryptedCode);
    console.log(`Retrieved and decrypted verification code for email: ${normalizedEmail}`);
    return { code: decryptedCode, expiresAt: data.expiresAt };
}

module.exports = {
    verificationCodes, // For debugging or testing, can be removed in production
    storeVerificationCode,
    getVerificationCode,
};
