// Criterio de aceptacion SCRUM-28:
// "Aplica un limite de peticiones por minuto por usuario (rate-limiting)"
//
// Si la peticion trae un JWT valido (req.usuario ya decodificado por
// verificarTokenOpcional), el limite se cuenta POR USUARIO (por su id).
// Si no hay usuario (ej: alguien intentando login), se cuenta por IP,
// para no dejar sin limite las rutas publicas.

const rateLimit = require('express-rate-limit');

const LIMITE_POR_MINUTO = 100;

const limitador = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: LIMITE_POR_MINUTO,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.usuario ? `user:${req.usuario.id}` : `ip:${req.ip}`),
  message: { error: `Demasiadas peticiones. Límite: ${LIMITE_POR_MINUTO} por minuto.` },
});

module.exports = limitador;
