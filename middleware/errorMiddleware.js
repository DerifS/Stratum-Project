/** Middleware global de errores. */
const errorMiddleware = (err, req, res, next) => {
  // Definir status code (default 500)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Stack trace (solo desarrollo)
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorMiddleware;