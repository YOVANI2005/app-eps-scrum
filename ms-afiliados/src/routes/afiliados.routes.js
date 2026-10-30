const express = require('express');
const router = express.Router();
const { guardarPerfil, obtenerPerfil } = require('../controllers/afiliados.controller');

// GET /api/afiliados/perfil   -> SCRUM-17 (consultar mis datos)
router.get('/perfil', obtenerPerfil);

// POST /api/afiliados/perfil  -> SCRUM-16 (registrar o actualizar mis datos)
router.post('/perfil', guardarPerfil);

module.exports = router;
