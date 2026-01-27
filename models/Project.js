const mongoose = require('mongoose');

// He adaptado el esquema para que coincida con tu formulario de cotización.
const projectSchema = new mongoose.Schema({
  // Mantenemos la referencia al usuario (el cliente) que creó el proyecto.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // El 'title' ahora puede ser el tipo de servicio.
  serviceType: {
    type: String,
    required: true,
    enum: ['diseno-cad', 'modelado-3d', 'ingenieria-inversa', 'reparacion']
  },
  // La 'description' es el mensaje del cliente.
  description: {
    type: String,
    required: true,
    trim: true
  },
  // En lugar de 'completed', ahora tenemos un 'status' para saber en qué fase está.
  status: {
    type: String,
    required: true,
    enum: ['Recibido', 'En Progreso', 'En Revisión', 'Completado'],
    default: 'Recibido'
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);