# Suite de Validacion QA
- **run_id**: 001
- **desc**: suite-20260625_1617
- **date**: 2026-06-25
- **total_plans**: 3

## README

Esta suite ejecuta los siguientes planes en orden secuencial.
Cada plan depende de los anteriores segun se indica.
Si un plan falla, el orquestador pregunta si continuar o abortar.

## Planes
| Orden | Plan | Dependencias | Estado |
|---|---|---|---|
| 1 | qa/001_20260625_1617_infra_plan.md | — | ⏳ |
| 2 | qa/001_20260625_1617_unit_plan.md | — | ⏳ |
| 3 | qa/001_20260625_1617_flow_plan.md | infra | ⏳ |

## Teardown
| Orden | Plan | Comando |
|---|---|---|
| 1 | — | docker-compose -f docker-compose.yml down --volumes |
