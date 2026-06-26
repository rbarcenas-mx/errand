# Suite de Validacion QA
- **run_id**: 003
- **desc**: suite-20260625_2214
- **date**: 2026-06-25
- **total_plans**: 2

## README

Esta suite ejecuta los siguientes planes en orden secuencial.
Cada plan depende de los anteriores segun se indica.
Si un plan falla, el orquestador pregunta si continuar o abortar.

## Planes
| Orden | Plan | Dependencias | Estado |
|---|---|---|---|
| 1 | qa/003_20260625_2214_infra_plan.md | — | ⏳ |
| 2 | qa/003_20260625_2214_flow_plan.md | infra | ⏳ |

## Teardown
| Orden | Plan | Comando |
|---|---|---|
| 1 | — | docker-compose -f docker-compose.yml down --volumes |
