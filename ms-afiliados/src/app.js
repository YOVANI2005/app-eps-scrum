require('dotenv').config();
const express = require('express');
const afiliadosRoutes = require('./routes/afiliados.routes');

const app = express();
const PUERTO = process.env.PUERTO || 3003;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ servicio: 'ms-afiliados', estado: 'ok' });
});

app.use('/api/afiliados', afiliadosRoutes);

app.listen(PUERTO, () => {
  console.log(`ms-afiliados escuchando en http://localhost:${PUERTO}`);
  console.log(`Prueba: GET http://localhost:${PUERTO}/health`);
});
