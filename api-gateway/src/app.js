require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const verificarTokenOpcional = require('./middleware/verificarTokenOpcional');
const verificarToken = require('./middleware/verificarToken');
const limitador = require('./middleware/limitador');

const app = express();
const PUERTO = process.env.PUERTO || 3000;

const MS_AUTENTICACION_URL = process.env.MS_AUTENTICACION_URL || 'http://localhost:3001';
const MS_CITAS_URL = process.env.MS_CITAS_URL || 'http://localhost:3002';

// IMPORTANTE: no se usa express.json() aqui. El Gateway reenvia el cuerpo
// de la peticion tal cual (sin parsearlo), para que http-proxy-middleware
// pueda pasarlo intacto al microservicio real, que es quien lo interpreta.

app.get('/health', (req, res) => {
  res.json({ servicio: 'api-gateway', estado: 'ok' });
});

// Decodifica el token si viene (sin bloquear) ANTES del limitador,
// para que el limitador pueda distinguir usuario autenticado vs anonimo.
app.use(verificarTokenOpcional);
app.use(limitador);

// --- Rutas PUBLICAS: no requieren JWT (SCRUM-28) ---
// Todas las rutas de ms-autenticacion (registro, login) son publicas.
// Se monta en '/api/auth' (no en cada ruta especifica) y se usa pathRewrite
// para reconstruir la ruta completa, porque Express recorta el prefijo
// montado antes de que el proxy vea la peticion.
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: MS_AUTENTICACION_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/auth${path}`,
  })
);

// --- Rutas PROTEGIDAS: requieren JWT valido (SCRUM-28) ---
app.use(
  '/api/citas',
  verificarToken,
  createProxyMiddleware({
    target: MS_CITAS_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/citas${path}`,
  })
);

// Cualquier otra ruta no reconocida
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en el API Gateway.' });
});

app.listen(PUERTO, () => {
  console.log(`api-gateway escuchando en http://localhost:${PUERTO}`);
  console.log(`Prueba: GET http://localhost:${PUERTO}/health`);
  console.log(`Enrutando /api/auth/* -> ${MS_AUTENTICACION_URL}`);
  console.log(`Enrutando /api/citas/* -> ${MS_CITAS_URL} (requiere JWT)`);
});
