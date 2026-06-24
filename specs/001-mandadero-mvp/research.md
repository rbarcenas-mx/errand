# Investigación Técnica — Mandadero MVP

## Stack Tecnológico

### Frontend Móvil
- **Decisión**: React Native
- **Razón**: Comunidad madura, reutilización de lógica entre iOS/Android, ecosistema de librerías maduro para mapas y cámara.
- **Alternativas consideradas**: Flutter (menor ecosistema de mapas/location en LATAM), Kotlin nativo (mayor costo de desarrollo dual).

### Backend
- **Decisión**: Node.js + Express + TypeScript
- **Razón**: Tipo compartido con frontend, amplia oferta de hosting serverless, velocidad de desarrollo. TypeScript proporciona tipado estático, mejorando la mantenibilidad y detectando errores en tiempo de compilación.
- **Alternativas consideradas**: Django (mayor overhead inicial), FastAPI (Python, menos integraciones de SMS/mapas).

### Base de Datos
- **Decisión**: PostgreSQL con PostGIS
- **Razón**: Consultas geoespaciales nativas, integridad relacional (transacciones monetarias futuras), madurez comprobada.
- **Alternativas consideradas**: MongoDB (consistencia eventual riesgosa para transacciones), Firebase (vendor lock-in).

### Notificaciones
- **Decisión**: Twilio (SMS + WhatsApp API)
- **Razón**: Cobertura comprobada en México, API unificada para ambos canales.
- **Costos estimados MVP**: SMS (~$0.0079 USD/mensaje a México), WhatsApp (~$0.05 USD/mensaje). Con ~100 transacciones/mes y ~5 notificaciones por transacción, estimado ~$4-6 USD/mes para SMS.
- **Alternativas consideradas**: Firebase Cloud Messaging (solo push, no SMS/WhatsApp), AWS SNS (mayor complejidad).

### Autenticación
- **Decisión**: SMS OTP + verificación INE (OCR automatizado + selfie)
- **Razón**: Balance entre seguridad y fricción; el teléfono validado es el identificador único; la verificación INE aporta confianza sin requerir revisión manual inmediata.
- **Alternativas consideradas**: Email/password (baja seguridad), OAuth2 (requiere socios externos), verificación manual (no escala).

### Monitoreo (MVP)
- **Decisión**: Logs estructurados (pino/logger) + Sentry para errores
- **Razón**: Gratuito en tier inicial, alertas configurables, integración directa con Express.
- **Alternativas consideradas**: Datadog (costo elevado para MVP), New Relic (overhead de agente).

### CI/CD
- **Decisión**: GitHub Actions
- **Razón**: Sin costo adicional con repo en GitHub, integración nativa con PRs y branches.
- **Alternativas consideradas**: CircleCI (créditos limitados), GitLab CI (requiere migración de repo).

## Decisiones de Arquitectura

### API REST vs GraphQL
- **Decisión**: REST
- **Razón**: Simplicidad para MVP, caché HTTP nativa, depuración directa con curl/Postman.
- **Alternativas consideradas**: GraphQL (overfetching controlado, mayor complejidad inicial).

### Almacenamiento de Imágenes
- **Decisión**: Cloudinary (tier gratuito para MVP)
- **Razón**: Transformaciones de imagen integradas, CDN incluido, URLs firmadas para seguridad.
- **Alternativas consideradas**: S3 (más configuración manual), almacenamiento local (no escala).

### Despliegue
- **Decisión**: Railway.app o Fly.io
- **Razón**: Despliegue sencillo desde GitHub, PostgreSQL administrado incluido, tier gratuito para MVP.
- **Alternativas consideradas**: Heroku (plan gratuito eliminado), AWS (curva de aprendizaje alta).

## Riesgos Técnicos Identificados

1. **Verificación INE falsificada**: Mitigar con selfie + coincidencia facial básica (librerías como face-api.js o servicio cloud).
2. **Baja adopción dual-side**: Priorizar registro de mandaderos en zona piloto antes del lanzamiento público.
3. **Fraude de contacto fuera de plataforma**: Sin monetización en MVP no es problema inmediato; monitorear para futura mitigación.
