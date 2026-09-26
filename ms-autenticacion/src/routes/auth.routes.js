const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/auth.controller');
const { verificarBloqueo } = require('../middleware/controlIntentos');

// POST /api/auth/registro   -> SCRUM-10
router.post('/registro', registrar);

// POST /api/auth/login      -> SCRUM-11
router.post('/login', verificarBloqueo, login);

module.exports = router;
