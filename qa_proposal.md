# Propuesta: QA Local (qa.prepare / qa.execute)

## Necesidad

Actualmente el proyecto cuenta con un sistema de integración continua local (`ci.prepare` / `ci.execute`) que gestiona la creación de repositorios, commits atómicos y push a GitHub. Sin embargo, **no existe un proceso equivalente para la ejecución de pruebas**, lo que genera varios problemas:

1. **Fricción manual**: cada vez que se quiere ejecutar pruebas hay que recordar qué comandos usar, qué variables de entorno configurar, y qué servicios externos levantar (bases de datos, colas, etc.).

2. **Infraestructura no declarativa**: proyectos que requieren PostgreSQL, Redis u otros servicios no tienen una forma estandarizada de levantarlos para testing. El developer debe saber qué necesita y cómo arrancarlo.

3. **Sin registro histórico**: no hay trazabilidad de cuándo se ejecutaron pruebas, qué suite falló, ni qué commit se estaba probando. Si algo falla, no queda registro para comparar contra ejecuciones anteriores.

4. **Configuración dispersa**: las variables de entorno requeridas están en `.env.example`, los comandos en `package.json`, la infraestructura tal vez en un `docker-compose.yml` — pero nada une estas piezas en un flujo coherente.

5. **Inconsistencia entre proyectos**: cada proyecto tiene su propia forma de probar. Un developer que salta entre repositorios debe reaprender cómo ejecutar pruebas en cada uno.

## Propuesta de solución

Crear dos skills complementarios — `qa.prepare` y `qa.execute` — siguiendo el mismo patrón ya validado con `ci.prepare` / `ci.execute`:

### `qa.prepare` — Diagnóstico y plan de validación QA

Analiza el estado actual del proyecto y genera un plan de ejecución de pruebas en `qa/{id}_{timestamp}_qa_plan.md`.

**Detección automática de:**
- **Lenguaje/stack**: Node.js/TypeScript, Python, Go, Rust, etc.
- **Comando de test**: desde `package.json`, `Makefile`, `pyproject.toml`, etc.
- **Base de datos requerida**: desde `prisma/schema.prisma`, `docker-compose.yml`, `alembic.ini`, etc.
- **Variables de entorno necesarias**: desde `.env.example`, `.env.template`, `config/`
- **Infraestructura Docker**: detecta `docker-compose.yml` existente o determina si necesita generarse uno
- **Dependencias**: verifica `node_modules/`, `venv/`, etc. y determina si falta `npm install`

**El plan generado incluye:**
- Validación de prerrequisitos (Node, Docker, puertos libres)
- Instalación de dependencias si faltan
- Detección de servicios externos (Twilio, Cloudinary) y activación de modo mock
- Creación de `.env.qa` (nunca sobrescribe `.env` real)
- Levantamiento de infraestructura Docker con imagen correcta (`postgis/postgis`)
- Espera de health checks
- Ejecución de migraciones + seeds (`prisma db seed`)
- Tests unitarios (sin infraestructura) — `npm run test:unit`
- Tests de integración (con BD + seeds) — `npm run test:integration`
- Reporte de resultados
- Limpieza opcional de infraestructura (`docker compose down`)

### `qa.execute` — Ejecución del plan de validación QA

Lee `qa/{id}_qa_plan.md` y ejecuta cada paso con:
- **Confirmación por paso** (igual que `ci.execute`)
- **Health checks reales** (espera activa hasta que PostgreSQL responda)
- **Timeout por servicio** (no se cuelga si Docker falla)
- **Registro de resultados** en el mismo archivo de plan
- **Manejo de fallos** con opción de reintentar, saltar o abortar
- **Resumen final** con total de suites/tests pasados y fallidos

### Ejemplo de uso para este proyecto

```
/qa.prepare
→ Detecta: Node.js + TypeScript, Jest, Prisma, PostgreSQL
→ Verifica: node_modules ✓, .env ✗ (falta DATABASE_URL)
→ Pregunta: ¿generar .env desde .env.example? [Sí/No]
→ Plan generado: qa/001_20260619_qa_plan.md

/qa.execute
→ Paso 1: Validar prerequisitos (node, docker, npm)
→ Paso 2: Crear .env.qa con DATABASE_URL=postgresql://test:test@localhost:5432/mandadero_test
→ Paso 3: docker compose up -d (imagen postgis/postgis:16-3.4)
→ Paso 4: Esperar PostgreSQL healthy...
→ Paso 5: npx prisma migrate deploy
→ Paso 6: npx prisma db seed
→ Paso 7: npm run test:unit (tests sin infraestructura)
→ Paso 8: npm run test:integration (tests con BD + seeds)
→ Paso 9: Reporte (suites pasadas/fallidas)
→ Paso 10: ¿Apagar infraestructura? [Sí/No] (docker compose down)
```

Estructura de directorios resultante:
```
ci/     → planes de integración (local, no versionado)
qa/     → planes de validación QA (local, no versionado)
tests/  → código de pruebas (versionado)
```

## Integración con el ecosistema existente

```
ci.prepare ──→ ci.execute      (versionado y push a GitHub)
qa.prepare ──→ qa.execute      (validación QA local pre-commit)
```

Ambos pares comparten:
- Formato de archivo de plan (`{id}_{timestamp}_*.md`)
- Flujo de confirmación interactiva con `question`
- Manejo de dependencias entre pasos
- Checkpoints y rollback
- Execution log con timestamps ISO 8601
- Barra de progreso

### Ciclo completo de desarrollo

```
/speckit.implement ──→ escribes código
        ↓
/qa.prepare ──→ diagnosticar requisitos de validación
        ↓
/qa.execute ──→ validar que todo funciona (tests + infraestructura real)
        ↓
/ci.prepare ──→ planificar los commits
        ↓
/ci.execute ──→ versionar y empujar a GitHub
        ↓
.github/workflows/ci.yml ──→ CI automatizado en cada push/PR
```

## Diferencias clave con ci.execute

| Aspecto | ci.execute | qa.execute |
|---|---|---|
| Operaciones | Git (init, add, commit) | Docker, npm, procesos |
| Infraestructura | Ninguna | Levanta/Baja servicios |
| Health checks | No aplica | Espera activa con reintentos |
| Rollback | `git reset` / `rm -rf .git` | `docker compose down`, eliminar .env temporal |
| Idempotencia | Commits atómicos | Tests repetibles |

## Estrategia de servicios externos (mocking)

Servicios como Twilio (SMS/OTP) y Cloudinary (almacenamiento) no deben invocarse con credenciales reales en QA local. `qa.prepare` detecta variables de entorno para servicios externos y activa modo mock automáticamente:

- **TWILIO_ACCOUNT_SID** presente → `MOCK_SMS=true` en `.env.qa`
- **CLOUDINARY_CLOUD_NAME** presente → `MOCK_STORAGE=true` en `.env.qa`
- **VERIFICACION_MANUAL** → se fuerza a `true` para evitar OTP real

Si no se detectan credenciales, los mocks se activan por defecto. Si el usuario tiene credenciales y quiere probar con servicios reales, puede desactivar el mock manualmente en el plan.

### Separación de tests unitarios e integración

| Tipo | Comando | Requiere Docker | Requiere seeds |
|---|---|---|---|
| Unitarios | `npm run test:unit` | ❌ No | ❌ No |
| Integración | `npm run test:integration` | ✅ Sí | ✅ Sí |

El plan de QA ejecuta ambos por separado para dar feedback rápido: si los unitarios fallan, no se pierde tiempo levantando infraestructura.
