// Configuracion de la base de datos SQLite para ms-autenticacion
// SQLite no requiere servidor: todo vive en un archivo local (autenticacion.db)

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'autenticacion.db');
const db = new Database(dbPath);

// Crea la tabla de usuarios si no existe (se ejecuta una sola vez al iniciar)
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'paciente',
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

module.exports = db;
