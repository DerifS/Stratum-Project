require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

/** Middlewares Globales */
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/** Conexión DB */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a la base de datos MongoDB.'))
  .catch(err => console.error('No pude conectarme a la base de datos:', err));

/** Rutas */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/currency', require('./routes/currencyRoutes'));

/** Error Handling */
app.use(errorMiddleware);

/** Server Start */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
