const express = require('express');
const axios = require('axios');
const router = express.Router();

// Ruta: GET /api/currency
// Esta ruta consulta una API externa gratuita
router.get('/', async (req, res) => {
    try {
        // Consultamos la API de tasas de cambio
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const rates = response.data.rates;
        
        // Devolvemos al frontend el precio del Dólar (base) frente al Peso Mexicano y Euro
        res.json({
            base: 'USD',
            mxn: rates.MXN, // Peso Mexicano
            eur: rates.EUR, // Euro
            date: response.data.date
        });
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Servicio de moneda no disponible temporalmente' });
    }
});

module.exports = router;