# Modelo de Datos — Mandadero MVP

## Convenciones
- Todos los IDs usan UUID v4
- Timestamps en ISO 8601 con zona horaria UTC
- Decimales para montos monetarios (precisión 10,2)

---

## Usuario

Representa tanto a solicitantes como a mandaderos. Un usuario puede tener ambos roles.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | UUID | PK | Identificador único |
| nombre_completo | VARCHAR(150) | NOT NULL | Nombre real del usuario |
| telefono | VARCHAR(20) | UNIQUE, NOT NULL | Número validado vía SMS |
| correo_electronico | VARCHAR(255) | | Opcional, para recuperación |
| foto_ine_url | TEXT | | URL de foto del INE (Cloudinary) |
| foto_vivo_url | TEXT | | URL de selfie (Cloudinary) |
| estado_verificacion | ENUM | NOT NULL, DEFAULT 'pendiente' | pendiente, aprobado, rechazado |
| rol | ENUM | NOT NULL, DEFAULT 'ambos' | solicitante, mandadero, ambos |
| ubicacion_lat | FLOAT | | Latitud predeterminada |
| ubicacion_lng | FLOAT | | Longitud predeterminada |
| puntuacion_promedio | FLOAT | DEFAULT 0 | Promedio de calificaciones (0-5) |
| total_calificaciones | INT | DEFAULT 0 | Conteo de calificaciones recibidas |
| creado_en | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| actualizado_en | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Reglas de validación**:
- `telefono` debe tener formato E.164 (+524421234567)
- `estado_verificacion` solo cambia de `pendiente` → `aprobado` o `pendiente` → `rechazado`
- `puntuacion_promedio` se recalcula al insertar/actualizar cada `Calificacion`

---

## Mandado

Solicitud de servicio publicada por un solicitante.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | UUID | PK | |
| id_solicitante | UUID | FK → Usuario.id, NOT NULL | Quien solicita el mandado |
| titulo | VARCHAR(100) | NOT NULL | Resumen corto del mandado |
| descripcion | TEXT | NOT NULL | Detalles completos |
| tipo | ENUM | NOT NULL | compra, tramite |
| foto_url | TEXT | | Foto opcional del producto/recibo |
| ubicacion_recogida_lat | FLOAT | NOT NULL | |
| ubicacion_recogida_lng | FLOAT | NOT NULL | |
| ubicacion_entrega_lat | FLOAT | NOT NULL | |
| ubicacion_entrega_lng | FLOAT | NOT NULL | |
| direccion_recogida | TEXT | NOT NULL | Dirección legible |
| direccion_entrega | TEXT | NOT NULL | |
| fecha_hora_limite | TIMESTAMPTZ | NOT NULL | Tope para recibir ofertas |
| estado | ENUM | NOT NULL, DEFAULT 'publicado' | publicado, en_progreso, completado, cancelado |
| creado_en | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Reglas de validación**:
- `fecha_hora_limite` debe ser futura en el momento de creación
- Transiciones de estado permitidas: `publicado` → `en_progreso`, `publicado` → `cancelado`, `en_progreso` → `completado`, `en_progreso` → `cancelado`
- Solo el `id_solicitante` puede cancelar un mandado en estado `publicado` o `en_progreso`

---

## Oferta

Propuesta de un mandadero para realizar un mandado específico.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | UUID | PK | |
| id_mandado | UUID | FK → Mandado.id, NOT NULL | |
| id_mandadero | UUID | FK → Usuario.id, NOT NULL | |
| monto_ofertado | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Precio en MXN |
| estado | ENUM | NOT NULL, DEFAULT 'pendiente' | pendiente, aceptada, rechazada, cancelada |
| creado_en | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Reglas de validación**:
- Un mandadero no puede ofertar en su propio mandado
- Solo una oferta por mandadero por mandado
- Solo ofertas en estado `pendiente` pueden ser aceptadas/rechazadas
- Al aceptar una oferta, las demás en ese mandado pasan a `rechazada`

---

## Calificacion

Evaluación post-transacción entre usuario y mandadero.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | UUID | PK | |
| id_mandado | UUID | FK → Mandado.id, NOT NULL, UNIQUE(id_mandado, id_calificador) | |
| id_calificador | UUID | FK → Usuario.id, NOT NULL | Quien califica |
| id_calificado | UUID | FK → Usuario.id, NOT NULL | Quien recibe la calificación |
| puntuacion | INT | NOT NULL, CHECK (1-5) | |
| comentario | TEXT | | Opcional |
| creado_en | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Reglas de validación**:
- Solo se puede calificar si el mandado está en estado `completado`
- Un usuario solo puede calificar una vez por mandado (unique constraint compuesto)
- `id_calificador` ≠ `id_calificado`

---

## Mensaje

Mensaje individual dentro del canal de mensajería interna entre Solicitante y Mandadero para un mandado aceptado.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | UUID | PK | |
| id_mandado | UUID | FK → Mandado.id, NOT NULL | Canal asociado al mandado |
| id_remitente | UUID | FK → Usuario.id, NOT NULL | Quien envía el mensaje |
| texto | TEXT | NOT NULL, CHECK (LENGTH > 0) | Contenido del mensaje |
| leido | BOOLEAN | NOT NULL, DEFAULT false | Indica si el destinatario lo ha leído |
| creado_en | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Reglas de validación**:
- Solo se puede enviar mensajes si el mandado tiene una oferta aceptada
- Solo el Solicitante y el Mandadero de la oferta aceptada pueden enviar/leer mensajes
- No se permiten nuevos mensajes si el mandado está en estado `completado` o `cancelado` (solo lectura)
- `texto` no puede estar vacío ni contener solo espacios
- `texto` máximo 1000 caracteres

---

## Diagrama de Estados

### Mandado
```
publicado ──→ en_progreso ──→ completado
    │                            │
    └──→ cancelado ←─────────────┘
```

### Oferta
```
pendiente ──→ aceptada
    │            │
    ├──→ rechazada
    │
    └──→ cancelada
```

### Verificación de Usuario
```
pendiente ──→ aprobado
    │
    └──→ rechazado
```
