<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, review the implementation plan at:
specs/001-mandadero-mvp/plan.md
<!-- SPECKIT END -->

# Mandadero

App que conecta personas que necesitan mandados con otras dispuestas a realizarlos en Querétaro y área metropolitana.

## Proyecto

- Package manager: npm
- El proyecto usa spec-kit (Spec-Driven Development) con `specify` CLI
- Los comandos slash `/speckit.*` están configurados en `.opencode/commands/`

## Comandos útiles

- `specify init . --integration opencode --force` — reinicializar spec-kit
- `specify integration list` — ver integraciones disponibles
- `npm init` / `npm install <pkg>` — gestión de dependencias

## Flujo de trabajo spec-kit

1. `/speckit.constitution` — establecer principios del proyecto
2. `/speckit.specify` — crear especificación funcional
3. `/speckit.clarify` — clarificar ambigüedades (opcional)
4. `/speckit.plan` — plan técnico con stack definido
5. `/speckit.checklist` — checklist de calidad (opcional)
6. `/speckit.tasks` — desglose en tareas accionables
7. `/speckit.analyze` — análisis de consistencia (opcional)
8. `/speckit.implement` — ejecutar implementación
