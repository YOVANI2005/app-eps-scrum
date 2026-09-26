require('dotenv').config();
const express = require('express');
const citasRoutes = require('./routes/citas.routes');

const app = express();
const PUERTO = process.env.PUERTO || 3002;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ servicio: 'ms-citas-medicas', estado: 'ok' });
});

app.use('/api/citas', citasRoutes);

app.listen(PUERTO, () => {
  console.log(`ms-citas-medicas escuchando en http://localhost:${PUERTO}`);
  console.log(`Prueba: GET http://localhost:${PUERTO}/health`);
});
