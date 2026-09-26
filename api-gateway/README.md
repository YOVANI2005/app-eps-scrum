# api-gateway

Punto único de entrada del sistema EPS. Implementa **SCRUM-28**: enruta las peticiones, valida JWT y aplica límite de peticiones.

⚠️ **Este servicio necesita que `ms-autenticacion` y `ms-citas-medicas` estén corriendo al mismo tiempo**, porque se limita a reenviarles las peticiones.

## Cómo correrlo

```bash
cd api-gateway
npm install
cp .env.example .env
npm start
```

El Gateway queda escuchando en `http://localhost:3000`.

⚠️ **Importante**: el `JWT_SECRET` en `api-gateway/.env` debe ser **idéntico** al de `ms-autenticacion/.env`, o el Gateway no podrá validar los tokens que genera `ms-autenticacion`.

## Cómo probarlo (con los 3 servicios corriendo)

Necesitas **3 terminales abiertas al mismo tiempo**, una por cada servicio:

| Terminal | Comando | Puerto |
|---|---|---|
| 1 | `cd ms-autenticacion && npm start` | 3001 |
| 2 | `cd ms-citas-medicas && npm start` | 3002 |
| 3 | `cd api-gateway && npm start` | 3000 |

Desde una **4ta terminal**, prueba TODO a través del Gateway (puerto 3000, no 3001 ni 3002):

### 1. Registro (ruta pública, no necesita token)
```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"email":"paciente2@correo.com","password":"clave1234"}'
```

### 2. Login (ruta pública, no necesita token) — copia el `token` de la respuesta
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"paciente2@correo.com","password":"clave1234"}'
```

### 3. Ver disponibilidad SIN token (debe fallar con 401)
```bash
curl "http://localhost:3000/api/citas/disponibilidad?medicoId=1&fecha=2026-10-01"
```

### 4. Ver disponibilidad CON token (debe funcionar) — reemplaza TU_TOKEN por el del paso 2
```bash
curl "http://localhost:3000/api/citas/disponibilidad?medicoId=1&fecha=2026-10-01" \
  -H "Authorization: Bearer TU_TOKEN"
```

## Reglas implementadas

| Regla | Dónde |
|---|---|
| Enruta `/api/auth/*` → `ms-autenticacion`, `/api/citas/*` → `ms-citas-medicas` | `src/app.js` |
| Login/registro son públicos (sin JWT) | `src/app.js` |
| Todo lo demás exige JWT válido | `src/middleware/verificarToken.js` |
| Límite de 100 peticiones/minuto (por usuario si está logueado, por IP si no) | `src/middleware/limitador.js` |
