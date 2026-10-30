// Configuracion de la base de datos SQLite para ms-afiliados.
// Patron "database per service": esta base es independiente de la de
// ms-autenticacion y de ms-citas-medicas.

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'afiliados.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS afiliados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    nombre_completo TEXT NOT NULL,
    documento TEXT NOT NULL UNIQUE,
    fecha_nacimiento TEXT NOT NULL,     -- formato YYYY-MM-DD
    tipo_afiliacion TEXT NOT NULL,      -- 'contributivo' | 'subsidiado'
    estado TEXT NOT NULL DEFAULT 'activo',
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
