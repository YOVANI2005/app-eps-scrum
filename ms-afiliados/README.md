# ms-afiliados

Microservicio de Gestión de Afiliados del sistema **App-EPS** (Sprint 2 — Épica EP-03).

## Historias de usuario que cubre

- **SCRUM-16** — Registrar/actualizar mis datos personales y tipo de afiliación.
- **SCRUM-17** — Consultar mi estado de afiliación y mis datos personales.

## Endpoints

Todos los endpoints requieren que la petición pase por el **API Gateway**
(puerto 3000), que valida el JWT y reenvía el correo del usuario autenticado
en el encabezado `X-Usuario-Email`.

| Método | Ruta (vía Gateway)      | Descripción                          |
|--------|--------------------------|---------------------------------------|
| GET    | `/api/afiliados/perfil`  | Consulta el perfil del usuario autenticado |
| POST   | `/api/afiliados/perfil`  | Registra o actualiza el perfil del usuario |

### Body de `POST /api/afiliados/perfil`

```json
{
  "nombreCompleto": "Juan Pérez",
  "documento": "1234567890",
  "fechaNacimiento": "1995-04-12",
  "tipoAfiliacion": "contributivo"
}
```

## Cómo correrlo de forma independiente

```bash
cd ms-afiliados
npm install
cp .env.example .env
npm start
```

Queda escuchando en `http://localhost:3003`.
