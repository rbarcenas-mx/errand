# CI Workflow — Prepare & Execute

## Problema

El flujo de trabajo spec-kit actual se enfoca en la generación de artefactos de especificación y código, pero no existe un mecanismo estandarizado para **orquestar operaciones de integración a GitHub** siguiendo mejores prácticas, como inicialización de repositorio git, creación de commits atómicos, o estructuración del historial del proyecto.

Estas operaciones de integración se hacen de forma manual o ad-hoc dentro de la conversación con el agente, sin trazabilidad, sin capacidad de reanudación tras fallo, y sin una estrategia de rollback clara.

## Alcance

Este flujo cubre exclusivamente operaciones de **integración continua (CI)**. El **despliegue continuo (CD)** queda fuera del alcance actual. Cuando se aborde la fase de deployment se evaluará si los skills existentes se modifican o se crean nuevos para CD.

## Solución: `ci.prepare` + `ci.execute`

Dos skills complementarios que separan la **planificación** de la **ejecución**, siguiendo el mismo patrón que spec-kit (spec → plan → tasks → implement), pero enfocados en operaciones de integración del proyecto.

---

## Skill 1: `ci.prepare`

### Propósito
Analizar el estado actual del proyecto, **interactuar con el usuario para definir la estrategia**, y generar un plan de integración con tareas atómicas, checkpoint IDs, comandos de rollback, y dependencias entre tareas.

### Comportamiento interactivo
- Cada hallazgo o decisión de estrategia se presenta al usuario
- El usuario confirma o ajusta antes de que se genere el plan final
- No se genera `ci/{id}_tasks.md` sin confirmación explícita

### Responsabilidades

1. **Diagnóstico del estado del repositorio**
   - Verificar si ya existe un repositorio git (`git status`)
   - Listar archivos no rastreados, modificados y en staging
   - Detectar archivos que deberían estar en `.gitignore` y no lo están
   - Identificar archivos que no deben commitearte (binarios, secretos, temporales)
   - **Validar que `.env` está en `.gitignore` antes de continuar** — si no, advertir al usuario y pedir confirmación o corrección

2. **Generación de estrategia de commits (con aprobación del usuario)**
   - Presentar al usuario la agrupación propuesta de archivos en commits atómicos
   - Mostrar los mensajes Conventional Commits sugeridos
   - El usuario puede modificar, dividir, fusionar o reordenar commits
   - Confirmar el orden de ejecución y dependencias

3. **Generación de archivo de tareas en `ci/`**
   - Archivo con tareas, checkpoint IDs, rollback commands
   - Cada tarea incluye: `id`, `desc`, `command`, `rollback`, `deps`, `checkpoint`
   - Los rollback destructivos (`rm -rf .git`, `git reset --hard`, etc.) se marcan con `dangerous: true`

### Archivos que genera

- `ci/{id_unico}_tasks.md` — plan de integración

---

## Skill 2: `ci.execute`

### Propósito
Leer el archivo de tareas, **informar al usuario cada paso**, ejecutar con confirmación por tarea, save points, barra de progreso, reanudación tras fallo, y rollback controlado.

### Comportamiento interactivo
- Antes de ejecutar cada tarea, muestra: `id`, `desc`, `command` y **pide confirmación** al usuario
- Después de cada tarea, muestra reporte en terminal con: resultado (✅/❌), duración, checkpoint guardado
- Barra de progreso en tiempo real: `[████░░░░░░] 40% (4/10 tareas)`
- Si una tarea tiene `dangerous: true`, el rollback requiere confirmación explícita antes de ejecutarse

### Responsabilidades

1. **Lectura del plan de tareas**

2. **Validación pre-ejecución**
   - Verificar que `.gitignore` cubre `.env` y `.env.*` antes de cualquier `git add`
   - Si hay secretos expuestos, abortar y notificar

3. **Ejecución con save points y barra de progreso**
   - Calcular porcentaje: `(completadas / total) * 100`
   - Mostrar barra en stderr: `\r[████░░░░░░] 40% (4/10)`
   - Por cada tarea:
     - Verificar si ya está completada → saltar (actualiza barra igual)
     - Verificar si ya falló antes → preguntar: reintentar, saltar o rollback
     - Mostrar tarea y pedir confirmación
     - Ejecutar el comando
     - Si éxito: escribir `✅` en execution log
     - Si fallo: escribir `❌`, si `dangerous: true` preguntar antes de rollback, si no ejecutar automático
   - El registro se escribe **inmediatamente** después de cada tarea

4. **Rollback por tarea**
   - Si una tarea tiene `rollback` definido y falla:
     - Si `dangerous: true` → preguntar "¿Ejecutar rollback: {comando}?" (sí/no)
     - Si no es dangerous → ejecutar automáticamente
   - El rollback se registra como `↩️ ROLLBACK` en el execution log

5. **Registro de ejecución**
   - Mismo archivo que las tareas (`ci/{id_unico}_tasks.md`)
   - Sección `## Execution Log` al final, fuera del frontmatter YAML
   - Formato:
     ```
     ## Execution Log
     EX-001 2026-06-18T22:30:00 ✅ chore: initial project setup
     EX-002 2026-06-18T22:31:15 ✅ feat: add Prisma schema
     EX-003 2026-06-18T22:32:20 ❌ feat: add auth module
     EX-003 2026-06-18T22:32:25 ↩️ ROLLBACK git reset --soft HEAD~1
     EX-003 2026-06-18T22:33:10 ✅ feat: add auth module
     ```

6. **Verificación de completitud**
   - Al finalizar, compara tareas planificadas vs ejecutadas
   - Reporta: completadas, fallidas, pendientes
   - Si hay tareas pendientes, ofrece continuar o abortar

### Archivos que consume/escribe

- `ci/{id_unico}_tasks.md` — contiene tanto las tareas como el execution log

---

## Identificador único de ejecución

Cada ejecución de `ci.prepare` genera un identificador secuencial basado en el contador actual dentro de `ci/`:

```
ci/001_tasks.md
ci/002_tasks.md
```

El número es auto-incremental: si existen archivos `001_*.md` y `002_*.md`, el siguiente es `003`.

El slug descriptivo se incluye como metadato dentro del archivo.

---

## Formato de `ci/{id_unico}_tasks.md`

El archivo usa **Markdown estructurado** (no YAML puro) para evitar problemas de parsing con comandos multi-línea. Cada tarea es una sección Markdown con campos clave-valor:

```markdown
# Plan de Integración

- **run_id**: 003
- **desc**: git-init
- **date**: 2026-06-18
- **total_tasks**: 2

## EX-001: chore: initial project setup

- **desc**: chore: initial project setup
- **command**:
  ```
  git init
  git add package.json tsconfig.json .eslintrc.json .prettierrc jest.config.js .gitignore AGENTS.md
  git commit -m "chore: initial project setup"
  ```
- **rollback**: `rm -rf .git`
- **dangerous**: true
- **deps**: []
- **checkpoint**: true

## EX-002: feat: add Prisma schema with PostgreSQL + PostGIS

- **desc**: feat: add Prisma schema with PostgreSQL + PostGIS
- **command**:
  ```
  git add prisma/schema.prisma prisma/migrations/
  git commit -m "feat: add Prisma schema with PostgreSQL + PostGIS"
  ```
- **rollback**: `git reset --soft HEAD~1`
- **dangerous**: false
- **deps**: [EX-001]
- **checkpoint**: true

---

## Execution Log

EX-001 2026-06-18T22:30:00 ✅ chore: initial project setup
EX-002 2026-06-18T22:31:15 ✅ feat: add Prisma schema
```

### Manejo de dependencias

Si `ci.execute` encuentra que una tarea tiene `deps` no completadas:
- Si la dependencia está en el mismo plan y no se ha ejecutado → **aborta** con mensaje claro
- Si la dependencia está completada en execution log → continúa normalmente
- Si la dependencia falló → pregunta al usuario si desea resolverla primero o saltar

### Rollback multi-paso

Si un rollback requiere múltiples comandos, se escriben como lista:

```
- **rollback**:
  ```
  git reset --soft HEAD~1
  rm temp-file.txt
  ```
```

El executor corre cada línea en secuencia. Si alguna falla, notifica pero continúa con las siguientes.

---

## Ciclo de vida típico

1. El usuario ejecuta `/ci.prepare`
2. `ci.prepare` diagnostica el proyecto, presenta hallazgos y espera confirmación
3. `ci.prepare` propone estrategia de commits, el usuario ajusta y confirma
4. `ci.prepare` genera `ci/{run_id}_tasks.md`
5. El usuario ejecuta `/ci.execute`
6. `ci.execute` lee el archivo, muestra barra de progreso, ejecuta tarea por tarea con confirmación
7. Después de cada tarea: reporte en terminal + checkpoint guardado
8. Si falla, pregunta reintentar/saltar/rollback (con confirmación si es dangerous)
9. Al completar, reporta resumen final con execution log actualizado
