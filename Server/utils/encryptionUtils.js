const crypto = require('crypto');

// Define encryption algorithm and key
const algorithm = 'aes-256-cbc';
const encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32); // 32-byte key
const ivLength = 16; // Initialization vector length

// Encrypt a plaintext value
function encrypt(text) {
    const iv = crypto.randomBytes(ivLength); // Generate a random IV
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Combine IV and encrypted text
}

// Decrypt an encrypted value
function decrypt(encryptedText) {
    const [iv, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(encrypted, 'hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };
