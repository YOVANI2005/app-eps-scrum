// Genera los horarios base de atencion de un medico: 08:00 a 17:00,
// cada 30 minutos (18 horarios por dia), como minutos desde las 00:00.

function generarHorariosBase() {
  const horarios = [];
  const INICIO = 8 * 60;  // 08:00
  const FIN = 17 * 60;    // 17:00
  const INTERVALO = 30;   // minutos

  for (let minutos = INICIO; minutos < FIN; minutos += INTERVALO) {
    horarios.push(minutos);
  }
  return horarios; // ya viene ordenado de menor a mayor
}

function minutosAHora(minutos) {
  const horas = Math.floor(minutos / 60)
    .toString()
    .padStart(2, '0');
  const mins = (minutos % 60).toString().padStart(2, '0');
  return `${horas}:${mins}`;
}

function horaAMinutos(horaTexto) {
  // horaTexto formato "HH:MM"
  const [horas, minutos] = horaTexto.split(':').map(Number);
  if (Number.isNaN(horas) || Number.isNaN(minutos)) return null;
  return horas * 60 + minutos;
}

module.exports = { generarHorariosBase, minutosAHora, horaAMinutos };
