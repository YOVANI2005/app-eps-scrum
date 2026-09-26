// Decodifica el token (si viene en el header Authorization) pero NUNCA
// bloquea la peticion aqui. Sirve para que el limitador de peticiones
// (rate-limit) sepa "quien" esta pidiendo, incluso en rutas publicas
// como login/registro donde todavia no hay token.

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cambia-este-secreto-en-produccion';

function verificarTokenOpcional(req, res, next) {
  const encabezado = req.headers['authorization'];
  if (encabezado && encabezado.startsWith('Bearer ')) {
    const token = encabezado.split(' ')[1];
    try {
      req.usuario = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      req.usuario = null; // token invalido o vencido: se sigue sin usuario
    }
  } else {
    req.usuario = null;
  }
  next();
}

module.exports = verificarTokenOpcional;
