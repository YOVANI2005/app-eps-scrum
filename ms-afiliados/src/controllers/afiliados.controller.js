const db = require('../config/db');

const TIPOS_VALIDOS = ['contributivo', 'subsidiado'];

function tipoValido(tipo) {
  return TIPOS_VALIDOS.includes(tipo);
}

function fechaValida(fecha) {
  // Formato YYYY-MM-DD, fecha real y no posterior al día actual en Colombia.
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const d = new Date(`${fecha}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== fecha) return false;
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const p = Object.fromEntries(partes.map(x => [x.type, x.value]));
  const hoy = `${p.year}-${p.month}-${p.day}`;
  return fecha <= hoy;
}

function documentoValido(documento) {
  return typeof documento === 'string' && documento.trim().length >= 5;
}

function formatearPerfil(fila) {
  return {
    nombreCompleto: fila.nombre_completo,
    documento: fila.documento,
    fechaNacimiento: fila.fecha_nacimiento,
    tipoAfiliacion: fila.tipo_afiliacion,
    estado: fila.estado,
  };
}

// ---------------------------------------------------------------
// SCRUM-16: "Como afiliado, quiero registrar mis datos personales
// y mi tipo de afiliación, para quedar correctamente vinculado a
// la EPS." (también cubre la actualización: US-06)
// ---------------------------------------------------------------
function guardarPerfil(req, res) {
  const email = req.headers['x-usuario-email'];
  if (!email) {
    return res.status(401).json({ error: 'No se pudo identificar al usuario.' });
  }

  const { nombreCompleto, fechaNacimiento, tipoAfiliacion } = req.body || {};
  const documento = typeof req.body?.documento === 'string' ? req.body.documento.trim() : req.body?.documento;

  if (typeof nombreCompleto !== 'string' || nombreCompleto.trim().length < 3) {
    return res.status(400).json({ error: 'El nombre completo debe tener al menos 3 caracteres.' });
  }
  if (!documentoValido(documento)) {
    return res.status(400).json({ error: 'El número de documento no es válido.' });
  }
  if (!fechaValida(fechaNacimiento)) {
    return res.status(400).json({ error: 'La fecha de nacimiento debe ser válida, usar formato YYYY-MM-DD y no ser futura.' });
  }
  if (!tipoValido(tipoAfiliacion)) {
    return res.status(400).json({ error: 'El tipo de afiliación debe ser "contributivo" o "subsidiado".' });
  }

  // Impedir que el documento ya pertenezca a OTRO afiliado (SCRUM-16, criterio de aceptacion)
  const documentoDeOtro = db
    .prepare('SELECT id FROM afiliados WHERE documento = ? AND email != ?')
    .get(documento, email);
  if (documentoDeOtro) {
    return res.status(409).json({ error: 'Ese número de documento ya está registrado por otro afiliado.' });
  }

  const yaExiste = db.prepare('SELECT id FROM afiliados WHERE email = ?').get(email);

  if (yaExiste) {
    db.prepare(
      `UPDATE afiliados
       SET nombre_completo = ?, documento = ?, fecha_nacimiento = ?, tipo_afiliacion = ?,
           actualizado_en = datetime('now')
       WHERE email = ?`
    ).run(nombreCompleto.trim(), documento, fechaNacimiento, tipoAfiliacion, email);
  } else {
    db.prepare(
      `INSERT INTO afiliados (email, nombre_completo, documento, fecha_nacimiento, tipo_afiliacion, estado)
       VALUES (?, ?, ?, ?, ?, 'activo')`
    ).run(email, nombreCompleto.trim(), documento, fechaNacimiento, tipoAfiliacion);
  }

  const perfil = db.prepare('SELECT * FROM afiliados WHERE email = ?').get(email);
  return res.status(200).json({
    mensaje: yaExiste ? 'Perfil actualizado exitosamente.' : 'Perfil registrado exitosamente.',
    perfil: formatearPerfil(perfil),
  });
}

// ---------------------------------------------------------------
// SCRUM-17: "Como afiliado, quiero consultar mi estado de
// afiliación y mis datos personales, para verificar que mi
// información esté correcta."
// ---------------------------------------------------------------
function obtenerPerfil(req, res) {
  const email = req.headers['x-usuario-email'];
  if (!email) {
    return res.status(401).json({ error: 'No se pudo identificar al usuario.' });
  }

  const perfil = db.prepare('SELECT * FROM afiliados WHERE email = ?').get(email);
  return res.status(200).json({ perfil: perfil ? formatearPerfil(perfil) : null });
}

module.exports = { guardarPerfil, obtenerPerfil };
