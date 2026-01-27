const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Defino las rutas para registrar y loguear usuarios
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;