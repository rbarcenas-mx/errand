# Task List — Mandadero MVP

## Phase 1: Setup
- [x] T001 Initialize Node.js project with TypeScript in `package.json`
- [x] T002 Configure ESLint and Prettier in `.eslintrc.json` and `.prettierrc`
- [x] T003 Set up PostgreSQL with PostGIS extension in `prisma/schema.prisma` (or equivalent migration script)
- [x] T004 Integrate Cloudinary SDK for image storage in `src/services/storage.service.ts`
- [x] T005 Configure Twilio SDK for SMS (auth only: registration, OTP, access recovery) in `src/services/notification.service.ts`

## Phase 2: Foundational
- [x] T005b [P] Implement rate limiting middleware on auth routes (register + verify-otp) to prevent SMS bombing in `src/app.ts`
- [x] T006 [P] Implement Authentication Middleware with JWT in `src/middleware/auth.middleware.ts`
- [x] T006b [P] Implement Authorization Middleware by verification status in `src/middleware/auth.middleware.ts`
- [x] T007 [P] Setup Database Migrations for `Usuario`, `Mandado`, and `Oferta` entities
- [x] T008 [P] Implement User Repository with email/phone lookup in `src/repositories/user.repository.ts`
- [x] T009 Implement Auth Controller for `/api/auth/register` in `src/controllers/auth.controller.ts`
- [x] T010 Implement Auth Controller for `/api/auth/verify-otp` in `src/controllers/auth.controller.ts`
- [x] T011 Implement Identity Verification Endpoint (Multipart + Cloudinary upload) in `src/controllers/auth.controller.ts`

## Phase 3: [US1] Solicitar Mandado
- [x] T012 [US1] Implement Mandado Repository with PostGIS spatial queries in `src/repositories/mandado.repository.ts`
- [x] T013 [US1] Create Mandado Model and Entity in `src/models/mandado.model.ts`
- [x] T014 [US1] Implement POST `/api/mandados` controller in `src/controllers/mandado.controller.ts`
- [x] T015 [US1] Implement GET `/api/mandados` with spatial filtering in `src/controllers/mandado.controller.ts`
- [x] T016 [US1] Create Integration Tests for Mandado lifecycle in `tests/integration/mandado.test.ts`
- [x] T016c [US1] Integrate geocoding service (OpenStreetMap/Nominatim) to normalize addresses in `src/services/geocoding.service.ts`

## Phase 4b: Auth & Verification Tests
- [x] T016a Create Integration Tests for Auth (register + verify-otp) in `tests/integration/auth.test.ts`
- [x] T016b Create Integration Tests for Identity Verification flow in `tests/integration/identity.test.ts`

## Phase 4: [US2] Ofertar y Contactar
- [x] T017 [US2] Implement Oferta Model and Entity in `src/models/oferta.model.ts`
- [x] T018 [US2] Implement POST `/api/mandados/:id/ofertas` in `src/controllers/oferta.controller.ts`
- [x] T019 [US2] Implement PATCH `/api/ofertas/:id` for acceptance/rejection in `src/controllers/oferta.controller.ts`
- [x] T020 [US2] Implement logic to reveal contact info upon acceptance in `src/services/mandado.service.ts`
- [x] T020b [US2] Implement Notification Service for offer events (in-app only, no SMS) in `src/services/notification.service.ts`
- [x] T021 [US2] Integration Test for the complete Offer-to-Acceptance flow in `tests/integration/offer_flow.test.ts`

## Phase 5: [US3] Finalización y Calificación
- [x] T022 [US3] Implement Calificacion Model and Entity in `src/models/calificacion.model.ts`
- [x] T023 [US3] Implement POST `/api/calificaciones` in `src/controllers/calificacion.controller.ts`
- [x] T024 [US3] Implement logic to update average user rating in `src/services/user.service.ts`
- [x] T025 [US3] Implement PATCH `/api/mandados/:id/estado` for completion in `src/controllers/mandado.controller.ts`
- [x] T025b [US3] Create Integration Tests for Calificacion flow in `tests/integration/calificacion.test.ts`
- [x] T025c [US3] Implement restriction logic for rejected-verification users in `src/services/verification.service.ts`

## Phase 6: Polish & Cross-Cutting
- [x] T026 Create global error handling middleware in `src/middleware/error.middleware.ts`
- [x] T027 Implement centralized logging strategy in `src/utils/logger.ts`
- [x] T028 Setup GitHub Actions for linting and testing in `.github/workflows/ci.yml`
- [x] T029 Generate API documentation (Swagger/OpenAPI) in `docs/api.yaml`
- [x] T030 Write technical README with setup instructions in `README.md`

## Phase 6b: Verificacion Manual (Admin)
- [x] T043a Agregar estado `pendiente_manual` al enum `EstadoVerificacion` en `prisma/schema.prisma`
- [x] T043b Capturar error de OCR en `src/services/verification.service.ts` y degradar a `pendiente_manual`
- [x] T043c Implementar funcion `revisarVerificacion` en `src/services/verification.service.ts` para aprobar/rechazar manualmente
- [x] T043d Crear `src/routes/admin.routes.ts` con GET `/api/v1/admin/verificaciones-pendientes` y POST `/api/v1/admin/verificaciones/:id/revisar`
- [x] T043e Montar rutas de admin en `src/app.ts`
- [x] T043f Crear middleware `requireAdmin` en `src/middleware/auth.middleware.ts`
- [x] T043g Pruebas de integracion para flujo de verificacion manual
- [x] T043h Definir SLA de 12 horas habiles para revision manual con renotificacion automatica al equipo admin
- [x] T043i Implementar notificacion al usuario cuando admin aprueba o rechaza documentos en `src/services/verification.service.ts` (revisarVerificacion llama a notifyVerificacionCompleta)

## Phase 6c: Limpieza de Datos Sensibles
- [x] T033a Implementar `src/services/cleanup.service.ts` con scheduler diario que elimina fotos de verificación vencidas
- [x] T033b Iniciar `cleanupService` en `src/index.ts`
- [x] T033c Agregar campo `verificado_en` al modelo Usuario en `prisma/schema.prisma`
- [x] T033d Actualizar `verification.service.ts` para llenar `verificado_en` al aprobar

## Phase 6d: Denuncias
- [x] T048 Agregar modelo Denuncia a `prisma/schema.prisma`
- [x] T049 Crear `src/controllers/denuncia.controller.ts` con POST para crear denuncias
- [x] T050 Crear `src/routes/denuncia.routes.ts` y montar en `app.ts`
- [x] T051 Agregar rutas admin para listar y resolver denuncias en `src/routes/admin.routes.ts`
- [x] T052 Implementar logica de sancion en `POST /admin/denuncias/:id/resolver` que cambie `estado_verificacion` del denunciado a `rechazado` al resolver con accion `rechazar_usuario`

## Phase 7: Production & Deployment
- [ ] T031 Configure Railway.app production environment and env vars in `railway.json`
- [x] T032 Set up Sentry error monitoring in `src/config/sentry.ts`
- [x] T033 Implement data retention policy (auto-delete verification images after 90d) in `src/jobs/cleanup.job.ts`
- [x] T034 Implement account deletion endpoint (DELETE /api/auth/cuenta) in `src/controllers/auth.controller.ts`
- [ ] T035 Set up automated DB migrations on deploy in `package.json` scripts
- [ ] T036 Smoke tests for production deployment in `tests/smoke/production.test.ts`

## Phase 8: [US4] Mensajería Interna
- [x] T037 [US4] Create Mensaje model and migration in `prisma/schema.prisma`
- [x] T038 [US4] Implement GET `/api/mandados/:id/mensajes` controller in `src/controllers/mensaje.controller.ts`
- [x] T039 [US4] Implement POST `/api/mandados/:id/mensajes` controller in `src/controllers/mensaje.controller.ts`
- [x] T040 [P] [US4] Implement Mensaje routes in `src/routes/mensaje.routes.ts`
- [x] T041 [US4] Integrate channel opening upon offer acceptance in `src/services/mandado.service.ts`
- [x] T042 [US4] Implement read-only restriction for completed/cancelled mandados in `src/middleware/chat.middleware.ts`
- [x] T043 [US4] Create Integration Tests for Messaging flow in `tests/integration/mensaje.test.ts`

## Phase 9: Post-MVP — Notificaciones Push
- [ ] T044 Integrate Firebase Cloud Messaging (FCM) SDK in backend
- [ ] T045 Create endpoint `POST /api/v1/notificaciones/registrar-token` for device token registration
- [ ] T046 Implement push notification service for: nueva oferta, oferta aceptada, mensaje nuevo, mandado completado
- [ ] T047 Implement in-app polling as fallback when FCM is unavailable

## Dependencies
- Phase 2 must be completed before Phase 3, 4, or 5.
- Phase 3 (Mandados) is a prerequisite for Phase 4 (Ofertas).
- Phase 4 (Ofertas/Acceptance) is a prerequisite for Phase 5 (Calificaciones).
- Phase 7 (Production) should be completed before public launch but can be developed in parallel with Phases 5-6.
- Phase 8 (Mensajería) requires Phase 4 (Ofertas/Acceptance) for channel opening logic.

## Implementation Strategy
**MVP Scope**: All phases completed.

## Trazabilidad de Auditoria

Los siguientes puntos fueron identificados como falsos positivos por el modelo de auditoria y se documentan para evitar que reaparezcan:

- **Fraude al completar mandado**: Mitigado via FR-005 (contacto se revela al aceptar oferta, no al completar) + endpoint de denuncias implementado.
- **Race condition en ofertas**: Transaccion ACID implementada en `mandado.service.ts:acceptOferta`.
- **SMS bombing sin proteccion**: Rate limiting por IP/telefono implementado en `app.ts` (authLimiter) + cuota global documentada en plan.
