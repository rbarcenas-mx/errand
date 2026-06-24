# Plan de Implementación — Mandadero MVP

**Versión**: 1.0.0
**Fecha**: 2026-06-16
**Feature**: `specs/001-mandadero-mvp`

## Contexto Técnico

- **Frontend**: React Native (expo-managed recomendado para MVP)
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL + PostGIS
- **Geocodificación**: Nominatim (OpenStreetMap) para normalización de direcciones y búsqueda inversa. Precisión suficiente para zona metropolitana de Querétaro en MVP. Post-MVP: migrar a Google Places API para autocompletado y mayor precisión.
- **Notificaciones**: Twilio (SMS) limitado exclusivamente a registro, autenticación y recuperación de acceso. Mensajería del flujo de mandados (coordinación Solicitante-Mandadero) mediante mensajería interna en base de datos. Firebase Cloud Messaging (FCM) para notificaciones push en segundo plano. Las notificaciones in-app (polling) funcionan como fallback cuando FCM no está disponible.
- **Almacenamiento**: Cloudinary
- **Autenticación**: JWT (Access Token 1h + Refresh Token 30 días con rotación) + OTP vía SMS
- **Verificación identidad**: OCR + selfie (servicio cloud)
- **CI/CD**: GitHub Actions
- **Despliegue**: Railway.app o Fly.io

## Verificación de Constitución

| Principio | Implementado en el plan |
|---|---|
| Calidad de Código y Limpieza | ESLint + Prettier + TypeScript en setup de proyecto |
| Seguridad Primero | JWT con refresh tokens, validación de inputs, OTP en registro, manejo de datos sensibles |
| Pruebas Rigurosas | Suites por endpoint (contract tests + integration tests planificados) |
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

#### Sprint 2 — Mandados y Ofertas
1. CRUD de mandados con búsqueda geoespacial
   - En listado: exponer solo `distancia_km` (calculada desde ubicación del usuario) y colonia/sector como dirección general
   - En detalle (`GET /:id`): exponer coordenadas exactas solo para usuarios con `estado_verificacion = aprobado` o `pendiente_manual`
2. Envío y gestión de ofertas
3. Flujo de aceptación/rechazo de ofertas (revelar contacto de ambas partes al aceptar, implementado con transacción ACID en `mandado.service.ts`)
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
6. Worker de limpieza de datos sensibles (cleanup.service.ts): eliminar fotos de verificación 90 días después de aprobación o 30 días después de rechazo

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

#### Sprint 6 — Notificaciones Push (Post-MVP)
1. Integrar Firebase Cloud Messaging (FCM) en el backend
2. Crear endpoint para registro de tokens de dispositivo (`POST /api/v1/notificaciones/registrar-token`)
3. Implementar servicio de notificaciones push para nuevos eventos: oferta recibida, oferta aceptada, mensaje nuevo, mandado completado
4. Notificaciones in-app (polling) como fallback cuando FCM no está disponible

### Fase 3: Despliegue
1. Configurar ambiente de producción en Railway.app
2. Variables de entorno para producción
3. Migraciones automáticas en deploy
4. Monitoreo con Sentry
5. Pruebas de hum hum en producción

## Artefactos Generados

| Artefacto | Ruta |
|---|---|
| Investigación técnica | `specs/001-mandadero-mvp/research.md` |
| Modelo de datos | `specs/001-mandadero-mvp/data-model.md` |
| Contratos API | `specs/001-mandadero-mvp/contracts/api.md` |
| Guía de validación | `specs/001-mandadero-mvp/quickstart.md` |
| Plan de implementación | `specs/001-mandadero-mvp/plan.md` |
| Modelo de datos | `specs/001-mandadero-mvp/data-model.md` |
