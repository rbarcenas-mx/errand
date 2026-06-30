# Plan de Implementación — Mandadero MVP

**Versión**: 1.1.0
**Fecha**: 2026-06-29
**Feature**: `specs/001-mandadero-mvp`

## Contexto Técnico

- **Frontend**: React Native (Expo managed) + React Navigation + Context API + fetch + StyleSheet
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL + PostGIS
- **Geocodificación**: Nominatim (OpenStreetMap) para normalización de direcciones y búsqueda inversa. Implementar caché de resultados en memoria para evitar solicitudes repetidas y respetar el límite de 1 solicitud/segundo. User-Agent configurado por política de uso. Precisión suficiente para zona metropolitana de Querétaro en MVP. Post-MVP: migrar a Google Places API para autocompletado y mayor precisión.
- **Notificaciones**: Twilio (SMS) limitado exclusivamente a registro, autenticación y recuperación de acceso. Mensajería del flujo de mandados (coordinación Solicitante-Mandadero) mediante mensajería interna en base de datos. Firebase Cloud Messaging (FCM) para notificaciones push en segundo plano. Las notificaciones in-app (polling) funcionan como fallback cuando FCM no está disponible.
- **Almacenamiento**: Cloudinary
- **Autenticación**: JWT (Access Token 1h + Refresh Token 30 días con rotación) + OTP vía SMS con endpoint de reenvío (`POST /api/v1/auth/resend-otp`) para casos de no recepción o expiración
- **Verificación identidad**: OCR + selfie (servicio cloud)
- **CI/CD**: GitHub Actions
- **Despliegue**: Railway.app o Fly.io
- **Seguridad (MVP)**: JWT con refresh tokens, OTP, rate limiting. Los números de teléfono se almacenan sin cifrado en BD — riesgo aceptado para MVP dado que el acceso a BD está limitado al backend. Post-MVP: cifrado a nivel de columna con pgcrypto si se requiere.

## Verificación de Constitución

| Principio | Implementado en el plan |
|---|---|
| Calidad de Código y Limpieza | ESLint + Prettier + TypeScript en setup de proyecto |
| Seguridad Primero | JWT con refresh tokens, validación de inputs, OTP en registro, manejo de datos sensibles |
| Pruebas Rigurosas | Suites de integración por endpoint + pipeline QA automatizado (`qa.prepare` + `qa.execute`) que genera y ejecuta planes de infraestructura y flujo multi-usuario. Contract tests diferidos a post-MVP. |
| UX Consistente | Diseño de API coherente, respuestas unificadas, validaciones claras |
| Rendimiento y Escalabilidad | PostgreSQL con índices geoespaciales, paginación en listados |

**Estado**: ✅ Todas las compuertas superadas

## Fases de Implementación

### Fase 0: Investigación (COMPLETADA)
- [x] `research.md` generado con decisiones tecnológicas

### Fase 1: Diseño (COMPLETADA)
- [x] `data-model.md` con entidades, relaciones y reglas de validación
- [x] `contracts/api.md` con contratos REST completos
- [x] `quickstart.md` con escenarios de validación

### Fase 2: Implementación (EN_PROGRESO)

#### Sprint 1 — Infraestructura y Autenticación
1. Inicializar proyecto Node.js + TypeScript
2. Configurar ESLint, Prettier, Jest
3. Configurar conexión PostgreSQL + migraciones
4. Implementar registro y OTP
5. Implementar verificación de identidad (subida de fotos + flujo de reintento tras rechazo + degradación a verificación manual cuando OCR falla)
6. Implementar flujo de Refresh Token (login, refresh, logout con revocación)
7. CI/CD básico (lint + test en PR)
8. Rate limiting por IP y por número de teléfono en endpoints de registro y verificación OTP para mitigar ataques de agotamiento de saldo (SMS Bombing)
9. Crear `.env.qa` como archivo de entorno para QA con Twilio/Cloudinary mock y `ALLOW_TEST_OTP=true`. Pipeline QA automatizado (`qa.prepare` + `qa.execute`) para validación de infraestructura y flujo multi-usuario.

#### Sprint 2 — Mandados y Ofertas
1. CRUD de mandados con búsqueda geoespacial
   - En listado: exponer solo `distancia_km` (calculada desde ubicación del usuario) y colonia/sector como dirección general
    - En detalle (`GET /:id`): exponer coordenadas exactas solo para el solicitante y el mandadero con oferta aceptada. Los demás ven solo colonia/sector con coordenadas aproximadas.
2. Envío y gestión de ofertas
3. Flujo de aceptación/rechazo de ofertas (solicitar confirmación explícita de consentimiento del solicitante antes de revelar contacto de ambas partes, implementado con transacción ACID en `mandado.service.ts`)
4. Cambio de estados de mandado (incluyendo cancelación por Solicitante y expiración automática)
5. Lógica de expiración de ofertas no aceptadas
6. Notificaciones de ofertas in-app (no SMS) — Twilio solo para auth
7. Restricción de publicación de mandados a usuarios verificados (aprobado o pendiente_manual)
8. Cuota global de SMS por hora a nivel de infraestructura como protección adicional contra ataques distribuidos (rate limiting por IP/teléfono implementado en Sprint 1)

#### Sprint 3 — Calificaciones y Cierre
1. Sistema de calificaciones
2. Cálculo de puntuación promedio
3. Validación de caso de borde (INE rechazado + flujo de reintento)
4. Pruebas de integración completas
5. Documentación técnica básica
6. Worker de limpieza de datos sensibles (cleanup.service.ts): eliminar fotos de verificación 90 días después de aprobación o 30 días después de rechazo. Las tareas asíncronas (expiraciones, limpieza) se ejecutan mediante cron jobs gestionados por node-cron en el mismo proceso del servidor. Para MVP no se requiere cola de mensajes externa.

#### Sprint 4 — Mensajería Interna (US4)
1. Implementar entidad Mensaje y migración en Prisma
2. Implementar GET /api/v1/mandados/:id/mensajes controller
3. Implementar POST /api/v1/mandados/:id/mensajes controller
4. Integrar mensajería con flujo de aceptación de oferta (apertura de canal)
5. Implementar restricción de solo lectura al completar/cancelar mandado
6. Pruebas de integración para mensajería

#### Sprint 5 — Verificación Manual (Admin)
1. Agregar estado `pendiente_manual` al flujo de verificación de identidad
2. Implementar captura de error de OCR en `verification.service.ts` con degradación a `pendiente_manual`
3. Crear ruta `GET /api/v1/admin/verificaciones-pendientes` para listar documentos pendientes de revisión manual
4. Crear ruta `POST /api/v1/admin/verificaciones/:id/revisar` para aprobar o rechazar manualmente
5. Notificar al usuario del resultado de la verificación manual
6. Pruebas de integración para el flujo de verificación manual
7. SLA de 12 horas hábiles para revisión manual con renotificación automática al equipo admin si se supera el plazo

#### Sprint 5b — Denuncias
1. Agregar modelo Denuncia a la base de datos
2. Crear endpoint `POST /api/v1/denuncias` para reportar incidentes
3. Crear ruta `GET /api/v1/admin/denuncias-pendientes` para listar denuncias
4. Crear ruta `POST /api/v1/admin/denuncias/:id/resolver` para sancionar o desestimar
5. Pruebas de integración para el flujo de denuncias

#### Sprint 5c — Backend touch-ups para frontend
1. Agregar endpoint `GET /api/v1/mis-mandados` — lista mandados activos del solicitante autenticado (`findActiveBySolicitante` ya existe en repositorio)
2. Agregar endpoint `GET /api/v1/mis-ofertas` — lista ofertas pendientes + aceptadas del mandadero autenticado
3. Agregar modelo `Favorito` (id_solicitante, id_mandadero, unique compuesto) y endpoints `POST /api/v1/favoritos` + `DELETE /api/v1/favoritos/:id_mandadero`
4. En `GET /api/v1/mandados/:id/ofertas` incluir campo `es_favorito` indicando si el solicitante marcó a ese mandadero como favorito

#### Sprint 6 — Notificaciones Push (Post-MVP)
1. Integrar Firebase Cloud Messaging (FCM) en el backend
2. Crear endpoint para registro de tokens de dispositivo (`POST /api/v1/notificaciones/registrar-token`)
3. Implementar servicio de notificaciones push para nuevos eventos: oferta recibida, oferta aceptada, mensaje nuevo, mandado completado
4. Notificaciones in-app (polling) como fallback cuando FCM no está disponible

#### Sprint 7 — Frontend Mobile (Expo)
1. Inicializar proyecto Expo + React Navigation con stacks Auth y Main
2. Crear `AuthContext` para manejo de token + refresh + logout
3. Crear `api.ts` con fetch wrapper (base URL, auth header, manejo de errores)
4. **Pantalla Register** — formulario nombre/teléfono/correo → `POST /auth/register`
5. **Pantalla VerifyOtp** — input código OTP, reenvío → `POST /auth/verify-otp`, `POST /auth/resend-otp`
6. **Pantalla VerifyIdentity** — cámara/subir INE + selfie → `POST /auth/verify-identity`
7. **Pantalla Home** — listado de mandados cercanos (solicita ubicación) → `GET /mandados?lat&lng`
8. **Pantalla CreateMandado** — formulario con tipo, direcciones recogida/entrega, descripción, foto, fecha límite → `POST /mandados`
9. **Pantalla MandadoDetail** — info completa del mandado, listado de ofertas, enviar oferta (mandadero), aceptar/rechazar (solicitante) con indicador de favorito → `GET /mandados/:id`, `POST /mandados/:id/ofertas`, `GET /mandados/:id/ofertas`, `PATCH /ofertas/:id`
10. **Pantalla MisMandados** — lista de mandados activos del solicitante → `GET /mis-mandados`
11. **Pantalla MisOfertas** — lista de ofertas pendientes (esperando respuesta) + activas (aceptadas, en progreso) del mandadero → `GET /mis-ofertas`
12. **Pantalla Chat** — canal de mensajería del mandado activo con polling → `GET|POST /mandados/:id/mensajes`
13. **Pantalla Rate** — calificación 1-5 a contraparte post-mandado → `POST /calificaciones`
14. **Pantalla Profile** — estado de verificación, eliminar cuenta, toggle a solicitante/mandadero → `GET /auth/verification-status`, `DELETE /auth/cuenta`

### Fase 3: Despliegue
1. Configurar ambiente de producción en Railway.app
2. Variables de entorno para producción
3. Migraciones automáticas en deploy
4. Monitoreo con Sentry
5. Pruebas de hum hum en producción

## Decisiones Aceptadas y Deuda Técnica

Hallazgos recurrentes de auditoría que son intencionales para el MVP:

| Hallazgo | Tipo | Decisión |
|----------|------|----------|
| FR-005: consentimiento explícito para revelar contacto | Decisión | Aceptar oferta = consentimiento implícito. Sin paso extra en MVP. |
| FR-007: notificar admin en pendiente_manual | Deuda | Sin notificación automática en MVP (admin revisa manualmente vía endpoint). |
| Contestabilidad de ofertas (PATCH acepta accion/estado) | Decisión | Ambos campos aceptados por flexibilidad; prioridad a `accion`. |
| Teléfonos en texto plano en BD | Decisión | Riesgo aceptado para MVP. Post-MVP: cifrado columna con pgcrypto. |
| Contract tests | Deuda | Diferido a post-MVP. Solo integration tests en MVP. |
| OCR stub | Deuda | Placeholder para MVP. Integrar OCR real antes de producción. |
| Seed incompleto (sin admin, sin favoritos, sin denuncias) | Deuda | Aceptado para MVP. Expandir si QA lo requiere. |

## Artefactos Generados

| Artefacto | Ruta |
|---|---|
| Investigación técnica | `specs/001-mandadero-mvp/research.md` |
| Modelo de datos | `specs/001-mandadero-mvp/data-model.md` |
| Contratos API | `specs/001-mandadero-mvp/contracts/api.md` |
| Guía de validación | `specs/001-mandadero-mvp/quickstart.md` |
| Plan de implementación | `specs/001-mandadero-mvp/plan.md` |
| Tareas | `specs/001-mandadero-mvp/tasks.md` |
| Modelo de datos | `specs/001-mandadero-mvp/data-model.md` |
