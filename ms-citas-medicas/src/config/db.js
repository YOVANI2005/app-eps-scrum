// Configuracion de la base de datos SQLite para ms-citas-medicas
// Patron "database per service": esta base es independiente de la de ms-autenticacion
//
// Nota de diseno: los horarios de atencion (08:00 a 17:00 cada 30 min) se
// generan dinamicamente en utils/horarios.js, NO se guardan en una tabla.
// Solo se persisten los medicos y las citas ya agendadas.

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'citas.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS medicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    especialidad TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_email TEXT NOT NULL,
    medico_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,           -- formato YYYY-MM-DD
    hora_minutos INTEGER NOT NULL, -- minutos desde las 00:00 (ej: 480 = 08:00)
    estado TEXT NOT NULL DEFAULT 'confirmada',
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (medico_id) REFERENCES medicos(id)
  );
`);

// --- Datos semilla: 2 medicos de ejemplo (solo la primera vez) ---
const yaHaySemillas = db.prepare('SELECT COUNT(*) AS total FROM medicos').get().total > 0;

if (!yaHaySemillas) {
  const insertarMedico = db.prepare('INSERT INTO medicos (nombre, especialidad) VALUES (?, ?)');
  insertarMedico.run('Dra. Ana Gómez', 'Medicina General');
  insertarMedico.run('Dr. Luis Torres', 'Pediatría');
  console.log('Datos semilla creados: 2 médicos de ejemplo.');
}

module.exports = db;
