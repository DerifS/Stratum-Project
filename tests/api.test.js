const request = require('supertest');
const express = require('express');
const currencyRoutes = require('../routes/currencyRoutes');

const app = express();
app.use('/api/currency', currencyRoutes);

describe('Pruebas de API Externa (Moneda)', () => {
    it('Obtiene el precio del Dólar (USD) correctamente', async () => {
        const response = await request(app).get('/api/currency');
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('base', 'USD');
        expect(response.body).toHaveProperty('mxn');
        expect(typeof response.body.mxn).toBe('number');
    });
});