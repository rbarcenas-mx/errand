# Plan de Implementación — Mandadero MVP

**Versión**: 1.0.0
**Fecha**: 2026-06-16
**Feature**: `specs/001-mandadero-mvp`

## Contexto Técnico

- **Frontend**: React Native (expo-managed recomendado para MVP)
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL + PostGIS
- **Notificaciones**: Twilio (SMS) limitado exclusivamente a registro, autenticación y recuperación de acceso. Mensajería del flujo de mandados (coordinación Solicitante-Mandadero) mediante mensajería interna en base de datos.
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

### Fase 2: Implementación (PENDIENTE)

#### Sprint 1 — Infraestructura y Autenticación
1. Inicializar proyecto Node.js + TypeScript
2. Configurar ESLint, Prettier, Jest
3. Configurar conexión PostgreSQL + migraciones
4. Implementar registro y OTP
5. Implementar verificación de identidad (subida de fotos + flujo de reintento tras rechazo)
6. Implementar flujo de Refresh Token (login, refresh, logout con revocación)
7. CI/CD básico (lint + test en PR)

#### Sprint 2 — Mandados y Ofertas
1. CRUD de mandados con búsqueda geoespacial
2. Envío y gestión de ofertas
3. Flujo de aceptación/rechazo de ofertas
4. Cambio de estados de mandado (incluyendo cancelación por Solicitante y expiración automática)
5. Lógica de expiración de ofertas no aceptadas
6. Notificaciones de ofertas in-app (no SMS) — Twilio solo para auth

#### Sprint 3 — Calificaciones y Cierre
1. Sistema de calificaciones
2. Cálculo de puntuación promedio
3. Validación de caso de borde (INE rechazado + flujo de reintento)
4. Pruebas de integración completas
5. Documentación técnica básica

#### Sprint 4 — Mensajería Interna (US4)
1. Implementar entidad Mensaje y migración en Prisma
2. Implementar GET /api/mandados/:id/mensajes controller
3. Implementar POST /api/mandados/:id/mensajes controller
4. Integrar mensajería con flujo de aceptación de oferta (apertura de canal)
5. Implementar restricción de solo lectura al completar/cancelar mandado
6. Pruebas de integración para mensajería

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
