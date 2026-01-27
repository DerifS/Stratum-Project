// Cargo mis variables de entorno del archivo .env
require('dotenv').config();

// Importo las dependencias que necesito
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Importo mi middleware de manejo de errores
const errorMiddleware = require('./middleware/errorMiddleware');

// Creo mi aplicación de Express
const app = express();

// --- Middlewares Esenciales ---
// Habilito CORS para permitir que mi frontend se comunique con el backend
app.use(cors());
// Permito que mi servidor entienda y procese JSON que viene en las peticiones
app.use(express.json());
// Sirvo los archivos estáticos de mi frontend desde la carpeta 'public'
app.use(express.static('public'));

// --- Conexión a la Base de Datos ---
// Utilizo la URI de MongoDB desde mis variables de entorno
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a la base de datos MongoDB.'))
  .catch(err => console.error('No pude conectarme a la base de datos:', err));

// --- Rutas de mi API ---
// Defino las rutas base para la autenticación y las tareas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));

// --- Middleware de Manejo de Errores ---
// Lo pongo al final para que capture cualquier error que ocurra en las rutas
app.use(errorMiddleware);

// --- Iniciar el Servidor ---
// Defino el puerto en el que correrá el servidor, usando la variable de entorno o 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));