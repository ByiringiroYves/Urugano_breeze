const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Token is invalid or expired.' });
            }

            req.user = user; // Attach the user payload to the request
            next();
        });
    } else {
        res.status(401).json({ error: 'Authorization token is missing.' });
    }
};

module.exports = { authenticateJWT };
