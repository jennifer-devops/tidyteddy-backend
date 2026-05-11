const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const HttpStatus = require('../controller/controller.js');
dotenv.config();

const authenticateToken = (req, res, next) => {
    if (req.path.startsWith("/discount/validate/")) {
        return next(); // Skip authentication
    }

    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED.code).json({ message: 'Authentication Token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(HttpStatus.FORBIDDEN.code).json({ message: 'Invalid Token' });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };