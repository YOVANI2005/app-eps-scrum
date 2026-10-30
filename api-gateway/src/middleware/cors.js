// Middleware CORS escrito a mano (sin instalar el paquete 'cors') para
// que el frontend (que corre en otro puerto, ej: 8080) pueda llamar
// al Gateway (puerto 3000) desde el navegador sin ser bloqueado.

function cors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // respuesta rapida a la peticion "preflight" del navegador
  }
  next();
}

module.exports = cors;
