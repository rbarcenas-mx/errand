# Plan de Validacion de Infraestructura

- **run_id**: 002
- **desc**: Validacion de infraestructura para proyecto Mandadero
- **date**: 2026-06-25
- **total_steps**: 9

## README

Este plan verifica la infraestructura basica: prerrequisitos (Node, npm, Docker), dependencias, archivos de configuracion, servicios Docker (PostgreSQL, Redis), migraciones y seed de base de datos.

## Checklist de Escenarios

| ID | Escenario | Pasos | Estado |
|----|-----------|-------|--------|
| INFRA-00 | Reset de entorno | QA-000 | Pendiente |
| INFRA-01 | Prerrequisitos | QA-001, QA-002, QA-003 | Pendiente |
| INFRA-02 | Servicios Docker | QA-004, QA-005 | Pendiente |
| INFRA-03 | Base de datos | QA-006 | Pendiente |

## Pasos de Ejecucion

--- STEP
type: shell
id: QA-000
desc: Resetear entorno - matar servidor y destruir contenedores Docker existentes
command: "fuser -k 3000/tcp 2>/dev/null; docker compose down --volumes 2>/dev/null; echo 'Entorno reseteado'"
checkpoint: true

--- STEP
type: shell
id: QA-001
desc: Verificar prerrequisitos (Node, npm, Docker)
command: "node --version && npm --version && docker --version && docker compose version"
checkpoint: true
max_retries: 1

--- STEP
type: shell
id: QA-002
desc: Instalar dependencias de proyecto
command: "npm install"
checkpoint: true
max_retries: 1

--- STEP
type: shell
id: QA-003
desc: Verificar archivos de configuracion (.env.qa y docker-compose.yml)
command: "test -f .env.qa && test -f docker-compose.yml && echo 'Archivos OK' || (echo 'Falta configuracion' && exit 1)"
checkpoint: true
max_retries: 1

--- STEP
type: shell
id: QA-004
desc: Levantar servicios Docker (Postgres y Redis)
command: "docker compose up -d"
checkpoint: true
max_retries: 1

--- STEP
type: shell
id: QA-004s
desc: Esperar que los contenedores estén completamente listos
command: "sleep 7"
checkpoint: true

--- STEP
type: shell
id: QA-005
desc: Health check de Postgres y Redis dentro de contenedores
command: "docker compose ps && docker compose exec -T db pg_isready -U postgres -d mandadero && docker compose exec -T redis redis-cli ping"
checkpoint: true
max_retries: 1

--- STEP
type: shell
id: QA-006
desc: Aplicar migraciones y seed de base de datos
command: "export $(grep -v '^#' .env.qa | xargs) && for i in 1 2 3 4 5; do docker compose exec -T db pg_isready -U postgres -d mandadero 2>/dev/null && break || sleep 2; done && for i in 1 2 3 4 5; do pg_isready -h localhost -U postgres -d mandadero 2>/dev/null && break || sleep 2; done && npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts"
checkpoint: true
max_retries: 3

--- STEP
type: shell
id: QA-007
desc: Levantar servidor Express y verificar que responde
command: "export $(grep -v '^#' .env.qa | xargs) && nohup npx tsx src/index.ts > /tmp/qa_server.log 2>&1 & sleep 4 && curl -s --max-time 5 http://localhost:3000/api/v1/nonexistent && echo '' && echo 'Servidor listo' || (echo 'Servidor no responde' && exit 1)"
checkpoint: true
timeout: 60

## Execution Log

(Sin registros)
📌 QA-000 2026-06-26T02:44:35Z ✅ (1.9s) Resetear entorno - matar servidor y destruir contenedores Docker existentes
📌 QA-001 2026-06-26T02:44:36Z ✅ (0.5s) Verificar prerrequisitos (Node, npm, Docker)
📌 QA-002 2026-06-26T02:44:39Z ✅ (3.4s) Instalar dependencias de proyecto
📌 QA-003 2026-06-26T02:44:39Z ✅ (0.0s) Verificar archivos de configuracion (.env.qa y docker-compose.yml)
📌 QA-004 2026-06-26T02:44:41Z ✅ (2.2s) Levantar servicios Docker (Postgres y Redis)
📌 QA-004s 2026-06-26T02:44:48Z ✅ (7.0s) Esperar que los contenedores estén completamente listos
📌 QA-005 2026-06-26T02:44:49Z ✅ (1.0s) Health check de Postgres y Redis dentro de contenedores
📌 QA-006 2026-06-26T02:45:03Z ✅ (13.9s) Aplicar migraciones y seed de base de datos
📌 QA-007 2026-06-26T02:45:07Z ✅ (4.1s) Levantar servidor Express y verificar que responde

### Resumen final

**Estado:** ✅ Completado — 9/9 pasos exitosos
**Fallidos:** 0  **Saltados:** 0

