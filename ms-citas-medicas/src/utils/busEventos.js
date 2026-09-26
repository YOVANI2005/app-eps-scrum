// Simulacion simple del "bus de mensajeria" descrito en la arquitectura.
// En esta etapa del proyecto (Sprint 1), ms-notificaciones todavia no
// esta construido, asi que este modulo solo REGISTRA el evento en consola.
// Cuando se construya ms-notificaciones (Sprint 2), este archivo se
// reemplaza por una conexion real (ej: RabbitMQ, un webhook HTTP, etc.)
// sin tener que tocar el resto del controlador de citas.

function publicarEvento(nombreEvento, datos) {
  console.log(`[BUS DE MENSAJERIA] Evento: ${nombreEvento}`, datos);
  // TODO (Sprint 2): reemplazar por la integracion real con ms-notificaciones
}

module.exports = { publicarEvento };
