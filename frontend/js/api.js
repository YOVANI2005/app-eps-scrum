const URL_BASE = 'http://localhost:3000';

const Sesion = {
  guardarToken(token, email) {
    localStorage.setItem('eps_token', token);
    localStorage.setItem('eps_email', email);
  },
  obtenerToken() { return localStorage.getItem('eps_token'); },
  obtenerEmail() { return localStorage.getItem('eps_email'); },
  cerrarSesion() {
    localStorage.removeItem('eps_token');
    localStorage.removeItem('eps_email');
  },
  haySesion() { return Boolean(this.obtenerToken()); },
};

async function llamarApi(ruta, opciones = {}) {
  const encabezados = { Accept: 'application/json', ...(opciones.headers || {}) };
  if (opciones.body !== undefined) encabezados['Content-Type'] = 'application/json';
  const token = Sesion.obtenerToken();
  if (token) encabezados.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, { ...opciones, headers: encabezados });
  } catch (error) {
    throw new Error('No hay conexión con el sistema. Verifica que los cinco servicios estén ejecutándose.');
  }
  const datos = await respuesta.json().catch(() => ({}));

  if (respuesta.status === 401 && token) {
    Sesion.cerrarSesion();
    window.dispatchEvent(new CustomEvent('eps-sesion-expirada'));
  }
  if (!respuesta.ok) throw new Error(datos.error || `La solicitud falló (${respuesta.status}).`);
  return datos;
}

const Api = {
  registrar: (email, password) =>
    llamarApi('/api/auth/registro', { method: 'POST', body: JSON.stringify({ email, password }) }),
  iniciarSesion: (email, password) =>
    llamarApi('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  listarMedicos: () => llamarApi('/api/citas/medicos'),
  consultarDisponibilidad: (medicoId, fecha) =>
    llamarApi(`/api/citas/disponibilidad?medicoId=${encodeURIComponent(medicoId)}&fecha=${encodeURIComponent(fecha)}`),
  agendarCita: (medicoId, fecha, hora) =>
    llamarApi('/api/citas/agendar', { method: 'POST', body: JSON.stringify({ medicoId, fecha, hora }) }),
  listarMisCitas: () => llamarApi('/api/citas/mis-citas'),
  obtenerPerfil: () => llamarApi('/api/afiliados/perfil'),
  guardarPerfil: (perfil) =>
    llamarApi('/api/afiliados/perfil', { method: 'POST', body: JSON.stringify(perfil) }),
};
