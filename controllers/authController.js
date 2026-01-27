const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Función para generar un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // El token expirará en 30 días
  });
};

// --- Lógica para registrar un usuario ---
const registerUser = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    // Verifico si el usuario ya existe
    const userExists = await User.findOne({ username });
    if (userExists) {
      res.status(400); // Bad Request
      throw new Error('El usuario ya existe');
    }
    // Creo el nuevo usuario
    const user = await User.create({ username, password });
    // Si se creó correctamente, le devuelvo sus datos y un token
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Datos de usuario inválidos');
    }
  } catch (error) {
    next(error); // Paso el error a mi middleware de errores
  }
};

// --- Lógica para iniciar sesión ---
const loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    // Busco al usuario por su username
    const user = await User.findOne({ username });
    // Si existe y la contraseña es correcta...
    if (user && (await user.matchPassword(password))) {
      // Le devuelvo sus datos y un nuevo token
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401); // Unauthorized
      throw new Error('Usuario o contraseña incorrectos');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser };