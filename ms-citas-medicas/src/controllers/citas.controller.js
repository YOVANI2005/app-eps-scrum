const db = require('../config/db');
const { estaDisponible } = require('../utils/busquedaBinaria');
const { generarHorariosBase, minutosAHora, horaAMinutos } = require('../utils/horarios');
const { publicarEvento } = require('../utils/busEventos');

function listarMedicos(req, res) {
  const medicos = db.prepare('SELECT id, nombre, especialidad FROM medicos').all();
  return res.json({ medicos });
}

// ---------------------------------------------------------------
// SCRUM-13: "Como paciente, quiero ver los horarios disponibles de
// un médico para poder agendar una cita"
// ---------------------------------------------------------------
function consultarDisponibilidad(req, res) {
  const { medicoId, fecha } = req.query;

  if (!medicoId || !fecha) {
    return res.status(400).json({ error: 'Debes indicar medicoId y fecha (YYYY-MM-DD).' });
  }

  const medico = db.prepare('SELECT * FROM medicos WHERE id = ?').get(medicoId);
  if (!medico) {
    return res.status(404).json({ error: 'Médico no encontrado.' });
  }

  // Horarios ya ocupados ese dia para ese medico (ordenados, como pide la busqueda binaria)
  const ocupados = db
    .prepare(
      `SELECT hora_minutos FROM citas
       WHERE medico_id = ? AND fecha = ? AND estado = 'confirmada'
       ORDER BY hora_minutos ASC`
    )
    .all(medicoId, fecha)
    .map((fila) => fila.hora_minutos);

  const horariosBase = generarHorariosBase();

  // Se usa el algoritmo de busqueda binaria (SCRUM-13, criterio de aceptacion)
  const disponibles = horariosBase
    .filter((minutos) => estaDisponible(ocupados, minutos))
    .map((minutos) => minutosAHora(minutos));

  return res.json({
    medico: { id: medico.id, nombre: medico.nombre, especialidad: medico.especialidad },
    fecha,
    horariosDisponibles: disponibles,
  });
}

// ---------------------------------------------------------------
// SCRUM-14: "Como paciente, quiero agendar una cita médica en un
// horario disponible"
// ---------------------------------------------------------------
function agendarCita(req, res) {
  const { pacienteEmail, medicoId, fecha, hora } = req.body;

  if (!pacienteEmail || !medicoId || !fecha || !hora) {
    return res.status(400).json({
      error: 'Debes indicar pacienteEmail, medicoId, fecha (YYYY-MM-DD) y hora (HH:MM).',
    });
  }

  const medico = db.prepare('SELECT * FROM medicos WHERE id = ?').get(medicoId);
  if (!medico) {
    return res.status(404).json({ error: 'Médico no encontrado.' });
  }

  const horaMinutos = horaAMinutos(hora);
  if (horaMinutos === null) {
    return res.status(400).json({ error: 'La hora debe tener formato HH:MM, ej: 08:30.' });
  }

  const ocupados = db
    .prepare(
      `SELECT hora_minutos FROM citas
       WHERE medico_id = ? AND fecha = ? AND estado = 'confirmada'
       ORDER BY hora_minutos ASC`
    )
    .all(medicoId, fecha)
    .map((fila) => fila.hora_minutos);

  // Se valida disponibilidad con el mismo algoritmo de busqueda binaria
  if (!estaDisponible(ocupados, horaMinutos)) {
    return res.status(409).json({ error: 'Ese horario ya está ocupado. Elige otro.' });
  }

  const resultado = db
    .prepare(
      `INSERT INTO citas (paciente_email, medico_id, fecha, hora_minutos, estado)
       VALUES (?, ?, ?, ?, 'confirmada')`
    )
    .run(pacienteEmail, medicoId, fecha, horaMinutos);

  const cita = {
    id: resultado.lastInsertRowid,
    pacienteEmail,
    medico: medico.nombre,
    especialidad: medico.especialidad,
    fecha,
    hora,
    estado: 'confirmada',
  };

  // Criterio de aceptacion SCRUM-14: se dispara un evento al bus de mensajeria
  publicarEvento('CITA_CONFIRMADA', cita);

  return res.status(201).json({ mensaje: 'Cita agendada exitosamente.', cita });
}

module.exports = { listarMedicos, consultarDisponibilidad, agendarCita };
