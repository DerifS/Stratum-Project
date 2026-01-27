// Middleware básico de manejo de errores.
// Como me sugirió la IA, este middleware se encarga de capturar cualquier error
// que se pase a través de 'next(error)' en mis controladores.

const errorMiddleware = (err, req, res, next) => {
  // Si el error ya tiene un código de estado, lo uso. Si no, es un error 500 (interno del servidor).
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Devuelvo una respuesta JSON con el mensaje de error.
  // En un entorno de desarrollo, también podría incluir el 'stack trace' del error para depurar.
  res.json({
    message: err.message,
    // La siguiente línea es útil para desarrollo, pero debería ocultarse en producción por seguridad.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorMiddleware;