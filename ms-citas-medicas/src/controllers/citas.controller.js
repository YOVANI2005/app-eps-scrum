const db = require('../config/db');
const { estaDisponible } = require('../utils/busquedaBinaria');
const { generarHorariosBase, minutosAHora, horaAMinutos } = require('../utils/horarios');
const { publicarEvento } = require('../utils/busEventos');

const ZONA_HORARIA = 'America/Bogota';

function fechaLocalColombia() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const p = Object.fromEntries(partes.map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

function minutosLocalesColombia() {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA_HORARIA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const p = Object.fromEntries(partes.map(x => [x.type, x.value]));
  return Number(p.hour) * 60 + Number(p.minute);
}

function fechaEsValida(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const d = new Date(`${fecha}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha;
}

function esHorarioPasado(fecha, minutos) {
  const hoy = fechaLocalColombia();
  return fecha < hoy || (fecha === hoy && minutos <= minutosLocalesColombia());
}

function listarMedicos(req, res) {
  const medicos = db.prepare('SELECT id, nombre, especialidad FROM medicos ORDER BY nombre').all();
  return res.json({ medicos });
}

function consultarDisponibilidad(req, res) {
  const { medicoId, fecha } = req.query;
  if (!medicoId || !fecha) return res.status(400).json({ error: 'Debes indicar médico y fecha.' });
  if (!fechaEsValida(fecha)) return res.status(400).json({ error: 'La fecha debe ser válida y tener formato YYYY-MM-DD.' });
  if (fecha < fechaLocalColombia()) {
    return res.json({ medico: null, fecha, horariosDisponibles: [], mensaje: 'No se pueden consultar horarios de fechas pasadas.' });
  }

  const medico = db.prepare('SELECT id, nombre, especialidad FROM medicos WHERE id = ?').get(medicoId);
  if (!medico) return res.status(404).json({ error: 'Médico no encontrado.' });

  const ocupados = db.prepare(
    `SELECT hora_minutos FROM citas
     WHERE medico_id = ? AND fecha = ? AND estado = 'confirmada'
     ORDER BY hora_minutos ASC`
  ).all(medicoId, fecha).map(fila => fila.hora_minutos);

  const horariosDisponibles = generarHorariosBase()
    .filter(minutos => estaDisponible(ocupados, minutos))
    .filter(minutos => !esHorarioPasado(fecha, minutos))
    .map(minutosAHora);

  return res.json({ medico, fecha, horariosDisponibles });
}

function agendarCita(req, res) {
  const pacienteEmail = req.headers['x-usuario-email'];
  const { medicoId, fecha, hora } = req.body || {};
  if (!pacienteEmail) return res.status(401).json({ error: 'No se pudo identificar al usuario autenticado.' });
  if (!medicoId || !fecha || !hora) {
    return res.status(400).json({ error: 'Debes indicar médico, fecha y hora.' });
  }
  if (!fechaEsValida(fecha)) return res.status(400).json({ error: 'La fecha debe ser válida y tener formato YYYY-MM-DD.' });

  const medico = db.prepare('SELECT * FROM medicos WHERE id = ?').get(medicoId);
  if (!medico) return res.status(404).json({ error: 'Médico no encontrado.' });

  const horaMinutos = horaAMinutos(hora);
  if (horaMinutos === null || horaMinutos < 0 || horaMinutos >= 24 * 60 || minutosAHora(horaMinutos) !== hora) {
    return res.status(400).json({ error: 'La hora debe tener formato HH:MM, por ejemplo 08:30.' });
  }
  if (!generarHorariosBase().includes(horaMinutos)) {
    return res.status(400).json({ error: 'La hora seleccionada está fuera del horario de atención.' });
  }
  if (esHorarioPasado(fecha, horaMinutos)) {
    return res.status(400).json({ error: 'No puedes agendar una cita en una fecha u hora que ya pasó.' });
  }

  const ocupados = db.prepare(
    `SELECT hora_minutos FROM citas
     WHERE medico_id = ? AND fecha = ? AND estado = 'confirmada'
     ORDER BY hora_minutos ASC`
  ).all(medicoId, fecha).map(fila => fila.hora_minutos);
  if (!estaDisponible(ocupados, horaMinutos)) {
    return res.status(409).json({ error: 'Ese horario acaba de ocuparse. Actualiza la disponibilidad y elige otro.' });
  }

  let resultado;
  try {
    resultado = db.prepare(
      `INSERT INTO citas (paciente_email, medico_id, fecha, hora_minutos, estado)
       VALUES (?, ?, ?, ?, 'confirmada')`
    ).run(pacienteEmail, medicoId, fecha, horaMinutos);
  } catch (error) {
    return res.status(500).json({ error: 'No fue posible guardar la cita. Inténtalo nuevamente.' });
  }

  const cita = {
    id: resultado.lastInsertRowid, pacienteEmail, medico: medico.nombre,
    especialidad: medico.especialidad, fecha, hora, estado: 'confirmada'
  };
  try { publicarEvento('CITA_CONFIRMADA', cita); } catch (error) {
    console.error('No se pudo publicar el evento de cita confirmada:', error.message);
  }
  return res.status(201).json({ mensaje: 'Cita agendada exitosamente.', cita });
}

function listarMisCitas(req, res) {
  const email = req.headers['x-usuario-email'];
  if (!email) return res.status(401).json({ error: 'No se pudo identificar al usuario autenticado.' });
  const filas = db.prepare(
    `SELECT c.id, c.fecha, c.hora_minutos, c.estado, m.nombre AS medico, m.especialidad
     FROM citas c JOIN medicos m ON m.id = c.medico_id
     WHERE c.paciente_email = ?
     ORDER BY c.fecha ASC, c.hora_minutos ASC`
  ).all(email);
  const citas = filas.map(c => ({
    id: c.id, fecha: c.fecha, hora: minutosAHora(c.hora_minutos),
    estado: c.estado, medico: c.medico, especialidad: c.especialidad
  }));
  return res.json({ citas });
}

module.exports = { listarMedicos, consultarDisponibilidad, agendarCita, listarMisCitas };
