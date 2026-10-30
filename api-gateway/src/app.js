require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const verificarTokenOpcional = require('./middleware/verificarTokenOpcional');
const verificarToken = require('./middleware/verificarToken');
const limitador = require('./middleware/limitador');
const cors = require('./middleware/cors');

const app = express();
const PUERTO = process.env.PUERTO || 3000;
const MS_AUTENTICACION_URL = process.env.MS_AUTENTICACION_URL || 'http://localhost:3001';
const MS_CITAS_URL = process.env.MS_CITAS_URL || 'http://localhost:3002';
const MS_AFILIADOS_URL = process.env.MS_AFILIADOS_URL || 'http://localhost:3003';

app.get('/health', (req, res) => res.json({ servicio: 'api-gateway', estado: 'ok' }));
app.use(cors);
app.use(verificarTokenOpcional);
app.use(limitador);

// Rutas públicas de autenticación.
app.use('/api/auth', createProxyMiddleware({
  target: MS_AUTENTICACION_URL,
  changeOrigin: true,
  pathRewrite: (path) => `/api/auth${path}`,
}));

// El correo se obtiene del JWT validado, nunca de un dato enviado por el navegador.
function adjuntarIdentidad(req, res, next) {
  req.headers['x-usuario-email'] = req.usuario.email;
  next();
}

app.use('/api/citas', verificarToken, adjuntarIdentidad, createProxyMiddleware({
  target: MS_CITAS_URL,
  changeOrigin: true,
  pathRewrite: (path) => `/api/citas${path}`,
}));

app.use('/api/afiliados', verificarToken, adjuntarIdentidad, createProxyMiddleware({
  target: MS_AFILIADOS_URL,
  changeOrigin: true,
  pathRewrite: (path) => `/api/afiliados${path}`,
}));

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada en el API Gateway.' }));

app.listen(PUERTO, () => {
  console.log(`api-gateway escuchando en http://localhost:${PUERTO}`);
  console.log(`Autenticación -> ${MS_AUTENTICACION_URL}`);
  console.log(`Citas -> ${MS_CITAS_URL} (requiere JWT)`);
  console.log(`Afiliados -> ${MS_AFILIADOS_URL} (requiere JWT)`);
});
