const express = require('express');
const router = express.Router();
const {
  listarMedicos,
  consultarDisponibilidad,
  agendarCita,
} = require('../controllers/citas.controller');

// GET /api/citas/medicos                          -> lista de medicos (util para probar)
router.get('/medicos', listarMedicos);

// GET /api/citas/disponibilidad?medicoId=1&fecha=2026-10-01   -> SCRUM-13
router.get('/disponibilidad', consultarDisponibilidad);

// POST /api/citas/agendar                          -> SCRUM-14
router.post('/agendar', agendarCita);

module.exports = router;
