// utils/verificationUtils.js


function storeVerificationCode(email, code) {
    verificationCodes[email] = {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000, // Code is valid for 10 minutes
    };
}

const verificationCodes = {}; // In-memory storage for verification codes

function getVerificationCode(email) {
    const data = verificationCodes[email];
    if (!data || Date.now() > data.expiresAt) {
        return null; // Return null if code is expired or doesn't exist
    }
    return data;
}

module.exports = {
    verificationCodes,
    storeVerificationCode,
    getVerificationCode,
};
