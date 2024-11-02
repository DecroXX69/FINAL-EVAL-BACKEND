const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check if the request has an Authorization header and if it starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // Extract the token
    }

    // If no token, return 401 Unauthorized
    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by ID stored in the token and exclude the password from the response
        req.user = await User.findById(decoded.userId).select('-password');

        // If user not found, return 404
        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Token is not valid' }); // Return 401 if token verification fails
    }
};

module.exports = { protect };
