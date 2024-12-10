const Session = require('../models/Session'); // Import Session model

const validateSession = async (req, res, next) => {
    const sessionId = req.headers.sessionid || req.cookies?.adminSession;
    if (!sessionId) {
        return res.status(401).json({ error: "Unauthorized. No session found." });
    }

    // Fetch session from MongoDB
    const session = await Session.findOne({ sessionId });
    if (!session) {
        return res.status(401).json({ error: "Session not found. Please log in again." });
    }

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
        return res.status(401).json({ error: "Session expired. Please log in again." });
    }

    req.session = session; // Attach session to request
    next();
};


module.exports = validateSession;
