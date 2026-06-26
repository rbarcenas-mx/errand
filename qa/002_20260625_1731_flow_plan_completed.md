# Plan de Validacion de Flujo Operativo

## Encabezado
- **run_id**: 002
- **desc**: Validacion de flujo operativo con 1 solicitante(s) y 1 mandadero(s)
- **date**: 2026-06-25
- **total_steps**: 40

## README

Plan generado desde templates YAML. Cubre registro, OTP, verificacion de identidad, mandados, ofertas, mensajeria, calificaciones, denuncias, errores y cierre de sesion.

Usuarios: 2 (1 solicitante(s), 1 mandadero(s)).
Mandados por solicitante: 1.
Modo verificacion: automatica.

## Pasos de Ejecucion

--- STEP
type: shell
id: QA-000
desc: Pre-flight - verificar que el servidor Express responde y la BD esta lista
command: "curl -s --max-time 5 http://localhost:3000/api/v1/nonexistent 2>/dev/null && echo 'Servidor OK' || (echo 'Servidor Express no responde en puerto 3000' && exit 1); export $(grep -v '^#' .env.qa | xargs) && docker compose exec -T db pg_isready -U postgres -d mandadero 2>/dev/null && echo 'BD OK' || (echo 'BD no disponible' && exit 1)"
checkpoint: true
timeout: 30

--- STEP
type: http
id: QA-00H
desc: Health check - verificar que el servidor responde
method: GET
url: http://localhost:3000/api/v1/nonexistent
headers: {}
expected:
  status: 404
checkpoint: true

--- STEP
type: http
id: "U101-01"
desc: "Registrar usuario Solicitante 1 (telefono +524421100001)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Solicitante 1"
  telefono: "+524421100001"
  correo_electronico: "solicitante1@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U101-02"
desc: "Verificar OTP de Solicitante 1"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100001"
  codigo: "123456"
expected:
  status: 200
  body_contains: ["token"]
extract:
  - var: "jwtToken1"
    path: "$.token"
    required: true
  - var: "refreshToken1"
    path: "$.refresh_token"
    required: true
  - var: "userId1"
    path: "$.usuario.id"
    required: true

--- STEP
type: http
id: "U202-01"
desc: "Registrar usuario Mandadero 1 (telefono +524421100002)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Mandadero 1"
  telefono: "+524421100002"
  correo_electronico: "mandadero1@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U202-02"
desc: "Verificar OTP de Mandadero 1"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100002"
  codigo: "123456"
expected:
  status: 200
  body_contains: ["token"]
extract:
  - var: "mandaderoToken1"
    path: "$.token"
    required: true
  - var: "mandaderoRefresh1"
    path: "$.refresh_token"
    required: true
  - var: "mandaderoId1"
    path: "$.usuario.id"
    required: true

--- STEP
type: shell
id: "U1-03"
desc: Crear archivos dummy JPEG para Solicitante 1
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U1-04"
desc: "Subir documentos de identidad de Solicitante 1"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{jwtToken1}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U1-04s"
desc: "Esperar procesamiento de verificacion de Solicitante 1"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U1-05"
desc: "Verificar estado de verificacion de Solicitante 1 (debe ser aprobado)"
method: GET
url: http://localhost:3000/api/v1/auth/verification-status
headers:
  Authorization: "Bearer {{jwtToken1}}"
expected:
  status: 200
body_verify:
  estado: "aprobado"

--- STEP
type: http
id: "U1-06"
desc: "Refrescar token para actualizar estado de verificacion de Solicitante 1"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{refreshToken1}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newjwtToken1"
    path: "$.token"
    required: true
  - var: "newrefreshToken1"
    path: "$.refresh_token"
    required: true

--- STEP
type: shell
id: "U2-03"
desc: Crear archivos dummy JPEG para Mandadero 1
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U2-04"
desc: "Subir documentos de identidad de Mandadero 1"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{mandaderoToken1}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U2-04s"
desc: "Esperar procesamiento de verificacion de Mandadero 1"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U2-05"
desc: "Verificar estado de verificacion de Mandadero 1 (debe ser aprobado)"
method: GET
url: http://localhost:3000/api/v1/auth/verification-status
headers:
  Authorization: "Bearer {{mandaderoToken1}}"
expected:
  status: 200
body_verify:
  estado: "aprobado"

--- STEP
type: http
id: "U2-06"
desc: "Refrescar token para actualizar estado de verificacion de Mandadero 1"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{mandaderoRefresh1}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newmandaderoToken1"
    path: "$.token"
    required: true
  - var: "newmandaderoRefresh1"
    path: "$.refresh_token"
    required: true

--- STEP
type: http
id: "M10-01"
desc: "Crear mandado (Solicitante 1)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 1"
  descripcion: "Descripcion del mandado de prueba 1"
  tipo: "compra"
  ubicacion_recogida:
    lat: 20.588
    lng: -100.389
    direccion: "Av. Principal 123, Col. Centro"
  ubicacion_entrega:
    lat: 20.590
    lng: -100.392
    direccion: "Calle Secundaria 456, Col. Norte"
  fecha_hora_limite: "2026-12-31T18:00:00Z"
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "mandadoM1Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M10-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M10-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M10-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM1Id}}"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M10-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM1Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM1Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M10-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M10-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM1Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200

--- STEP
type: http
id: "M10-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM1Id}}"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M10-01"
desc: "Solicitante 1 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM1Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M10-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM1Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M10-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM1Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M10-04"
desc: "Solicitante 1 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM1Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M10-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM1Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M10-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M10-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM1Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M10-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM1Id}}"
  id_calificado: "{{userId1}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "A01-01"
desc: "Acceso denegado a admin - listar verificaciones"
method: GET
url: http://localhost:3000/api/v1/admin/verificaciones-pendientes
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 403

--- STEP
type: http
id: "E01-01"
desc: "Error - OTP invalido (401)"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100001"
  codigo: "000000"
expected:
  status: 401

--- STEP
type: http
id: "E01-02"
desc: "Error - mandado con datos invalidos (422)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  titulo: ""
  tipo: "invalido"
expected:
  status: 422

--- STEP
type: http
id: "E01-03"
desc: "Error - auto-denuncia (400)"
method: POST
url: http://localhost:3000/api/v1/denuncias
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  id_usuario_denunciado: "{{userId1}}"
  id_mandado: "{{mandadoM1Id}}"
  motivo: "otro"
  descripcion: "Auto denuncia"
expected:
  status: 400

--- STEP
type: http
id: "C01-01"
desc: "Refrescar token de acceso (rota el refresh token)"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{newrefreshToken1}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newnewjwtToken1"
    path: "$.token"
    required: true
  - var: "newnewrefreshToken1"
    path: "$.refresh_token"
    required: true

--- STEP
type: http
id: "C01-02"
desc: "Cerrar sesion (logout) con el nuevo refresh token"
method: POST
url: http://localhost:3000/api/v1/auth/logout
headers:
  Authorization: "Bearer {{newnewjwtToken1}}"
  Content-Type: application/json
body:
  refresh_token: "{{newnewrefreshToken1}}"
expected:
  status: 200
  body_contains: ["mensaje"]

--- STEP
type: http
id: "C01-03"
desc: "Eliminar cuenta del solicitante"
method: DELETE
url: http://localhost:3000/api/v1/auth/cuenta
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["mensaje"]

--- STEP
type: http
id: "C01-04"
desc: "Verificar que el usuario ya no existe (401)"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100001"
  codigo: "123456"
expected:
  status: 401

## Execution Log

(Sin registros)
📌 QA-000 2026-06-26T02:49:32Z ✅ (0.2s) Pre-flight - verificar que el servidor Express responde y la BD esta lista
📌 QA-00H 2026-06-26T02:49:32Z ✅ (0.0s) Health check - verificar que el servidor responde
U101-01 2026-06-26T02:49:32Z ✅ (0.0s) Registrar usuario Solicitante 1 (telefono +524421100001)
U101-02 2026-06-26T02:49:32Z ✅ (0.1s) Verificar OTP de Solicitante 1
U202-01 2026-06-26T02:49:32Z ✅ (0.0s) Registrar usuario Mandadero 1 (telefono +524421100002)
U202-02 2026-06-26T02:49:32Z ✅ (0.1s) Verificar OTP de Mandadero 1
U1-03 2026-06-26T02:49:32Z ✅ (0.0s) Crear archivos dummy JPEG para Solicitante 1
U1-04 2026-06-26T02:49:32Z ✅ (0.0s) Subir documentos de identidad de Solicitante 1
📌 U1-04s 2026-06-26T02:49:39Z ✅ (7.0s) Esperar procesamiento de verificacion de Solicitante 1
U1-05 2026-06-26T02:49:39Z ✅ (0.0s) Verificar estado de verificacion de Solicitante 1 (debe ser aprobado)
U1-06 2026-06-26T02:49:39Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Solicitante 1
U2-03 2026-06-26T02:49:39Z ✅ (0.0s) Crear archivos dummy JPEG para Mandadero 1
U2-04 2026-06-26T02:49:39Z ✅ (0.0s) Subir documentos de identidad de Mandadero 1
📌 U2-04s 2026-06-26T02:49:46Z ✅ (7.0s) Esperar procesamiento de verificacion de Mandadero 1
U2-05 2026-06-26T02:49:46Z ✅ (0.0s) Verificar estado de verificacion de Mandadero 1 (debe ser aprobado)
U2-06 2026-06-26T02:49:46Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Mandadero 1
M10-01 2026-06-26T02:49:46Z ✅ (0.0s) Crear mandado (Solicitante 1)
📌 M10-01s 2026-06-26T02:49:53Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M10-02 2026-06-26T02:49:54Z ✅ (0.1s) Listar mandados cercanos
M10-03 2026-06-26T02:49:54Z ✅ (0.0s) Ver detalle del mandado
📌 M10-01 2026-06-26T02:49:54Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M10-01s 2026-06-26T02:50:01Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M10-02 2026-06-26T02:50:01Z ✅ (0.0s) Solicitante lista ofertas
M10-03 2026-06-26T02:50:01Z ✅ (0.0s) Solicitante acepta la oferta
M10-01 2026-06-26T02:50:01Z ✅ (0.0s) Solicitante 1 envia mensaje en el canal
M10-02 2026-06-26T02:50:01Z ✅ (0.0s) Mandadero 1 lee los mensajes
M10-03 2026-06-26T02:50:01Z ✅ (0.0s) Mandadero 1 responde al mensaje
M10-04 2026-06-26T02:50:01Z ✅ (0.0s) Solicitante 1 lee ambos mensajes
M10-01 2026-06-26T02:50:01Z ✅ (0.0s) Solicitante completa el mandado
📌 M10-01s 2026-06-26T02:50:08Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M10-02 2026-06-26T02:50:08Z ✅ (0.0s) Solicitante califica al mandadero
M10-03 2026-06-26T02:50:08Z ✅ (0.0s) Mandadero califica al solicitante
A01-01 2026-06-26T02:50:08Z ✅ (0.0s) Acceso denegado a admin - listar verificaciones
E01-01 2026-06-26T02:50:08Z ✅ (0.0s) Error - OTP invalido (401)
E01-02 2026-06-26T02:50:08Z ✅ (0.0s) Error - mandado con datos invalidos (422)
E01-03 2026-06-26T02:50:08Z ✅ (0.0s) Error - auto-denuncia (400)
C01-01 2026-06-26T02:50:08Z ✅ (0.1s) Refrescar token de acceso (rota el refresh token)
C01-02 2026-06-26T02:50:08Z ✅ (0.0s) Cerrar sesion (logout) con el nuevo refresh token
C01-03 2026-06-26T02:50:08Z ✅ (0.0s) Eliminar cuenta del solicitante
C01-04 2026-06-26T02:50:08Z ✅ (0.0s) Verificar que el usuario ya no existe (401)

### Resumen final

**Estado:** ✅ Completado — 40/40 pasos exitosos
**Fallidos:** 0  **Saltados:** 0

