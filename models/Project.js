const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Referencia: Propietario
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['diseno-cad', 'modelado-3d', 'ingenieria-inversa', 'reparacion']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Recibido', 'En Progreso', 'En Revisión', 'Completado'],
    default: 'Recibido'
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);