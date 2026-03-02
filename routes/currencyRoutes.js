const express = require('express');
const axios = require('axios');
const router = express.Router();

// Endpoint para obtener tasas de cambio
router.get('/', async (req, res) => {
    try {
        // Petición HTTP a proveedor de datos de divisas
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const rates = response.data.rates;
        
        // Respuesta estructurada con tasas de conversión relevantes (MXN, EUR)
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