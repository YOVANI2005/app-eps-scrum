const express = require('express');
const router = express.Router();
const {
  listarMedicos, consultarDisponibilidad, agendarCita, listarMisCitas
} = require('../controllers/citas.controller');

router.get('/medicos', listarMedicos);
router.get('/disponibilidad', consultarDisponibilidad);
router.get('/mis-citas', listarMisCitas);
router.post('/agendar', agendarCita);

module.exports = router;
