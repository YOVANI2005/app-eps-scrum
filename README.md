# app-eps-scrum

Aplicativo de microservicios para una EPS, construido con metodología **Scrum**.

**Equipo:**
- César Yovany Rua Quiñones — Developer
- Diego Alexander Cuero Castillo — Product Owner
- Oscar Caicedo — Scrum Master

**Gestión del proyecto:** Jira (`epscrum.atlassian.net`, proyecto `App-EPS`)

## Microservicios (arquitectura completa)

| Microservicio | Estado | Historias Jira |
|---|---|---|
| `ms-autenticacion` | ✅ Construido (Sprint 1) | SCRUM-10, SCRUM-11 |
| `ms-citas-medicas` | 🔜 Próximo (Sprint 1) | SCRUM-13, SCRUM-14 |
| `api-gateway` | 🔜 Próximo (Sprint 1) | SCRUM-28 |
| `ms-afiliados` | ⏳ Backlog (Sprint 2+) | SCRUM-16, SCRUM-17 |
| `ms-historia-clinica` | ⏳ Backlog (Sprint 2+) | SCRUM-18, SCRUM-19 |
| `ms-autorizaciones` | ⏳ Backlog (Sprint 3) | SCRUM-20, SCRUM-21 |
| `ms-facturacion` | ⏳ Backlog (Sprint 3) | SCRUM-22, SCRUM-23 |
| `ms-farmacia` | ⏳ Backlog (Sprint 3) | SCRUM-24, SCRUM-25 |
| `ms-notificaciones` | ⏳ Backlog (Sprint 2+) | SCRUM-26, SCRUM-27 |

## Stack técnico

- **Backend:** Node.js + Express
- **Base de datos:** SQLite (una por microservicio, patrón *database per service*)
- **Autenticación:** JWT
- **Gestión ágil:** Jira (Scrum)

## Cómo correr un microservicio

Cada microservicio es independiente. Entra a su carpeta y sigue su propio `README.md`:

```bash
cd ms-autenticacion
npm install
cp .env.example .env
npm start
```
