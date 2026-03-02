const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Middleware de protección de rutas (JWT). */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401);
            next(new Error('No autorizado, token fallido'));
        }
    }

    if (!token) {
        res.status(401);
        next(new Error('No autorizado, no hay token'));
    }
};

/** Middleware de autorización: Admin. */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        next(new Error('No autorizado como administrador'));
    }
};

module.exports = { protect, admin };