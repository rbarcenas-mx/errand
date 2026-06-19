# Mandadero

App que conecta personas que necesitan mandados con otras dispuestas a realizarlos en Querétaro y área metropolitana.

## Stack

- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: PostgreSQL + PostGIS + Prisma ORM
- **Notificaciones**: Twilio (SMS + WhatsApp)
- **Almacenamiento**: Cloudinary
- **Autenticación**: JWT + OTP vía SMS
- **CI/CD**: GitHub Actions

## Requisitos

- Node.js >= 18
- PostgreSQL >= 14 con PostGIS
- Cuenta de Twilio (SMS)
- Cuenta de Cloudinary (imágenes)

## Setup

```bash
npm install
cp .env.example .env
# Editar .env con las credenciales reales
npx prisma migrate deploy
npm run dev
```

## Estructura del proyecto

```
src/
  config/         # Configuración (env, prisma)
  controllers/    # Controladores de rutas
  middleware/      # Auth, errores, upload
  repositories/   # Acceso a datos (Prisma)
  routes/         # Definición de rutas
  services/       # Lógica de negocio
  utils/          # Logger y utilidades
prisma/
  schema.prisma   # Modelo de datos
  migrations/     # Migraciones
tests/
  integration/    # Tests de integración
docs/
  api.yaml        # Documentación OpenAPI
```

## API Endpoints

### Autenticación
- `POST /api/v1/auth/register` — Registrar usuario
- `POST /api/v1/auth/verify-otp` — Verificar código OTP
- `POST /api/v1/auth/refresh` — Renovar token
- `POST /api/v1/auth/logout` — Cerrar sesión
- `POST /api/v1/auth/verify-identity` — Subir INE + selfie
- `GET /api/v1/auth/verification-status` — Estado de verificación

### Mandados
- `GET /api/v1/mandados?lat={}&lng={}` — Listar mandados cercanos
- `POST /api/v1/mandados` — Crear mandado
- `GET /api/v1/mandados/:id` — Detalle de mandado
- `PATCH /api/v1/mandados/:id/estado` — Cambiar estado

### Ofertas
- `POST /api/v1/mandados/:id/ofertas` — Enviar oferta
- `GET /api/v1/mandados/:id/ofertas` — Listar ofertas
- `PATCH /api/v1/ofertas/:id` — Aceptar/rechazar oferta

### Calificaciones
- `POST /api/v1/calificaciones` — Calificar contraparte

### Webhooks
- `POST /api/twilio` — Webhook de Twilio

## Comandos

```bash
npm run dev              # Servidor de desarrollo con hot-reload
npm run build            # Compilar TypeScript
npm start                # Iniciar en producción
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Sembrar datos de prueba
npm test                 # Ejecutar tests
npm run lint             # Lint
npm run format           # Formatear código
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `TWILIO_ACCOUNT_SID` | SID de cuenta Twilio |
| `TWILIO_AUTH_TOKEN` | Token de autenticación Twilio |
| `TWILIO_PHONE_NUMBER` | Número Twilio para SMS |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary |
| `CLOUDINARY_API_KEY` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary |
| `JWT_SECRET` | Clave secreta para JWT |
| `JWT_EXPIRES_IN` | Duración del token (default: 1h) |
| `PORT` | Puerto del servidor (default: 3000) |
| `NODE_ENV` | Entorno (development, test, production) |
