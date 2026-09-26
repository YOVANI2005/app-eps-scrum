// Criterio de aceptacion SCRUM-11:
// "Despues de 5 intentos fallidos, se bloquea temporalmente el acceso (5 minutos)"
//
// Nota: este control vive en memoria (Map). Sirve perfecto para el Sprint 1 /
// entorno academico. Si el proyecto crece a produccion real, se recomendaria
// mover esto a Redis para que sobreviva a reinicios del servidor.

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos

const intentos = new Map(); // email -> { fallos, bloqueadoHasta }

function estaBloqueado(email) {
  const registro = intentos.get(email);
  if (!registro || !registro.bloqueadoHasta) return false;
  if (Date.now() > registro.bloqueadoHasta) {
    intentos.delete(email);
    return false;
  }
  return true;
}

function minutosRestantesDeBloqueo(email) {
  const registro = intentos.get(email);
  if (!registro || !registro.bloqueadoHasta) return 0;
  return Math.ceil((registro.bloqueadoHasta - Date.now()) / 60000);
}

function registrarFallo(email) {
  const registro = intentos.get(email) || { fallos: 0, bloqueadoHasta: null };
  registro.fallos += 1;
  if (registro.fallos >= MAX_INTENTOS) {
    registro.bloqueadoHasta = Date.now() + BLOQUEO_MS;
  }
  intentos.set(email, registro);
  return registro;
}

function resetIntentos(email) {
  intentos.delete(email);
}

// Middleware de Express: bloquea la peticion ANTES de validar la contraseña
function verificarBloqueo(req, res, next) {
  const { email } = req.body;
  if (email && estaBloqueado(email)) {
    return res.status(429).json({
      error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutosRestantesDeBloqueo(email)} minuto(s).`,
    });
  }
  next();
}

module.exports = { verificarBloqueo, registrarFallo, resetIntentos, estaBloqueado };
