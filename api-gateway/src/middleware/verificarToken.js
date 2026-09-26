// Criterio de aceptacion SCRUM-28:
// "Valida el token JWT antes de reenviar la peticion (excepto en login/registro)"
//
// Este middleware se monta SOLO en las rutas protegidas (ej: /api/citas).
// Las rutas publicas (/api/auth/login, /api/auth/registro) nunca pasan por aqui.

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cambia-este-secreto-en-produccion';

function verificarToken(req, res, next) {
  const encabezado = req.headers['authorization'];

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token de autenticación (header Authorization).' });
  }

  const token = encabezado.split(' ')[1];

  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado. Inicia sesión de nuevo.' });
  }
}

module.exports = verificarToken;
