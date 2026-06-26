# Especificación de la Funcionalidad: Implementación del MVP de Mandadero

**Rama de la Funcionalidad**: `001-mandadero-mvp`

**Creado**: 2026-06-16

**Estado**: Borrador

**Entrada**: Descripción del usuario: "lee idea.md"

## Escenarios de Usuario y Pruebas *(obligatorio)*

<!--
  IMPORTANTE: Las historias de usuario deben PRIORIZARSE como recorridos de usuario ordenados por importancia.
  Cada historia/recorrido debe ser INDEPENDIENTAMENTE PROBABLE - lo que significa que si implementas solo UNA,
  deberías seguir teniendo un MVP (Producto Mínimo Viable) que entregue valor.

  Asigna prioridades (P1, P2, P3, etc.) a cada historia, donde P1 es la más crítica.
  Piensa en cada historia como una parte autónoma de la funcionalidad que puede ser:
  - Desarrollada de forma independiente
  - Probada de forma independiente
  - Desplegada de forma independiente
  - Demostrada a los usuarios de forma independiente
-->

### Historia de Usuario 1 - Solicitar Mandado (Prioridad: P1)

El Solicitante publica una nueva tarea (mandado) con ubicaciones de recogida/entrega y detalles, y luego espera ofertas.

**Por qué esta prioridad**: Es la propuesta de valor principal de la aplicación; sin tareas, no hay usuarios a los que servir.

**Prueba Independiente**: Puede probarse completamente creando una tarea en el sistema y verificando su aparición en la lista pública para los Mandaderos.

**Escenarios de Aceptación**:

1. **Dado** que existe un Solicitante autenticado, **Cuando** envía un nuevo mandado de "compra" con ubicaciones válidas, **Entonces** el mandado se crea y es visible para otros.
2. **Dado** que un mandado tiene una fecha límite expirada, **Cuando** pasa el tiempo, **Entonces** deja de estar disponible para nuevas ofertas.
3. **Dado** que un Solicitante intenta crear un mandado sin especificar ubicación de recogida, **Cuando** envía el formulario, **Entonces** el sistema rechaza la creación y muestra un error de validación.
4. **Dado** que un Solicitante cancela un mandado con ofertas activas, **Cuando** confirma la cancelación, **Entonces** todas las ofertas se marcan como rechazadas y los Mandaderos reciben notificación.

---

### Historia de Usuario 2 - Ofertar y Contactar (Prioridad: P1)

El Mandadero navega por las tareas disponibles, envía una oferta de precio y, tras la aceptación del Solicitante, se abre un canal de mensajería interna y se revela la información de contacto de ambas partes para coordinar la entrega.

**Por qué esta prioridad**: Completa el ciclo de transacción y valida el modelo de negocio. La monetización futura (tarifa de contacto) se implementará en una fase posterior, atada al valor del mandado y cobrada al momento de aceptar una oferta.

**Prueba Independiente**: Puede probarse haciendo que un Mandadero envíe una oferta en una tarea existente y verificando que el Solicitante pueda aceptarla, acceder al canal de mensajería y ver el teléfono del Mandadero.

**Escenarios de Aceptación**:

1. **Dado** que existe un mandado activo, **Cuando** un Mandadero autenticado envía una oferta con un precio, **Entonces** el Solicitante recibe una notificación de la nueva oferta.
2. **Dado** que un Mandadero ha enviado una oferta, **Cuando** el Solicitante la acepta, **Entonces** se abre un canal de mensajería interna entre ambos y se revela la información de contacto (nombre y teléfono) de ambas partes.
3. **Dado** que un Mandadero no verificado intenta enviar una oferta, **Cuando** presiona enviar, **Entonces** el sistema rechaza la acción y muestra un mensaje indicando que debe completar la verificación de identidad.
4. **Dado** que existe un mandado activo, **Cuando** el Solicitante rechaza una oferta, **Entonces** el Mandadero recibe una notificación de rechazo y la oferta se marca como "rechazada".
5. **Dado** que una oferta no ha sido aceptada antes de la fecha límite del mandado, **Cuando** la fecha límite expira, **Entonces** la oferta se marca como "expirada" automáticamente.

---

### Historia de Usuario 3 - Finalización y Calificación (Prioridad: P2)

Ambas partes confirman la finalización de la tarea y se califican mutuamente para generar confianza en el ecosistema.

**Por qué esta prioridad**: La reputación es crítica para la seguridad de la plataforma y el crecimiento a largo paso, aunque es esencial solo después del uso inicial.

**Prueba Independiente**: Puede probarse completando un flujo desde las Historias 1 y 2 y verificando que el solicitante pueda marcar como completado y ambos usuarios dejar una calificación.

**Escenarios de Aceptación**:

1. **Dado** que un mandado está en estado "en_progreso", **Cuando** el Solicitante confirma la recepción, **Entonces** el estado cambia a "completado".
2. **Dado** un mandado completado, **Cuando** ambas partes envían calificaciones, **Entonces** la calificación promedio de ambos usuarios se actualiza.
3. **Dado** un mandado completado, **Cuando** una de las partes intenta calificar antes de que la otra haya completado el mandado, **Entonces** el sistema rechaza la calificación y muestra un mensaje de que el mandado debe estar completado.
4. **Dado** un mandado completado, **Cuando** un usuario intenta calificar dos veces al mismo usuario para el mismo mandado, **Entonces** el sistema rechaza la segunda calificación con un error de "calificación duplicada".

---

### Historia de Usuario 4 - Mensajería Interna (Prioridad: P2)

Una vez que el Solicitante acepta una oferta, se abre un canal de mensajería interna entre el Solicitante y el Mandadero para coordinar la entrega. El uso de SMS (Twilio) queda limitado exclusivamente a registro, autenticación y recuperación de acceso.

**Por qué esta prioridad**: La mensajería interna evita exponer números telefónicos y mejora la experiencia de coordinación, pero el MVP puede funcionar sin ella si se revela el contacto directamente (FR-005).

**Prueba Independiente**: Puede probarse creando un canal de chat entre dos usuarios y verificando que puedan enviar y recibir mensajes de texto.

**Escenarios de Aceptación**:

1. **Dado** que una oferta ha sido aceptada, **Cuando** el Solicitante o el Mandadero acceden al chat, **Entonces** ven un canal de mensajería compartido entre ambos.
2. **Dado** un canal de mensajería activo, **Cuando** un usuario envía un mensaje, **Entonces** el destinatario lo recibe y ve la hora de envío.
3. **Dado** un canal de mensajería, **Cuando** un usuario intenta enviar un mensaje vacío o con solo espacios, **Entonces** el sistema rechaza el envío.
4. **Dado** que el mandado se ha completado, **Cuando** los usuarios acceden al canal, **Entonces** el canal sigue visible pero no se permiten nuevos mensajes (solo lectura).

---

### Casos de Borde y Flujos de Error

- **Ofertas fuera de rango**: Un Mandadero puede enviar cualquier oferta, independientemente de si es alta o baja. El Solicitante tiene la opción de aceptarla o rechazarla sin restricciones del sistema.
- **Verificación de identidad fallida**: Si el INE o selfie son borrosos, inválidos o no coinciden, el sistema DEBE rechazar la validación. El usuario recibe una notificación con el motivo del rechazo y puede reintentar subiendo nuevos documentos. Las restricciones de acceso se aplican según la Matriz de Acceso por Estado de Verificación (ver sección siguiente).
- **Verificación de identidad con OCR no disponible**: Si el servicio de OCR externo falla (timeout, error, no disponible), el sistema DEBE asignar el estado `pendiente_manual` en lugar de bloquear al usuario. Un administrador humano revisa los documentos desde un panel y decide si aprueba o rechaza la verificación. El usuario recibe notificación del resultado. El SLA objetivo para la revisión manual es de 12 horas hábiles. Si se supera este plazo sin acción del administrador, el sistema DEBE renotificar al equipo administrativo.
- **Cancelación de mandado**: El Solicitante puede cancelar un mandado mientras esté en estado "pendiente" o "en_progreso". Al cancelar, todas las ofertas asociadas se marcan como "rechazadas" y se notifica a los Mandaderos involucrados.
- **Expiración de oferta**: Una oferta no aceptada expira automáticamente al vencer la fecha límite del mandado. El Mandadero recibe una notificación de que su oferta expiró.
- **Rechazo de oferta por el Solicitante**: Cuando el Solicitante rechaza una oferta, el Mandadero recibe una notificación y la oferta se marca como "rechazada". El Mandadero puede enviar una nueva oferta si el mandado sigue activo.
- **Cuenta duplicada**: Si un usuario intenta registrarse con un número de teléfono ya existente, el sistema DEBE rechazar el registro y notificar que la cuenta ya existe.
- **Formato inválido**: Si el usuario ingresa ubicaciones, precios o descripciones con formato inválido, el sistema DEBE devolver un error de validación descriptivo sin crear el recurso.
- **Confirmación de ubicación**: Al crear un mandado, el sistema DEBE devolver la dirección normalizada por el motor de geocodificación y solicitar confirmación del usuario antes de publicar el mandado.
- **Reporte de incidente post-transacción**: Si un usuario experimenta acoso, fraude o cualquier incidente tras la revelación de contacto, puede reportarlo mediante el endpoint `POST /api/v1/denuncias`. El administrador revisa las denuncias desde `GET /api/v1/admin/denuncias-pendientes` y puede sancionar al infractor cambiando su `estado_verificacion` a `rechazado` mediante `POST /api/v1/admin/denuncias/:id/resolver`.
- **SLA de verificación manual**: El SLA de 12 horas hábiles para revisión manual de documentos es adecuado para un MVP donde el rol de administrador recae en el mismo equipo de desarrollo. En producción se recomienda reducir este SLA y/o automatizar el proceso.

### Manejo de Datos Sensibles

- Las fotos de INE y selfies se consideran datos biométricos sensibles.
- El almacenamiento DEBE realizarse en un servicio externo (Cloudinary/S3) con URLs firmadas y tiempo de expiración limitado.
- El sistema NO DEBE almacenar en la base de datos principal las imágenes en base64 ni rutas internas de archivo.
- Se DEBE implementar una política de retención: las imágenes de verificación se eliminarán automáticamente 90 días después de la verificación exitosa, o 30 días después de un rechazo definitivo.
- El sistema DEBE permitir al usuario solicitar la eliminación de sus datos personales (fotos, número telefónico) mediante un endpoint de baja de cuenta.

### Matriz de Acceso por Estado de Verificación

Define qué acciones puede realizar un usuario según su `estado_verificacion`:

| Acción | pendiente | pendiente_manual | aprobado | rechazado |
|---|---|---|---|---|---|
| Ver listado de mandados (título, tipo, distancia, fecha límite) | ✅ | ✅ | ✅ | ✅ |
| Ver detalle de mandado (descripción, dirección exacta) | ❌ (solo colonia/sector) | ❌ (solo colonia/sector) | ✅ | ❌ (solo colonia/sector) |
| Publicar mandados como Solicitante | ❌ | ✅ | ✅ | ❌ |
| Enviar ofertas como Mandadero | ❌ | ❌ | ✅ | ❌ |
| Ver información de contacto de la contraparte (teléfono) | ❌ | ❌ | ✅ | ❌ |
| Calificar a la contraparte tras completar mandado | ❌ | ❌ | ✅ | ❌ |

**Datos sensibles definidos**: se considera "dato sensible" el número de teléfono de cualquier usuario y las ubicaciones exactas de recogida/entrega. La dirección exacta solo es visible para usuarios verificados (estado `aprobado` o `pendiente_manual`). Los usuarios con estado `pendiente` o `rechazado` solo ven la colonia o sector general. El número de teléfono de la contraparte se revela a ambas partes al aceptar una oferta.

**Justificación — Publicación de mandados para `pendiente_manual`**: Un usuario con estado `pendiente_manual` ya ha subido sus documentos de identidad (INE + selfie) y está en espera de revisión manual. Se le permite publicar mandados como solicitante porque:
1. Ya completó el paso más crítico de verificación (carga de documentos reales).
2. Publicar un mandado no implica recibir pagos ni acceder a datos sensibles de otros usuarios.
3. Restringir esta acción retrasaría la adopción sin un beneficio de seguridad significativo.
4. El contacto del solicitante solo se revela al aceptar una oferta, momento en el que ya debe estar `aprobado`.

**Nota**: Un usuario con `estado_verificacion = rechazado` puede volver a subir su documentación para solicitar una nueva verificación.

## Requisitos *(obligatorio)*

### Requisitos Funcionales

- **FR-001**: El sistema DEBE permitir a los usuarios crear cuentas con nombre, teléfono (validado vía SMS) y correo electrónico.
- **FR-002**: El sistema DEBE permitir a los Solicitantes publicar mandados con ubicaciones de recogida/entrega, fecha límite y descripción.
- **FR-003**: El sistema DEBE permitir a los Mandaderos enviar ofertas de precio para mandados activos.
- **FR-004**: (DIFERIDO) El sistema NO gestiona pagos en el MVP. La monetización (tarifa de contacto) se implementará en una fase posterior.
- **FR-005**: El sistema DEBE revelar la información de contacto de ambas partes (nombre y teléfono) inmediatamente después de que la oferta sea aceptada y se abra el canal de mensajería. Antes de la revelación, el sistema DEBE solicitar confirmación explícita al solicitante (consentimiento para compartir su contacto con el mandadero).
- **FR-006**: El sistema DEBE permitir a los usuarios calificarse mutuamente tras la finalización de la tarea.
- **FR-007**: El sistema DEBE permitir a los usuarios subir una foto de su INE y una selfie (foto en vivo) para iniciar el proceso de verificación de identidad. El sistema procesará los documentos de forma asíncrona (vía OCR/servicio externo) y notificará al usuario el resultado (`aprobado` o `rechazado`). Un usuario con verificación rechazada puede reintentar la verificación subiendo nuevos documentos. Si el servicio de OCR falla o no está disponible, el sistema DEBE asignar el estado `pendiente_manual` y notificar a un administrador para que revise y apruebe/rechace manualmente los documentos.
- **FR-008**: El sistema DEBE habilitar un canal de mensajería interna entre Solicitante y Mandadero una vez que una oferta es aceptada. El canal DEBE permitir el envío y recepción de mensajes de texto, y DEBE cerrarse a nuevos mensajes cuando el mandado se completa (solo lectura).
- **FR-009**: El sistema DEBE permitir a los usuarios reportar incidentes (acoso, fraude) post-transacción mediante un endpoint de denuncias. El administrador DEBE poder listar las denuncias pendientes y sancionar al usuario infractor cambiando su `estado_verificacion` a `rechazado`. Los endpoints del panel de administración (`/admin/`) DEBEN estar protegidos con autenticación JWT (`authenticate`) y verificación de rol administrador (`requireAdmin`), identificado por el número telefónico configurado en `ADMIN_TELEFONO`.

### Entidades Clave

- **Usuario**: Representa tanto a Solicitantes como a Mandaderos; contiene el estado de verificación de identidad (INE/ID) y la reputación.
  - Un mismo usuario puede actuar como Solicitante y Mandadero. No existen perfiles de cuenta separados; el rol se determina por la acción que realiza (crear un mandado = Solicitante, enviar una oferta = Mandadero).
- **Mandado**: La solicitud de servicio principal; contiene ubicaciones, tipo (compra/trámite) y fecha límite.
- **Oferta**: El puente entre un Mandado y un Mandadero; contiene el precio propuesto y el estado.
- **Mensaje**: Representa un mensaje individual dentro de un canal entre Solicitante y Mandadero para un mandado aceptado. Contiene el texto, remitente, fecha de envío y estado de lectura.
- **Denuncia**: Reporte de incidente post-transacción entre usuarios. Contiene el denunciante, denunciado, mandado asociado, motivo y estado.

## Criterios de Éxito *(obligatorio)*

### Resultados Medibles

- **SC-001**: Al menos 100 publicaciones completadas durante el primer mes de lanzamiento.
- **SC-002**: La tasa de conversión de publicación a oferta aceptada debe ser > 20%.
- **SC-003**: La calificación promedio de los usuarios en la plataforma debe ser de al menos 4/5 estrellas.

## Suposiciones

- Los usuarios cuentan con conexión estable a internet y acceso a un smartphone con GPS.
- No hay monetización en el MVP. La tarifa de contacto y modelo de ingresos se definirán e implementarán en fases posteriores.
- Para el MVP, las ubicaciones de recogida y entrega se ingresarán mediante entrada de texto con geocodificación automática (sin selector de mapa interactivo). El radio de búsqueda por defecto para mandados cercanos será de 5 km.
- El lanzamiento inicial está estrictamente limitado a Querétaro y su área metropolitana.
- La verificación de identidad (carga de INE) proporciona suficiente confianza para una etapa de MVP.
- **Proveedor de SMS**: Twilio, limitado exclusivamente a registro, autenticación y recuperación de acceso. Toda la mensajería del flujo de mandados (coordinación entre Solicitante y Mandadero) se realiza mediante mensajería interna en la plataforma. En caso de fallo del servicio de Twilio, el sistema usará validación por email como mecanismo de contingencia. El costo operativo estimado es de ~$0.0079 USD por SMS enviado.
- **Geocodificación**: Nominatim (OpenStreetMap) para normalización de direcciones. Se debe implementar manejo de errores con detección de límites de tasa (HTTP 429) y reintentos con backoff exponencial. Cache de resultados para evitar solicitudes repetidas. User-Agent configurado por política de uso. La precisión depende de la calidad del mapeo de la zona. Para el área metropolitana de Querétaro se espera una tasa de acierto suficiente para el MVP. Como mejora post-MVP se recomienda migrar a Google Places API o similar.
