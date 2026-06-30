<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, review the implementation plan at:
specs/001-mandadero-mvp/plan.md
<!-- SPECKIT END -->

# Mandadero

App que conecta personas que necesitan mandados con otras dispuestas a realizarlos en Querétaro y área metropolitana.

## Ponytail — Codigo minimalista

El proyecto usa [ponytail](https://github.com/DietrichGebert/ponytail) como plugin de OpenCode para que el agente escriba solo el codigo necesario (escalera YAGNI). Inyecta reglas de comportamiento en cada turno. Activo por defecto en modo `full`.

- Cambiar intensidad: `/ponytail lite`, `/ponytail full`, `/ponytail ultra`, `/ponytail off`
- Revisar diff por sobre-ingenieria: `/ponytail-review`
- Deuda tecnica pendiente: `/ponytail-debt`
- Config: `~/.config/opencode/opencode.json` → `"plugin": ["@dietrichgebert/ponytail"]`

## Headroom — Compresion de contexto

El proyecto usa [headroom](https://github.com/headroomlabs-ai/headroom) como proxy local para comprimir contexto antes de enviarlo al LLM. Corre como servicio systemd en `localhost:8787`. `resolve_model()` enruta automaticamente el trafico remoto (ahorro_balanceado, ahorro_bajo) por el proxy. El trafico local (ahorro_alto / Ollama) no se enruta.

- Ver estado: `source ~/.config/opencode/headroom.sh status`
- Ver ahorro: `source ~/.config/opencode/headroom.sh savings`
- Doc completa: `~/.rbarcenas/headroom-setup.md`

### Session Log

Cuando el usuario pida "actualiza el log de sesion" o "registra el ahorro de tokens", ejecutar:

```bash
cd /home/rbarcenas/development/errand && bash .opencode/session-log.sh "resumen de lo hecho en la sesion"
```

El parametro AHORRO_MODO se toma del entorno. Si no esta definido, usar `grep AHORRO_MODO ~/.bashrc` para detectar el default.

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
