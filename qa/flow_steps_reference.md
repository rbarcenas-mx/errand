# Referencia de Pasos para Plan Flow
## Pasos confirmados y condiciones necesarias para que el skill genere el plan correctamente

---

## QA-000: Levantar servidor Express

**Tipo:** shell
**Dependencias:** Docker + Postgres+Redis arriba (infra plan ejecutado previamente)
**Comando:**
```
export $(grep -v '^#' .env.qa | xargs) && nohup npx tsx src/index.ts > /tmp/qa_server.log 2>&1 & sleep 4 && echo 'Servidor iniciado'
```
**Notas:**
- `nohup` + redireccion a archivo evita que el servidor muera al cerrarse el pipe
- `npx tsx` evita el build (compilacion JIT), arranque en ~4s
- timeout sugerido: 60s para primera ejecucion (npx puede descargar paquetes)

---

## QA-00H: Health check del servidor

**Tipo:** http
**Endpoint:** `GET /api/v1/nonexistent`
**Expected:** status 404
**Notas:** Ruta inexistente, el servidor siempre responde 404 con `{"error":"Ruta no encontrada"}`

---

## F01-01: Registrar usuario SOLICITANTE

**Tipo:** http
**Endpoint:** `POST /api/v1/auth/register`
**Body:**
```json
{"nombre_completo": "Juan Perez Test", "telefono": "+524421000001", "correo_electronico": "juan@test.com"}
```
**Expected:** status 201, body_contains ["mensaje", "telefono"]
**Notas:**
- Telefono del solicitante DEBE ser DISTINTO a ADMIN_TELEFONO
- El body NO contiene `id` (solo mensaje+telefono)
- `userId` se obtiene en F01-02 (verify-otp)

---

## F01-02: Verificar OTP del solicitante

**Tipo:** http
**Endpoint:** `POST /api/v1/auth/verify-otp`
**Body:**
```json
{"telefono": "+524421000001", "codigo": "123456"}
```
**Expected:** status 200, body_contains ["token", "refresh_token", "usuario"]
**Extract:**
- `jwtToken` ← `$.token` (required)
- `refreshToken` ← `$.refresh_token` (required)
- `userId` ← `$.usuario.id` (required)
**Notas:**
- `ALLOW_TEST_OTP=true` requerido en .env.qa para que funcione codigo 123456
- El OTP se hashea con SHA-256 (telefono:codigo) antes de almacenar y comparar

---

## F01-03: Reintentar registro mismo telefono

**Tipo:** http
**Endpoint:** `POST /api/v1/auth/register`
**Body:**
```json
{"nombre_completo": "Otro Usuario", "telefono": "+524421000001"}
```
**Expected:** status 200, body_contains ["mensaje"]
**Notas:**
- Con `ALLOW_TEST_OTP=true`, devuelve 200 (reenvia OTP), no 409
- Sin `ALLOW_TEST_OTP=true`, devuelve 409
- El skill deberia documentar esta diferencia

---

## F01-04: OTP invalido

**Tipo:** http
**Endpoint:** `POST /api/v1/auth/verify-otp`
**Body:**
```json
{"telefono": "+524421000001", "codigo": "000000"}
```
**Expected:** status 401

---

## F01-05: Intentar registrar ADMIN

**Tipo:** http
**Endpoint:** `POST /api/v1/auth/register`
**Body:**
```json
{"nombre_completo": "Admin QA", "telefono": "+524421234567", "correo_electronico": "admin@test.com"}
```
**Expected:** status 201
**Notas:** El seed de Prisma puede crear este usuario, causando 409. El paso F01-06 maneja ambos casos.

---

## F01-06: Generar token JWT de admin

**Tipo:** shell
**Comando:** Leer JWT_SECRET de .env.qa y generar token con jsonwebtoken
```
export JWT_SECRET=$(grep JWT_SECRET .env.qa | cut -d= -f2) && node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({sub: 'admin-id', telefono: '+524421234567', estado_verificacion: 'aprobado'}, process.env.JWT_SECRET, {expiresIn: '1h'}))" > /tmp/qa_admin_token.txt && echo 'Token admin generado'
```
**Notas:**
- `jsonwebtoken` es dependencia del proyecto
- El telefono en el token DEBE coincidir con `ADMIN_TELEFONO` en .env.qa
- El token se guarda en `/tmp/qa_admin_token.txt`
- El `estado_verificacion: 'aprobado'` es necesario para que `requireAdmin` funcione (aunque requireAdmin no verifica estado, solo telefono)

---

## F01-07: Crear archivos dummy JPEG

**Tipo:** shell
**Comando:**
```
printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xd9' > /tmp/dummy_ine.jpg && printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy creados'
```

---

## F01-08: Subir documentos de identidad

**Tipo:** shell
**Comando:**
```
curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{jwtToken}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'
```
**Usa `{{jwtToken}}`** del context_store (requiere que el shell driver soporte reemplazo de variables)
**Notas:**
- El driver http NO soporta multipart, por eso se usa shell con curl
- `{{jwtToken}}` se reemplaza con el token extraido en F01-02
- Con credenciales Cloudinary mock, responde 200 y el usuario queda `aprobado` automaticamente
- Modificacion necesaria: `src/services/storage.service.ts` detecta credenciales mock y devuelve URL falsa

---

## F01-09: Consultar estado de verificacion

**Tipo:** http
**Endpoint:** `GET /api/v1/auth/verification-status`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Expected:** status 200, body_contains ["estado", "mensaje"]
**Extract:**
- `verificacionEstado` ← `$.estado` (opcional, para validacion)
**Notas:**
- Despues de F01-08, el usuario deberia quedar `aprobado` si las credenciales Cloudinary son mock
- Si `VERIFICACION_MANUAL=true`, quedaria `pendiente_manual` y necesitaria aprobacion admin

---

## F01-10: Refrescar token de acceso

**Tipo:** http
**Endpoint:** `POST /api/v1/auth/refresh`
**Body:**
```json
{"refresh_token": "{{refreshToken}}"}
```
**Expected:** status 200, body_contains ["token", "refresh_token"]
**Extract:**
- `newJwtToken` ← `$.token` (required)
- `newRefreshToken` ← `$.refresh_token` (required)
**Notas:**
- `{{refreshToken}}` debe ser el token real obtenido en F01-02 y almacenado en la BD
- NO se puede generar con jwt.sign arbitrariamente
- El endpoint rota el refresh token (invalida el anterior, entrega uno nuevo)

---

## F01-11: Crear mandado como solicitante

**Tipo:** http
**Endpoint:** `POST /api/v1/mandados`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Body:**
```json
{
  "titulo": "Comprar tortillas en tienda",
  "descripcion": "1kg tortillas de maiz, 500g frijoles",
  "tipo": "compra",
  "ubicacion_recogida": {"lat": 20.588, "lng": -100.389, "direccion": "Av. Principal 123, Col. Centro"},
  "ubicacion_entrega": {"lat": 20.590, "lng": -100.392, "direccion": "Calle Secundaria 456, Col. Norte"},
  "fecha_hora_limite": "2026-12-31T18:00:00Z"
}
```
**Expected:** status 201, body_contains ["id", "estado"]
**Extract:**
- `mandadoId` ← `$.id` (required)
**Notas:**
- `fecha_hora_limite` debe ser una fecha FUTURA (el controlador la valida)
- El endpoint requiere que el usuario tenga `estado_verificacion` que permita publicar (Matriz de Acceso: `pendiente_manual` y `aprobado` pueden)

---

## F01-12: Listar mandados cercanos

**Tipo:** http
**Endpoint:** `GET /api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Expected:** status 200, body_contains ["data", "pagination"]
**Notas:**
- Requiere autenticacion (token)
- El body devuelve `data` (array de mandados) y `pagination` (page, limit, total)

---

## F01-13: Ver detalle del mandado

**Tipo:** http
**Endpoint:** `GET /api/v1/mandados/{{mandadoId}}`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Expected:** status 200, body_contains ["id", "solicitante", "estado", "titulo"]
**Notas:**
- `{{mandadoId}}` es el ID extraido en F01-11
- `solicitante` incluye `id`, `nombre_completo`, `puntuacion_promedio`

---

## F01-14: Registrar usuario MANDADERO

**Tipo:** http
**Endpoint:** `POST /api/v1/auth/register`
**Body:**
```json
{"nombre_completo": "Maria Lopez Mandadero", "telefono": "+524421000002", "correo_electronico": "maria@test.com"}
```
**Expected:** status 201

---

## F01-15: Verificar OTP del mandadero

**Tipo:** http
**Endpoint:** `POST /api/v1/auth/verify-otp`
**Body:**
```json
{"telefono": "+524421000002", "codigo": "123456"}
```
**Expected:** status 200, body_contains ["token", "usuario"]
**Extract:**
- `mandaderoToken` ← `$.token` (required)
- `mandaderoId` ← `$.usuario.id` (required)

---

## F01-16: Subir documentos del mandadero (curl multipart con archivos dummy)

**Tipo:** shell
**Comando:**
```
curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{mandaderoToken}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'
```
**Notas:** Mismo proceso que F01-08 pero con token del mandadero. Con credenciales mock, queda `aprobado` automaticamente.

---

## F01-17: Verificar estado del mandadero (opcional, confirmar aprobado)

**Tipo:** http
**Endpoint:** `GET /api/v1/auth/verification-status`
**Headers:** `Authorization: Bearer {{mandaderoToken}}`
**Expected:** status 200, body_contains ["estado"]

---

## F01-18: Mandadero envia oferta al mandado

**Tipo:** http
**Endpoint:** `POST /api/v1/mandados/{{mandadoId}}/ofertas`
**Headers:** `Authorization: Bearer {{mandaderoToken}}`
**Body:**
```json
{"monto_ofertado": 50.00}
```
**Expected:** status 201, body_contains ["id", "estado"]
**Extract:**
- `ofertaId` ← `$.id`
**Notas:**
- El mandadero debe tener `estado_verificacion === 'aprobado'` (canSendOffer)
- `monto_ofertado` debe ser positivo

---

## F01-19: Solicitante lista ofertas de su mandado

**Tipo:** http
**Endpoint:** `GET /api/v1/mandados/{{mandadoId}}/ofertas`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Expected:** status 200
**Notas:** Solo el solicitante del mandado puede ver las ofertas

---

## F01-20: Solicitante acepta la oferta del mandadero

**Tipo:** http
**Endpoint:** `PATCH /api/v1/ofertas/{{ofertaId}}`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Body:**
```json
{"accion": "aceptada"}
```
**Expected:** status 200, body_contains ["mensaje", "contacto_mandadero"]
**Notas:**
- `accion` puede ser `aceptada` o `rechazada`
- Al aceptar, se revela el contacto de ambas partes
- El mandado cambia a estado `en_progreso`
- El canal de mensajeria se abre para el mandado

---

## F01-21: Solic envia mensaje en el canal

**Tipo:** http
**Endpoint:** `POST /api/v1/mandados/{{mandadoId}}/mensajes`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Body:**
```json
{"texto": "Hola, gracias por aceptar la oferta"}
```
**Expected:** status 201, body_contains ["id", "creado_en"]

---

## F01-22: Mandadero lee los mensajes

**Tipo:** http
**Endpoint:** `GET /api/v1/mandados/{{mandadoId}}/mensajes`
**Headers:** `Authorization: Bearer {{mandaderoToken}}`
**Expected:** status 200, body_contains ["mensajes", "can_escribir"]

---

## F01-23: Mandadero responde al mensaje

**Tipo:** http
**Endpoint:** `POST /api/v1/mandados/{{mandadoId}}/mensajes`
**Headers:** `Authorization: Bearer {{mandaderoToken}}`
**Body:**
```json
{"texto": "Si, voy en 30 minutos"}
```
**Expected:** status 201

---

## F01-24: Solic lee mensajes (ve ambos lados de la conversacion)

**Tipo:** http
**Endpoint:** `GET /api/v1/mandados/{{mandadoId}}/mensajes`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Expected:** status 200, body_contains ["mensajes"]

---

## F01-25: Marcar mandado como completado (solicitante)

**Tipo:** http
**Endpoint:** `PATCH /api/v1/mandados/{{mandadoId}}/estado`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Body:**
```json
{"estado": "completado"}
```
**Expected:** status 200, body_contains ["id", "estado"]
**Notas:** Solo el solicitante puede marcar como completado. El canal de mensajeria se cierra (solo lectura).

---

## F01-26: Calificar al mandadero

**Tipo:** http
**Endpoint:** `POST /api/v1/calificaciones`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Body:**
```json
{"id_mandado": "{{mandadoId}}", "id_calificado": "{{mandaderoId}}", "puntuacion": 5, "comentario": "Excelente servicio"}
```
**Expected:** status 201, body_contains ["id"]
**Notas:**
- `id_calificado` debe ser el ID del mandadero (no el del solicitante)
- `puntuacion` entre 1 y 5
- Solo usuarios con `estado_verificacion === 'aprobado'` pueden calificar (canRate)

---

## F01-27: Denunciar al mandadero por acoso

**Tipo:** http
**Endpoint:** `POST /api/v1/denuncias`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Body:**
```json
{"id_usuario_denunciado": "{{mandaderoId}}", "id_mandado": "{{mandadoId}}", "motivo": "acoso", "descripcion": "Mensajes inapropiados post entrega"}
```
**Expected:** status 201, body_contains ["id", "estado"]

---

## F01-28: Intentar auto-denuncia (400)

**Tipo:** http
**Endpoint:** `POST /api/v1/denuncias`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Body:**
```json
{"id_usuario_denunciado": "{{userId}}", "id_mandado": "{{mandadoId}}", "motivo": "otro", "descripcion": "Auto denuncia de prueba"}
```
**Expected:** status 400

---

## F01-29: Acceso admin denegado (token no admin)

**Tipo:** http
**Endpoint:** `GET /api/v1/admin/verificaciones-pendientes`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Expected:** status 403

---

## F01-30: Eliminar cuenta del solicitante

**Tipo:** http
**Endpoint:** `DELETE /api/v1/auth/cuenta`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Expected:** status 200, body_contains ["mensaje"]

---

## F01-31: Verificar que el usuario ya no existe

**Tipo:** http
**Endpoint:** `POST /api/v1/auth/verify-otp`
**Body:**
```json
{"telefono": "+524421000001", "codigo": "123456"}
```
**Expected:** status 401
**Notas:** El OTP ya fue consumido y el usuario eliminado. El controlador devuelve 401 (no 404) porque verifyOtp falla primero.

---

## F01-32: Crear mandado con datos invalidos (422)

**Tipo:** http
**Endpoint:** `POST /api/v1/mandados`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Body:**
```json
{"titulo": "", "tipo": "invalido"}
```
**Expected:** status 422
**Notas:** Prueba la validacion Zod del schema createMandadoSchema

---

## F01-33: Rechazar oferta del mandadero

**Tipo:** http
**Endpoint:** `PATCH /api/v1/ofertas/{{ofertaId}}`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Body:**
```json
{"accion": "rechazada"}
```
**Expected:** status 200
**Notas:** Solo funciona si la oferta esta en estado `pendiente`. Si ya fue aceptada, el endpoint devuelve 409 "Oferta ya no esta pendiente".

---

## F01-34: Cerrar sesion (logout)

**Tipo:** http
**Endpoint:** `POST /api/v1/auth/logout`
**Headers:** `Authorization: Bearer {{jwtToken}}`
**Body:**
```json
{"refresh_token": "{{refreshToken}}"}
```
**Expected:** status 200
**Notas:** `{{refreshToken}}` debe ser el refresh token REAL obtenido en F01-02 (almacenado en BD). No se puede usar un token generado con jwt.sign arbitrariamente.

---

## Condiciones necesarias para el funcionamiento del plan

1. **Docker** debe estar arriba con Postgres+Redis (infra plan ejecutado)
2. **.env.qa** debe existir con `ALLOW_TEST_OTP=true` y credenciales Cloudinary mock
3. **`src/services/storage.service.ts`** debe tener deteccion de credenciales mock (mock_cloud → devolver URL falsa sin conectar)
4. **Shell driver** debe soportar reemplazo de `{{var}}` con valores del context_store
5. **`ADMIN_TELEFONO`** en .env.qa debe coincidir con el telefono usado en F01-06
