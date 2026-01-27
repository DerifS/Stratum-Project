const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Defino el esquema para mi modelo de Usuario
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Antes de guardar un nuevo usuario, voy a "hashear" la contraseña
// Uso una función de middleware pre-save para esto
userSchema.pre('save', async function() {
  // Solo hasheo la contraseña si ha sido modificada (o es nueva)
  if (!this.isModified('password')) {
    return; // Simplemente retorno sin llamar a next()
  }
  
  // Genero un "salt" y luego hasheo la contraseña
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // Ya no hace falta llamar a next() al final
});

// Añado un método a mi modelo para comparar contraseñas durante el login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exporto el modelo para poder usarlo en otras partes de mi aplicación
module.exports = mongoose.model('User', userSchema);