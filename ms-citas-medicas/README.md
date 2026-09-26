# ms-citas-medicas

Microservicio de citas médicas del sistema EPS. Implementa:

- **SCRUM-13**: Ver horarios disponibles de un médico
- **SCRUM-14**: Agendar una cita médica

## Cómo correrlo

```bash
cd ms-citas-medicas
npm install
cp .env.example .env
npm start
```

El servicio queda escuchando en `http://localhost:3002`.

## Datos de prueba (se crean automáticamente)

Al iniciar por primera vez se crean 2 médicos de ejemplo:
- `id 1`: Dra. Ana Gómez — Medicina General
- `id 2`: Dr. Luis Torres — Pediatría

Horario de atención: **08:00 a 17:00**, cada 30 minutos.

## Endpoints

### Listar médicos — `GET /api/citas/medicos`
```bash
curl http://localhost:3002/api/citas/medicos
```

### Ver disponibilidad — `GET /api/citas/disponibilidad` (SCRUM-13)
```bash
curl "http://localhost:3002/api/citas/disponibilidad?medicoId=1&fecha=2026-10-01"
```

### Agendar una cita — `POST /api/citas/agendar` (SCRUM-14)
```bash
curl -X POST http://localhost:3002/api/citas/agendar \
  -H "Content-Type: application/json" \
  -d '{"pacienteEmail":"paciente@correo.com","medicoId":1,"fecha":"2026-10-01","hora":"09:00"}'
```

Si vuelves a consultar la disponibilidad de ese médico y fecha, la hora `09:00` ya no debe aparecer. Si otro paciente intenta agendar esa misma hora, el servicio responde con error 409.

## Cómo funciona (algoritmo)

La disponibilidad se calcula así:
1. Se generan los horarios base del día (`src/utils/horarios.js`)
2. Se consultan las citas ya confirmadas para ese médico y fecha (ordenadas)
3. Se filtra cada horario base usando **búsqueda binaria** (`src/utils/busquedaBinaria.js`) — el mismo algoritmo documentado en `Algoritmos_pruebas/validarCitaDisponible.js` del taller anterior

## Bus de mensajería (simulado)

Al agendar una cita, se dispara un evento (`src/utils/busEventos.js`) que por ahora solo se imprime en consola. Cuando se construya `ms-notificaciones` (Sprint 2), este archivo se reemplaza por la integración real, sin tocar el resto del código.

## Base de datos

SQLite (archivo `citas.db`, independiente de la de `ms-autenticacion`).
