/**
 * busquedaBinaria.js
 * -------------------------------------------------------------
 * Mismo algoritmo que ya usamos en el taller de Git
 * (Algoritmos_pruebas/validarCitaDisponible.js), ahora integrado
 * como parte real del microservicio ms-citas-medicas.
 *
 * Dado un arreglo de horarios YA OCUPADOS (ordenados de menor a
 * mayor, en minutos desde las 00:00) y un horario a verificar,
 * determina si ese horario esta ocupado. O(log n).
 * -------------------------------------------------------------
 */

function busquedaBinaria(horariosOcupados, horarioBuscado) {
  let inicio = 0;
  let fin = horariosOcupados.length - 1;

  while (inicio <= fin) {
    const medio = Math.floor((inicio + fin) / 2);

    if (horariosOcupados[medio] === horarioBuscado) {
      return medio; // el horario ya esta ocupado
    } else if (horariosOcupados[medio] < horarioBuscado) {
      inicio = medio + 1;
    } else {
      fin = medio - 1;
    }
  }

  return -1; // no se encontro: el horario esta disponible
}

function estaDisponible(horariosOcupados, horarioBuscado) {
  return busquedaBinaria(horariosOcupados, horarioBuscado) === -1;
}

module.exports = { busquedaBinaria, estaDisponible };
