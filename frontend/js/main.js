const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const seccionAuth = $('#seccion-auth');
const seccionApp = $('#seccion-app');
const cabeceraSesion = $('#cabecera-sesion');
const textoUsuario = $('#texto-usuario');
const avatarUsuario = $('#avatar-usuario');
const btnSalir = $('#btn-salir');
const formLogin = $('#form-login');
const formRegistro = $('#form-registro');
const mensajeLogin = $('#mensaje-login');
const mensajeRegistro = $('#mensaje-registro');
const selectMedico = $('#select-medico');
const inputFecha = $('#input-fecha');
const btnVerDisponibilidad = $('#btn-ver-disponibilidad');
const mensajeDisponibilidad = $('#mensaje-disponibilidad');
const rejillaHorarios = $('#rejilla-horarios');
const btnAgendar = $('#btn-agendar');
const mensajeAgendar = $('#mensaje-agendar');
const listaMisCitas = $('#lista-mis-citas');
const mensajeMisCitas = $('#mensaje-mis-citas');
const formPerfil = $('#form-perfil');
const mensajePerfil = $('#mensaje-perfil');
const btnGuardarPerfil = $('#btn-guardar-perfil');
let horaSeleccionada = null;
let perfilActual = null;
let citasActuales = [];

function fechaLocal() {
  const ahora = new Date();
  const y = ahora.getFullYear();
  const m = String(ahora.getMonth() + 1).padStart(2, '0');
  const d = String(ahora.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function fechaLegible(fecha) {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function setMensaje(elemento, texto = '', tipo = '') {
  elemento.textContent = texto;
  elemento.className = `message${tipo ? ` is-${tipo}` : ''}`;
}
function activarVista(nombre) {
  $$('[data-seccion]').forEach((seccion) => { seccion.hidden = seccion.dataset.seccion !== nombre; });
  $$('.app-nav__item').forEach((boton) => {
    const activa = boton.dataset.vista === nombre;
    boton.classList.toggle('is-active', activa);
    boton.setAttribute('aria-current', activa ? 'page' : 'false');
  });
  if (nombre === 'perfil' || nombre === 'afiliacion') cargarPerfil();
  if (nombre === 'citas' || nombre === 'inicio') cargarMisCitas();
  if (nombre === 'agendar') cargarMedicos();
}
function mostrarPantallaSegunSesion() {
  const autenticado = Sesion.haySesion();
  seccionAuth.hidden = autenticado;
  seccionApp.hidden = !autenticado;
  cabeceraSesion.hidden = !autenticado;
  if (!autenticado) {
    textoUsuario.textContent = '';
    avatarUsuario.textContent = 'U';
    formLogin.reset();
    formRegistro.reset();
    setMensaje(mensajeLogin);
    setMensaje(mensajeRegistro);
    return;
  }
  const email = Sesion.obtenerEmail() || 'Usuario';
  textoUsuario.textContent = email;
  avatarUsuario.textContent = email.charAt(0).toUpperCase();
  $('#fecha-hoy').textContent = fechaLegible(fechaLocal());
  activarVista('inicio');
  cargarPerfil();
  cargarMedicos();
}
btnSalir.addEventListener('click', () => {
  Sesion.cerrarSesion();
  perfilActual = null;
  citasActuales = [];
  mostrarPantallaSegunSesion();
});
window.addEventListener('eps-sesion-expirada', () => {
  mostrarPantallaSegunSesion();
  setMensaje(mensajeLogin, 'Tu sesión venció. Ingresa nuevamente.', 'error');
});
$$('.tabs__item').forEach((tab) => tab.addEventListener('click', () => {
  const registro = tab.dataset.pestana === 'registro';
  $$('.tabs__item').forEach((item) => {
    const activa = item === tab;
    item.classList.toggle('is-active', activa);
    item.setAttribute('aria-selected', String(activa));
  });
  formLogin.hidden = registro;
  formRegistro.hidden = !registro;
}));
formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  setMensaje(mensajeLogin, 'Validando tus datos…');
  const datos = new FormData(formLogin);
  try {
    const respuesta = await Api.iniciarSesion(datos.get('email').trim(), datos.get('password'));
    Sesion.guardarToken(respuesta.token, respuesta.usuario.email);
    formLogin.reset();
    mostrarPantallaSegunSesion();
  } catch (error) {
    setMensaje(mensajeLogin, error.message, 'error');
    formLogin.elements.password.value = '';
  }
});
formRegistro.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  setMensaje(mensajeRegistro, 'Creando tu cuenta…');
  const datos = new FormData(formRegistro);
  try {
    await Api.registrar(datos.get('email').trim(), datos.get('password'));
    formRegistro.reset();
    $$('.tabs__item').find((item) => item.dataset.pestana === 'login').click();
    formLogin.elements.email.value = datos.get('email').trim();
    setMensaje(mensajeLogin, 'Cuenta creada. Ya puedes iniciar sesión.', 'success');
    formLogin.elements.password.focus();
  } catch (error) {
    setMensaje(mensajeRegistro, error.message, 'error');
  }
});

async function cargarMedicos() {
  if (!Sesion.haySesion()) return;
  try {
    const respuesta = await Api.listarMedicos();
    const medicos = respuesta.medicos || [];
    const anterior = selectMedico.value;
    selectMedico.innerHTML = '<option value="">Selecciona un médico</option>' + medicos.map((m) =>
      `<option value="${escapeHtml(m.id)}">${escapeHtml(m.nombre)} — ${escapeHtml(m.especialidad)}</option>`
    ).join('');
    if (medicos.some((m) => String(m.id) === anterior)) selectMedico.value = anterior;
    if (!medicos.length) setMensaje(mensajeDisponibilidad, 'No hay médicos registrados en el sistema.', 'error');
  } catch (error) {
    selectMedico.innerHTML = '<option value="">No fue posible cargar los médicos</option>';
    setMensaje(mensajeDisponibilidad, error.message, 'error');
  }
}
function limpiarHorarios(mensaje = '') {
  rejillaHorarios.innerHTML = '';
  btnAgendar.hidden = true;
  horaSeleccionada = null;
  $('#texto-seleccion-hora').textContent = 'Selecciona un horario para continuar.';
  setMensaje(mensajeDisponibilidad, mensaje);
  setMensaje(mensajeAgendar);
}
selectMedico.addEventListener('change', () => limpiarHorarios('Consulta nuevamente para ver la disponibilidad actualizada.'));
inputFecha.addEventListener('change', () => limpiarHorarios('Consulta nuevamente para ver la disponibilidad actualizada.'));
btnVerDisponibilidad.addEventListener('click', async () => {
  limpiarHorarios();
  const medicoId = selectMedico.value;
  const fecha = inputFecha.value;
  if (!medicoId || !fecha) return setMensaje(mensajeDisponibilidad, 'Selecciona un médico y una fecha.', 'error');
  if (fecha < fechaLocal()) return setMensaje(mensajeDisponibilidad, 'Selecciona hoy o una fecha futura. No se permiten citas en el pasado.', 'error');
  btnVerDisponibilidad.disabled = true;
  btnVerDisponibilidad.textContent = 'Consultando…';
  try {
    const respuesta = await Api.consultarDisponibilidad(medicoId, fecha);
    const horarios = respuesta.horariosDisponibles || [];
    if (!horarios.length) {
      setMensaje(mensajeDisponibilidad, respuesta.mensaje || 'No hay horarios disponibles para esta fecha. Prueba con otro día.');
      return;
    }
    rejillaHorarios.innerHTML = horarios.map((hora) =>
      `<button type="button" class="time-slot" data-hora="${escapeHtml(hora)}"><span>${escapeHtml(hora)}</span><small>Disponible</small></button>`
    ).join('');
    setMensaje(mensajeDisponibilidad, `${horarios.length} horarios disponibles para el ${fechaLegible(fecha)}.`, 'success');
  } catch (error) {
    setMensaje(mensajeDisponibilidad, error.message, 'error');
  } finally {
    btnVerDisponibilidad.disabled = false;
    btnVerDisponibilidad.textContent = 'Consultar horarios';
  }
});
rejillaHorarios.addEventListener('click', (evento) => {
  const slot = evento.target.closest('.time-slot');
  if (!slot) return;
  $$('.time-slot').forEach((el) => el.classList.remove('is-selected'));
  slot.classList.add('is-selected');
  horaSeleccionada = slot.dataset.hora;
  $('#texto-seleccion-hora').textContent = `Horario seleccionado: ${horaSeleccionada}`;
  btnAgendar.hidden = false;
  setMensaje(mensajeAgendar);
});
btnAgendar.addEventListener('click', async () => {
  if (!horaSeleccionada) return setMensaje(mensajeAgendar, 'Selecciona un horario antes de confirmar.', 'error');
  btnAgendar.disabled = true;
  btnAgendar.textContent = 'Guardando cita…';
  try {
    const respuesta = await Api.agendarCita(selectMedico.value, inputFecha.value, horaSeleccionada);
    setMensaje(mensajeAgendar, respuesta.mensaje || 'Cita confirmada correctamente.', 'success');
    limpiarHorarios();
    setMensaje(mensajeDisponibilidad, 'Tu cita quedó registrada. Se actualizó la disponibilidad.', 'success');
    await cargarMisCitas();
    await consultarHorariosSilencioso();
  } catch (error) {
    setMensaje(mensajeAgendar, error.message, 'error');
  } finally {
    btnAgendar.disabled = false;
    btnAgendar.textContent = 'Confirmar cita';
  }
});
async function consultarHorariosSilencioso() {
  if (!selectMedico.value || !inputFecha.value) return;
  try {
    const respuesta = await Api.consultarDisponibilidad(selectMedico.value, inputFecha.value);
    const horarios = respuesta.horariosDisponibles || [];
    rejillaHorarios.innerHTML = horarios.map((hora) =>
      `<button type="button" class="time-slot" data-hora="${escapeHtml(hora)}"><span>${escapeHtml(hora)}</span><small>Disponible</small></button>`
    ).join('');
    if (!horarios.length) setMensaje(mensajeDisponibilidad, 'No quedan horarios disponibles para esta fecha.');
  } catch (error) {
    setMensaje(mensajeDisponibilidad, error.message, 'error');
  }
}

function renderCitas(citas) {
  if (!citas.length) return '<li class="empty-state"><span class="empty-state__icon">▦</span><strong>Aún no tienes citas</strong><span>Cuando agendes una cita, aparecerá aquí.</span></li>';
  return citas.map((c) => `<li class="appointment">
    <span class="appointment__icon">＋</span>
    <span class="appointment__main"><strong>${escapeHtml(c.medico)}</strong><small>${escapeHtml(c.especialidad)}</small></span>
    <span class="appointment__date"><strong>${escapeHtml(fechaLegible(c.fecha))}</strong><small>${escapeHtml(c.hora)}</small></span>
    <span class="appointment__status">${escapeHtml(c.estado || 'confirmada')}</span>
  </li>`).join('');
}
async function cargarMisCitas() {
  if (!Sesion.haySesion()) return;
  listaMisCitas.innerHTML = '<li class="empty-state">Consultando tus citas…</li>';
  setMensaje(mensajeMisCitas);
  try {
    const respuesta = await Api.listarMisCitas();
    citasActuales = Array.isArray(respuesta.citas) ? respuesta.citas : [];
    listaMisCitas.innerHTML = renderCitas(citasActuales);
    $('#resumen-citas').textContent = String(citasActuales.length);
    $('#resumen-lista-citas').innerHTML = citasActuales.length
      ? renderCitas(citasActuales.slice(0, 3))
      : '<li class="empty-state">No tienes citas registradas todavía.</li>';
  } catch (error) {
    listaMisCitas.innerHTML = '<li class="empty-state empty-state--error"><strong>No pudimos cargar tus citas</strong><span>Comprueba la conexión e inténtalo de nuevo.</span></li>';
    $('#resumen-lista-citas').innerHTML = '<li class="empty-state empty-state--error">No fue posible consultar tus citas.</li>';
    setMensaje(mensajeMisCitas, error.message, 'error');
    $('#resumen-citas').textContent = '—';
  }
}
$('#btn-recargar-citas').addEventListener('click', cargarMisCitas);
$$('[data-vista]').forEach((boton) => boton.addEventListener('click', () => activarVista(boton.dataset.vista)));
$$('[data-ir]').forEach((boton) => boton.addEventListener('click', () => activarVista(boton.dataset.ir)));

function rellenarPerfil(perfil) {
  perfilActual = perfil;
  if (!perfil) {
    formPerfil.reset();
    $('#nombre-bienvenida').textContent = 'bienvenido';
    $('#resumen-estado').textContent = 'Por completar';
    $('#resumen-tipo').textContent = 'Completa tu perfil para consultar tus datos.';
    $('#resumen-perfil').textContent = 'Pendientes';
    $('#afiliacion-contenido').innerHTML = `<div class="affiliation-empty"><span class="summary-card__icon">◎</span><h2>Aún no registras tu afiliación</h2><p>Completa los datos de tu perfil para consultar aquí el resumen de tu afiliación.</p><button class="button button--primary" data-ir="perfil">Completar mi perfil →</button></div>`;
    $('#afiliacion-contenido [data-ir="perfil"]')?.addEventListener('click', () => activarVista('perfil'));
    return;
  }
  formPerfil.elements.nombreCompleto.value = perfil.nombreCompleto || '';
  formPerfil.elements.documento.value = perfil.documento || '';
  formPerfil.elements.fechaNacimiento.value = perfil.fechaNacimiento || '';
  formPerfil.elements.tipoAfiliacion.value = perfil.tipoAfiliacion || '';
  $('#nombre-bienvenida').textContent = (perfil.nombreCompleto || 'bienvenido').split(' ')[0];
  $('#resumen-estado').textContent = perfil.estado === 'activo' ? 'Activa' : (perfil.estado || 'Pendiente');
  $('#resumen-tipo').textContent = perfil.tipoAfiliacion === 'contributivo' ? 'Régimen contributivo' : 'Régimen subsidiado';
  $('#resumen-perfil').textContent = 'Completo';
  $('#afiliacion-contenido').innerHTML = `<div class="affiliation-top"><span class="summary-card__icon summary-card__icon--green">✓</span><div><span class="eyebrow">ESTADO ACTUAL</span><h2>${escapeHtml(perfil.estado || 'Pendiente')}</h2><p>Información registrada en el sistema.</p></div><span class="status-pill"><i></i> ${escapeHtml(perfil.estado || 'Pendiente')}</span></div>
    <div class="detail-grid"><div><small>Nombre del afiliado</small><strong>${escapeHtml(perfil.nombreCompleto)}</strong></div><div><small>Documento</small><strong>${escapeHtml(perfil.documento)}</strong></div><div><small>Fecha de nacimiento</small><strong>${escapeHtml(fechaLegible(perfil.fechaNacimiento))}</strong></div><div><small>Régimen de afiliación</small><strong>${escapeHtml(perfil.tipoAfiliacion === 'contributivo' ? 'Contributivo' : 'Subsidiado')}</strong></div></div>
    <div class="affiliation-actions"><p>¿Necesitas corregir algún dato? Puedes actualizarlo desde tu perfil.</p><button class="button button--outline" data-ir="perfil">Editar mi perfil →</button></div>`;
  $('#afiliacion-contenido [data-ir="perfil"]')?.addEventListener('click', () => activarVista('perfil'));
}
async function cargarPerfil() {
  if (!Sesion.haySesion()) return;
  try {
    const respuesta = await Api.obtenerPerfil();
    rellenarPerfil(respuesta.perfil || null);
  } catch (error) {
    setMensaje(mensajePerfil, `No fue posible consultar el perfil: ${error.message}`, 'error');
    $('#afiliacion-contenido').innerHTML = '<div class="empty-state empty-state--error"><strong>No pudimos cargar tu afiliación</strong><span>Verifica que el servicio de afiliados esté activo e inténtalo nuevamente.</span></div>';
  }
}
formPerfil.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  setMensaje(mensajePerfil, 'Guardando tus datos…');
  btnGuardarPerfil.disabled = true;
  const datos = new FormData(formPerfil);
  const perfil = {
    nombreCompleto: String(datos.get('nombreCompleto') || '').trim(),
    documento: String(datos.get('documento') || '').trim(),
    fechaNacimiento: datos.get('fechaNacimiento'),
    tipoAfiliacion: datos.get('tipoAfiliacion'),
  };
  if (perfil.fechaNacimiento > fechaLocal()) {
    setMensaje(mensajePerfil, 'La fecha de nacimiento no puede ser futura.', 'error');
    btnGuardarPerfil.disabled = false;
    return;
  }
  try {
    const respuesta = await Api.guardarPerfil(perfil);
    rellenarPerfil(respuesta.perfil);
    setMensaje(mensajePerfil, respuesta.mensaje || 'Tus datos se guardaron correctamente.', 'success');
  } catch (error) {
    setMensaje(mensajePerfil, error.message, 'error');
  } finally {
    btnGuardarPerfil.disabled = false;
  }
});
$('#input-fecha').min = fechaLocal();
formPerfil.elements.fechaNacimiento.max = fechaLocal();
inputFecha.value = fechaLocal();
mostrarPantallaSegunSesion();
