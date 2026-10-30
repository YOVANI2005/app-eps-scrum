# VidaEPS — Portal de atención al afiliado

Proyecto académico construido con Node.js, Express, SQLite y un frontend web estático. La arquitectura conserva cuatro servicios: autenticación, citas médicas, afiliados y API Gateway.

## Requisitos

- Node.js 20 o superior recomendado.
- npm.
- Navegador moderno.

## Instalación inicial

Abre una terminal en cada carpeta de servicio y ejecuta `npm install` una sola vez:

```powershell
cd ms-autenticacion
npm install
```

```powershell
cd ms-citas-medicas
npm install
```

```powershell
cd ms-afiliados
npm install
```

```powershell
cd api-gateway
npm install
```

El frontend no requiere instalación de dependencias: usa módulos incluidos en Node.js.

## Variables de entorno

Cada servicio incluye un archivo `.env.example`. Cópialo como `.env` en la misma carpeta y revisa sus valores. El `JWT_SECRET` debe ser exactamente el mismo en `ms-autenticacion/.env` y `api-gateway/.env`. Usa un secreto local largo y no lo publiques en GitHub.

## Cómo iniciar el sistema

Deja cada servicio abierto en su propia terminal. Inicia en este orden:

1. `cd ms-autenticacion` → `npm start` (puerto 3001).
2. `cd ms-citas-medicas` → `npm start` (puerto 3002).
3. `cd ms-afiliados` → `npm start` (puerto 3003).
4. `cd api-gateway` → `npm start` (puerto 3000).
5. `cd frontend` → `node server.js` (puerto 8080).

Abre `http://localhost:8080`.

## Flujos incluidos

- Crear cuenta e iniciar sesión mediante JWT.
- Consultar médicos y disponibilidad de horarios.
- Filtrar horarios anteriores a la hora actual usando la zona `America/Bogota`.
- Agendar citas; el correo del paciente se toma del token validado por el Gateway.
- Consultar las citas del usuario autenticado.
- Consultar, crear y actualizar el perfil del afiliado.
- Consultar el resumen del estado y tipo de afiliación.

## Comprobaciones manuales recomendadas

1. Registra una cuenta e inicia sesión.
2. Entra en **Mi perfil**, completa los datos y guarda.
3. Abre **Mi afiliación** y comprueba que aparecen los datos guardados.
4. Abre **Agendar cita**: las fechas pasadas deben rechazarse y los horarios anteriores a la hora actual no deben aparecer para hoy.
5. Confirma una cita y verifica que aparece en **Mis citas**.
6. Cierra sesión e inicia con otra cuenta para comprobar que no se muestran las citas de la cuenta anterior.

## GitHub y protección de secretos

Antes de publicar, confirma que `.env`, las bases de datos locales y credenciales no estén incluidos en el commit. El archivo `.gitignore` cubre estos elementos. Los `.env.example` solo contienen nombres de variables y valores de ejemplo.
