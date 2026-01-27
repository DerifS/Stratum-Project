const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Reviso si el token viene en los headers de autorización y si empieza con 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraigo el token (sin la palabra 'Bearer')
      token = req.headers.authorization.split(' ')[1];
      
      // Verifico la validez del token usando mi clave secreta
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Busco al usuario del token en la BD y lo adjunto al objeto 'req'
      // Esto me permitirá acceder a req.user en cualquier ruta protegida
      req.user = await User.findById(decoded.id).select('-password');
      
      next(); // Continúo a la siguiente función de middleware/controlador
    } catch (error) {
      res.status(401); // Unauthorized
      next(new Error('No autorizado, token fallido'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('No autorizado, no hay token'));
  }
};

module.exports = { protect };