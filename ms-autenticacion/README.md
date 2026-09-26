# ms-autenticacion

Microservicio de autenticación del sistema EPS. Implementa las historias del **Sprint 1**:

- **SCRUM-10**: Registro de usuarios (correo + contraseña)
- **SCRUM-11**: Inicio de sesión con JWT y bloqueo tras 5 intentos fallidos

## Cómo correrlo

```bash
cd ms-autenticacion
npm install
cp .env.example .env
npm start
```

El servicio queda escuchando en `http://localhost:3001`.

## Probar que funciona

```bash
curl http://localhost:3001/health
```

## Endpoints

### Registrar un usuario — `POST /api/auth/registro`

```bash
curl -X POST http://localhost:3001/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"email":"paciente@correo.com","password":"clave1234"}'
```

Respuesta esperada (201):
```json
{
  "mensaje": "Usuario registrado exitosamente.",
  "usuario": { "id": 1, "email": "paciente@correo.com", "rol": "paciente" }
}
```

### Iniciar sesión — `POST /api/auth/login`

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"paciente@correo.com","password":"clave1234"}'
```

Respuesta esperada (200):
```json
{
  "mensaje": "Inicio de sesión exitoso.",
  "token": "xxxxx.yyyyy.zzzzz",
  "usuario": { "id": 1, "email": "paciente@correo.com", "rol": "paciente" }
}
```

Si fallas la contraseña 5 veces seguidas, la cuenta se bloquea 5 minutos (HTTP 429).

## Reglas de negocio implementadas

| Regla | Dónde |
|---|---|
| Contraseña mínimo 8 caracteres + 1 número | `src/utils/validators.js` |
| Correo con formato válido y sin duplicados | `src/controllers/auth.controller.js` |
| Token JWT válido 24 horas | `src/controllers/auth.controller.js` |
| Bloqueo tras 5 intentos fallidos (5 min) | `src/middleware/controlIntentos.js` |
| Contraseñas encriptadas (bcrypt) | `src/controllers/auth.controller.js` |

## Base de datos

SQLite (archivo `autenticacion.db`, se crea automáticamente al iniciar por primera vez). No requiere instalar ningún servidor de base de datos.
