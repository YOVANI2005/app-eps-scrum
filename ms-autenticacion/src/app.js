require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PUERTO = process.env.PUERTO || 3001;

app.use(express.json());

// Endpoint de salud, util para confirmar que el servicio esta vivo
app.get('/health', (req, res) => {
  res.json({ servicio: 'ms-autenticacion', estado: 'ok' });
});

app.use('/api/auth', authRoutes);

app.listen(PUERTO, () => {
  console.log(`ms-autenticacion escuchando en http://localhost:${PUERTO}`);
  console.log(`Prueba: GET http://localhost:${PUERTO}/health`);
});
