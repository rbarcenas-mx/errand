# Contratos de API — Mandadero MVP

Formato: REST sobre HTTP/JSON. Base URL: `/api/v1`

## Consideraciones Generales

### Sesiones JWT
- **Access token**: 1 hora de duración (configurable vía `JWT_EXPIRES_IN`). Reducido de 24h para limitar la ventana de exposición ante tokens robados.
- **Refresh token**: 30 días de duración, almacenado en la base de datos con hash. Permite renovar el access token sin re-autenticación vía OTP.
- **Revocación**: Al hacer logout o detectar fraude, el refresh token se elimina de la BD, invalidando la sesión de forma efectiva.
- **Rotación**: Cada vez que se usa el refresh token para obtener un nuevo access token, se emite también un nuevo refresh token (rotación de un solo uso).
- **Endpoints requeridos**:
  - `POST /api/v1/auth/refresh` — obtener nuevo access token con refresh token válido.
  - `POST /api/v1/auth/logout` — revocar refresh token activo.

---

## Autenticación

### POST /api/v1/auth/register
Registrar nuevo usuario con teléfono.

**Request**:
```json
{
  "nombre_completo": "Juan Pérez",
  "telefono": "+524421234567",
  "correo_electronico": "juan@ejemplo.com"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "mensaje": "Código OTP enviado vía SMS"
}
```

**Errores**: 409 (teléfono ya registrado), 422 (datos inválidos)

---

### POST /api/v1/auth/verify-otp
Validar código OTP recibido por SMS.

**Request**:
```json
{
  "telefono": "+524421234567",
  "codigo": "123456"
}
```

**Response 200**:
```json
{
  "token": "jwt_token",
  "usuario": {
    "id": "uuid",
    "nombre_completo": "Juan Pérez",
    "telefono": "+524421234567",
    "rol": "ambos",
    "estado_verificacion": "pendiente"
  }
}
```

**Errores**: 401 (código inválido o expirado)

**Nota**: La respuesta incluye también el `refresh_token` de 30 días:
```json
{
  "token": "jwt_access_token",
  "refresh_token": "opaque_refresh_token",
  "usuario": { ... }
}
```

---

### POST /api/v1/auth/refresh
Obtener nuevo access token usando un refresh token válido.

**Request**:
```json
{
  "refresh_token": "opaque_refresh_token"
}
```

**Response 200**:
```json
{
  "token": "nuevo_jwt_access_token",
  "refresh_token": "nuevo_refresh_token"
}
```

**Errores**: 401 (refresh token inválido, expirado o revocado)

---

### POST /api/v1/auth/logout
Revocar el refresh token activo e invalidar la sesión.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "refresh_token": "opaque_refresh_token"
}
```

**Response 200**:
```json
{
  "mensaje": "Sesión cerrada correctamente"
}
```

**Errores**: 401 (no autenticado)

---

### POST /api/v1/auth/verify-identity
Subir INE + selfie para verificación de identidad.

**Request**: `multipart/form-data`
```
foto_ine: File (imagen JPG/PNG, max 5MB)
foto_vivo: File (imagen JPG/PNG, max 5MB)
```

**Response 200**:
```json
{
  "estado": "pendiente",
  "mensaje": "Documentos recibidos, verificación en proceso"
}
```

**Errores**: 400 (archivos inválidos o faltantes)

---

### GET /api/v1/auth/verification-status
Consultar el estado actual de la verificación de identidad.

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "estado": "pendiente",
  "documento_recibido": true,
  "foto_vivo_recibida": true,
  "mensaje": "Verificación en proceso, espera resultados"
}
```

**Valores de `estado`**: `pendiente`, `aprobado`, `rechazado`
**Nota**: La verificación es asíncrona. El cliente debe hacer polling con este endpoint para conocer el resultado final.

---

## Notificaciones

### POST /api/twilio/webhook
Webhook para recibir confirmaciones de entrega de SMS/WhatsApp desde Twilio.

**Request** (Twilio standard webhook):
```
form-data:
  MessageSid: string
  MessageStatus: delivered|failed|undelivered|sent
  To: string (teléfono destino)
  From: string (teléfono origen)
  ErrorCode: string (opcional)
```

**Response 200**:
```json
{
  "status": "received"
}
```

**Nota**: Este endpoint solo registra el estado del mensaje. No requiere autenticación (Twilio firma las peticiones con Twilio-Auth-Token; validar firma en implementación).

---

## Mandados

### GET /api/v1/mandados
Listar mandados activos cercanos a una ubicación.

**Query params**:
- `lat` (float, requerido)
- `lng` (float, requerido)
- `radio_km` (float, default 10)
- `tipo` (string, opcional: `compra`, `tramite`)
- `estado` (string, default `publicado`)
- `page` (int, default 1)
- `limit` (int, default 20)

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Comprar tortillas",
      "tipo": "compra",
      "ubicacion_recogida": { "lat": 20.588, "lng": -100.389 },
      "ubicacion_entrega": { "lat": 20.590, "lng": -100.392 },
      "distancia_km": 2.3,
      "fecha_hora_limite": "2026-06-20T18:00:00Z",
      "total_ofertas": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

---

### POST /api/v1/mandados
Crear nuevo mandado (solicitante autenticado).

**Request**:
```json
{
  "titulo": "Comprar tortillas en la tienda de la esquina",
  "descripcion": "Necesito 1kg de tortillas de maíz, paquete de 500g de frijoles y 1L de leche",
  "tipo": "compra",
  "ubicacion_recogida": { "lat": 20.588, "lng": -100.389, "direccion": "Av. Principal 123" },
  "ubicacion_entrega": { "lat": 20.590, "lng": -100.392, "direccion": "Calle Secundaria 456" },
  "fecha_hora_limite": "2026-06-20T18:00:00Z"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "estado": "publicado",
  "creado_en": "2026-06-16T12:00:00Z"
}
```

---

### GET /api/v1/mandados/:id
Obtener detalle completo de un mandado. Los campos de dirección exacta solo se incluyen si el usuario solicitante tiene estado de verificación `aprobado`. De lo contrario, solo se devuelve `colonia`.

**Response 200**:
```json
{
  "id": "uuid",
  "solicitante": {
    "id": "uuid",
    "nombre_completo": "Juan Pérez",
    "puntuacion_promedio": 4.5
  },
  "titulo": "Comprar tortillas...",
  "descripcion": "Necesito 1kg de tortillas...",
  "tipo": "compra",
  "foto_url": "https://cloudinary.com/...",
  "ubicacion_recogida": { "lat": 20.588, "lng": -100.389, "direccion": "Av. Principal 123, Col. Centro" },
  "ubicacion_entrega": { "lat": 20.590, "lng": -100.392, "direccion": "Calle Secundaria 456, Col. Norte" },
  "fecha_hora_limite": "2026-06-20T18:00:00Z",
  "estado": "publicado",
  "total_ofertas": 3,
  "creado_en": "2026-06-16T12:00:00Z"
}
```

**Errores**: 404 (no encontrado)

---

## Ofertas

### POST /api/v1/mandados/:id/ofertas
Enviar oferta para un mandado (mandadero autenticado).

**Request**:
```json
{
  "monto_ofertado": 50.00
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "estado": "pendiente",
  "creado_en": "2026-06-16T12:30:00Z"
}
```

**Errores**: 400 (ya ofertaste en este mandado), 404 (mandado no encontrado o expirado)

---

### GET /api/v1/mandados/:id/ofertas
Listar ofertas de un mandado (solo solicitante propietario).

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "mandadero": {
        "id": "uuid",
        "nombre_completo": "María López",
        "puntuacion_promedio": 4.8,
        "total_calificaciones": 12
      },
      "monto_ofertado": 50.00,
      "estado": "pendiente",
      "creado_en": "2026-06-16T12:30:00Z"
    }
  ]
}
```

**Errores**: 403 (no eres el solicitante de este mandado)

---

### PATCH /api/v1/ofertas/:id
Aceptar o rechazar una oferta (solicitante propietario).

**Request**:
```json
{
  "accion": "aceptada"
}
```
Valores: `aceptada`, `rechazada`

**Response 200**:
```json
{
  "mensaje": "Oferta aceptada. Contacto del mandadero revelado.",
  "contacto_mandadero": {
    "nombre_completo": "María López",
    "telefono": "+524421234567"
  }
}
```

**Errores**: 403 (no eres el solicitante), 409 (oferta ya no está pendiente)

---

### PATCH /api/v1/mandados/:id/estado
Cambiar estado de un mandado.

**Request**:
```json
{
  "estado": "completado"
}
```
Valores: `completado` (solicitante), `cancelado` (solicitante)

**Response 200**:
```json
{
  "id": "uuid",
  "estado": "completado",
  "actualizado_en": "2026-06-16T14:00:00Z"
}
```

---

## Calificaciones

### POST /api/v1/calificaciones
Calificar a la contraparte post-transacción. Solo puede calificar quien participó en el mandado (solicitante o mandadero) y solo una vez por mandado.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "id_mandado": "uuid",
  "id_calificado": "uuid",
  "puntuacion": 5,
  "comentario": "Excelente servicio, muy puntual"
}
```

**Campos**:
- `id_mandado` (string UUID, requerido): mandado que se está calificando.
- `id_calificado` (string UUID, requerido): usuario que recibe la calificación.
- `puntuacion` (entero, requerido): valor entre 1 y 5 inclusive.
- `comentario` (string, opcional): texto libre, máximo 500 caracteres.

**Response 201**:
```json
{
  "id": "uuid",
  "creado_en": "2026-06-16T15:00:00Z"
}
```

**Errores**:
- 400 — el mandado no está en estado `completado`
- 401 — no autenticado
- 403 — el usuario autenticado no participó en este mandado
- 409 — el usuario ya calificó esta transacción
- 422 — `puntuacion` fuera del rango 1-5, o `id_mandado`/`id_calificado` inválidos

---

## Mensajería

### GET /api/v1/mandados/:id/mensajes
Obtener mensajes del canal de un mandado aceptado. Solo accesible para el Solicitante y el Mandadero de la oferta aceptada.

**Headers**: `Authorization: Bearer <token>`

**Query params**:
- `antes_de` (ISO datetime, opcional): paginación, trae mensajes anteriores a esta fecha

**Response 200**:
```json
{
  "mensajes": [
    {
      "id": "uuid",
      "remitente_id": "uuid",
      "texto": "Hola, voy saliendo, ¿a qué hora llegas?",
      "leido": true,
      "creado_en": "2026-06-18T14:30:00Z"
    }
  ],
  "can_escribir": true
}
```

**Errores**: 401 (no autenticado), 403 (no participante del mandado), 404 (mandado no encontrado)

---

### POST /api/v1/mandados/:id/mensajes
Enviar un mensaje en el canal del mandado. Solo accesible para participantes del mandado con oferta aceptada.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "texto": "Hola, voy saliendo, ¿a qué hora llegas?"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "creado_en": "2026-06-18T14:30:00Z"
}
```

**Errores**:
- 400 — mensaje vacío o solo espacios
- 401 — no autenticado
- 403 — el mandado no tiene oferta aceptada o el usuario no es participante
- 404 — mandado no encontrado
- 422 — `texto` excede 1000 caracteres

---

## Administración

### GET /api/v1/admin/verificaciones-pendientes
Listar usuarios pendientes de revisión manual de identidad.

**Headers**: `Authorization: Bearer <token>` (admin)

**Response 200**:
```json
{
  "verificaciones": [
    {
      "id": "uuid",
      "nombre_completo": "Juan Pérez",
      "correo_electronico": "juan@ejemplo.com",
      "telefono": "+524421234567",
      "foto_ine_url": "https://cloudinary.com/ine.jpg",
      "foto_vivo_url": "https://cloudinary.com/selfie.jpg",
      "creado_en": "2026-06-19T10:00:00Z"
    }
  ],
  "total": 1
}
```

**Errores**: 401 (no autenticado), 403 (no admin)

---

### POST /api/v1/admin/verificaciones/:id/revisar
Aprobar o rechazar una verificación manual de identidad.

**Headers**: `Authorization: Bearer <token>` (admin)

**Request**:
```json
{
  "accion": "aprobar",
  "motivo": "Documentos válidos, identidad confirmada"
}
```
Valores de `accion`: `aprobar`, `rechazar`

**Response 200**:
```json
{
  "estado": "aprobado",
  "mensaje": "Tu verificación de identidad ha sido aprobada"
}
```

**Errores**: 400 (acción inválida o estado incorrecto), 401 (no autenticado), 403 (no admin), 404 (usuario no encontrado)

---

### GET /api/v1/admin/denuncias-pendientes
Listar denuncias de incidentes pendientes de revisión.

**Headers**: `Authorization: Bearer <token>` (admin)

**Response 200**:
```json
{
  "denuncias": [
    {
      "id": "uuid",
      "motivo": "acoso",
      "descripcion": "El usuario me acosó después de la entrega",
      "creado_en": "2026-06-19T10:00:00Z",
      "denunciante": { "id": "uuid", "nombre_completo": "Ana García", "telefono": "+524421234567" },
      "denunciado": { "id": "uuid", "nombre_completo": "Carlos López", "telefono": "+524427654321" },
      "mandado": { "id": "uuid", "titulo": "Comprar tortillas", "estado": "completado" }
    }
  ],
  "total": 1
}
```

**Errores**: 401 (no autenticado), 403 (no admin)

---

### POST /api/v1/admin/denuncias/:id/resolver
Resolver una denuncia sancionando al usuario o desestimándola.

**Headers**: `Authorization: Bearer <token>` (admin)

**Request**:
```json
{
  "accion": "rechazar_usuario"
}
```
Valores de `accion`: `rechazar_usuario` (cambia estado_verificacion a rechazado), `desestimar` (cierra denuncia sin acción)

**Response 200**:
```json
{
  "mensaje": "Usuario sancionado"
}
```

**Errores**: 400 (acción inválida), 401 (no autenticado), 403 (no admin), 404 (denuncia no encontrada)

---

## Denuncias

### POST /api/v1/denuncias
Reportar un incidente post-transacción.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "id_usuario_denunciado": "uuid",
  "id_mandado": "uuid",
  "motivo": "acoso",
  "descripcion": "Después de completar el mandado, el usuario me envió mensajes inapropiados"
}
```
Valores de `motivo`: `acoso`, `fraude`, `otro`

**Response 201**:
```json
{
  "id": "uuid",
  "estado": "pendiente",
  "creado_en": "2026-06-19T10:00:00Z"
}
```

**Errores**: 400 (auto-denuncia), 401 (no autenticado), 404 (usuario o mandado no encontrado), 422 (datos inválidos)

---

## Cuenta

### DELETE /api/v1/auth/cuenta
Eliminar cuenta y todos los datos personales asociados.

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "mensaje": "Cuenta eliminada correctamente"
}
```

**Errores**: 401 (no autenticado)
