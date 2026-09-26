const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { emailValido, passwordValida } = require('../utils/validators');
const { registrarFallo, resetIntentos } = require('../middleware/controlIntentos');

const JWT_SECRET = process.env.JWT_SECRET || 'cambia-este-secreto-en-produccion';
const JWT_EXPIRA_EN = '24h'; // Criterio de aceptacion SCRUM-11

// ---------------------------------------------------------------
// SCRUM-10: "Como afiliado, quiero registrarme con correo y
// contraseña para poder acceder al sistema"
// ---------------------------------------------------------------
function registrar(req, res) {
  const { email, password } = req.body;

  if (!emailValido(email)) {
    return res.status(400).json({ error: 'El correo no tiene un formato válido.' });
  }
  if (!passwordValida(password)) {
    return res.status(400).json({
      error: 'La contraseña debe tener mínimo 8 caracteres e incluir al menos 1 número.',
    });
  }

  const yaExiste = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (yaExiste) {
    return res.status(409).json({ error: 'Ese correo ya está registrado.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const resultado = db
    .prepare('INSERT INTO usuarios (email, password_hash, rol) VALUES (?, ?, ?)')
    .run(email, passwordHash, 'paciente');

  return res.status(201).json({
    mensaje: 'Usuario registrado exitosamente.',
    usuario: { id: resultado.lastInsertRowid, email, rol: 'paciente' },
  });
}

// ---------------------------------------------------------------
// SCRUM-11: "Como usuario registrado, quiero iniciar sesión con
// correo y contraseña para acceder a mi cuenta"
// ---------------------------------------------------------------
function login(req, res) {
  const { email, password } = req.body;

  if (!emailValido(email) || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

  if (!usuario || !bcrypt.compareSync(password, usuario.password_hash)) {
    registrarFallo(email);
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }

  // Login correcto: se limpia el contador de intentos fallidos
  resetIntentos(email);

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRA_EN }
  );

  return res.status(200).json({
    mensaje: 'Inicio de sesión exitoso.',
    token,
    usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol },
  });
}

module.exports = { registrar, login };
