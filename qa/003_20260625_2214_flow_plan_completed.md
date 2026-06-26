# Plan de Validacion de Flujo Operativo

## Encabezado
- **run_id**: 003
- **desc**: Validacion de flujo operativo con 5 solicitante(s) y 5 mandadero(s)
- **date**: 2026-06-25
- **total_steps**: 481

## README

Plan generado desde templates YAML. Cubre registro, OTP, verificacion de identidad, mandados, ofertas, mensajeria, calificaciones, denuncias, errores y cierre de sesion.

Usuarios: 10 (5 solicitante(s), 5 mandadero(s)).
Mandados por solicitante: 5.
Modo verificacion: automatica.

## Pasos de Ejecucion

--- STEP
type: shell
id: QA-000
desc: Pre-flight - verificar que el servidor Express responde y la BD esta lista
command: "curl -s --max-time 5 http://localhost:3000/api/v1/nonexistent 2>/dev/null && echo 'Servidor OK' || (echo 'Servidor Express no responde en puerto 3000' && exit 1); export $(grep -v '^#' .env.qa | xargs) && docker compose exec -T db pg_isready -U postgres -d mandadero 2>/dev/null && echo 'BD OK' || (echo 'BD no disponible' && exit 1); grep -q API_RATE_LIMIT_MAX .env.qa 2>/dev/null || echo '⚠️ ADVERTENCIA: API_RATE_LIMIT_MAX no configurado en .env.qa. El plan de flow puede fallar con 429.'"
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
id: "U102-01"
desc: "Registrar usuario Solicitante 2 (telefono +524421100002)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Solicitante 2"
  telefono: "+524421100002"
  correo_electronico: "solicitante2@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U102-02"
desc: "Verificar OTP de Solicitante 2"
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
  - var: "jwtToken2"
    path: "$.token"
    required: true
  - var: "refreshToken2"
    path: "$.refresh_token"
    required: true
  - var: "userId2"
    path: "$.usuario.id"
    required: true

--- STEP
type: http
id: "U103-01"
desc: "Registrar usuario Solicitante 3 (telefono +524421100003)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Solicitante 3"
  telefono: "+524421100003"
  correo_electronico: "solicitante3@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U103-02"
desc: "Verificar OTP de Solicitante 3"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100003"
  codigo: "123456"
expected:
  status: 200
  body_contains: ["token"]
extract:
  - var: "jwtToken3"
    path: "$.token"
    required: true
  - var: "refreshToken3"
    path: "$.refresh_token"
    required: true
  - var: "userId3"
    path: "$.usuario.id"
    required: true

--- STEP
type: http
id: "U104-01"
desc: "Registrar usuario Solicitante 4 (telefono +524421100004)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Solicitante 4"
  telefono: "+524421100004"
  correo_electronico: "solicitante4@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U104-02"
desc: "Verificar OTP de Solicitante 4"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100004"
  codigo: "123456"
expected:
  status: 200
  body_contains: ["token"]
extract:
  - var: "jwtToken4"
    path: "$.token"
    required: true
  - var: "refreshToken4"
    path: "$.refresh_token"
    required: true
  - var: "userId4"
    path: "$.usuario.id"
    required: true

--- STEP
type: http
id: "U105-01"
desc: "Registrar usuario Solicitante 5 (telefono +524421100005)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Solicitante 5"
  telefono: "+524421100005"
  correo_electronico: "solicitante5@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U105-02"
desc: "Verificar OTP de Solicitante 5"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100005"
  codigo: "123456"
expected:
  status: 200
  body_contains: ["token"]
extract:
  - var: "jwtToken5"
    path: "$.token"
    required: true
  - var: "refreshToken5"
    path: "$.refresh_token"
    required: true
  - var: "userId5"
    path: "$.usuario.id"
    required: true

--- STEP
type: http
id: "U206-01"
desc: "Registrar usuario Mandadero 1 (telefono +524421100006)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Mandadero 1"
  telefono: "+524421100006"
  correo_electronico: "mandadero1@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U206-02"
desc: "Verificar OTP de Mandadero 1"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100006"
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
type: http
id: "U207-01"
desc: "Registrar usuario Mandadero 2 (telefono +524421100007)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Mandadero 2"
  telefono: "+524421100007"
  correo_electronico: "mandadero2@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U207-02"
desc: "Verificar OTP de Mandadero 2"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100007"
  codigo: "123456"
expected:
  status: 200
  body_contains: ["token"]
extract:
  - var: "mandaderoToken2"
    path: "$.token"
    required: true
  - var: "mandaderoRefresh2"
    path: "$.refresh_token"
    required: true
  - var: "mandaderoId2"
    path: "$.usuario.id"
    required: true

--- STEP
type: http
id: "U208-01"
desc: "Registrar usuario Mandadero 3 (telefono +524421100008)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Mandadero 3"
  telefono: "+524421100008"
  correo_electronico: "mandadero3@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U208-02"
desc: "Verificar OTP de Mandadero 3"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100008"
  codigo: "123456"
expected:
  status: 200
  body_contains: ["token"]
extract:
  - var: "mandaderoToken3"
    path: "$.token"
    required: true
  - var: "mandaderoRefresh3"
    path: "$.refresh_token"
    required: true
  - var: "mandaderoId3"
    path: "$.usuario.id"
    required: true

--- STEP
type: http
id: "U209-01"
desc: "Registrar usuario Mandadero 4 (telefono +524421100009)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Mandadero 4"
  telefono: "+524421100009"
  correo_electronico: "mandadero4@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U209-02"
desc: "Verificar OTP de Mandadero 4"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100009"
  codigo: "123456"
expected:
  status: 200
  body_contains: ["token"]
extract:
  - var: "mandaderoToken4"
    path: "$.token"
    required: true
  - var: "mandaderoRefresh4"
    path: "$.refresh_token"
    required: true
  - var: "mandaderoId4"
    path: "$.usuario.id"
    required: true

--- STEP
type: http
id: "U2010-01"
desc: "Registrar usuario Mandadero 5 (telefono +524421100010)"
method: POST
url: http://localhost:3000/api/v1/auth/register
headers:
  Content-Type: application/json
body:
  nombre_completo: "Mandadero 5"
  telefono: "+524421100010"
  correo_electronico: "mandadero5@test.com"
expected:
  status: 201
  body_contains: ["mensaje"]

--- STEP
type: http
id: "U2010-02"
desc: "Verificar OTP de Mandadero 5"
method: POST
url: http://localhost:3000/api/v1/auth/verify-otp
headers:
  Content-Type: application/json
body:
  telefono: "+524421100010"
  codigo: "123456"
expected:
  status: 200
  body_contains: ["token"]
extract:
  - var: "mandaderoToken5"
    path: "$.token"
    required: true
  - var: "mandaderoRefresh5"
    path: "$.refresh_token"
    required: true
  - var: "mandaderoId5"
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
desc: Crear archivos dummy JPEG para Solicitante 2
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U2-04"
desc: "Subir documentos de identidad de Solicitante 2"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{jwtToken2}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U2-04s"
desc: "Esperar procesamiento de verificacion de Solicitante 2"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U2-05"
desc: "Verificar estado de verificacion de Solicitante 2 (debe ser aprobado)"
method: GET
url: http://localhost:3000/api/v1/auth/verification-status
headers:
  Authorization: "Bearer {{jwtToken2}}"
expected:
  status: 200
body_verify:
  estado: "aprobado"

--- STEP
type: http
id: "U2-06"
desc: "Refrescar token para actualizar estado de verificacion de Solicitante 2"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{refreshToken2}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newjwtToken2"
    path: "$.token"
    required: true
  - var: "newrefreshToken2"
    path: "$.refresh_token"
    required: true

--- STEP
type: shell
id: "U3-03"
desc: Crear archivos dummy JPEG para Solicitante 3
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U3-04"
desc: "Subir documentos de identidad de Solicitante 3"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{jwtToken3}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U3-04s"
desc: "Esperar procesamiento de verificacion de Solicitante 3"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U3-05"
desc: "Verificar estado de verificacion de Solicitante 3 (debe ser aprobado)"
method: GET
url: http://localhost:3000/api/v1/auth/verification-status
headers:
  Authorization: "Bearer {{jwtToken3}}"
expected:
  status: 200
body_verify:
  estado: "aprobado"

--- STEP
type: http
id: "U3-06"
desc: "Refrescar token para actualizar estado de verificacion de Solicitante 3"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{refreshToken3}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newjwtToken3"
    path: "$.token"
    required: true
  - var: "newrefreshToken3"
    path: "$.refresh_token"
    required: true

--- STEP
type: shell
id: "U4-03"
desc: Crear archivos dummy JPEG para Solicitante 4
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U4-04"
desc: "Subir documentos de identidad de Solicitante 4"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{jwtToken4}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U4-04s"
desc: "Esperar procesamiento de verificacion de Solicitante 4"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U4-05"
desc: "Verificar estado de verificacion de Solicitante 4 (debe ser aprobado)"
method: GET
url: http://localhost:3000/api/v1/auth/verification-status
headers:
  Authorization: "Bearer {{jwtToken4}}"
expected:
  status: 200
body_verify:
  estado: "aprobado"

--- STEP
type: http
id: "U4-06"
desc: "Refrescar token para actualizar estado de verificacion de Solicitante 4"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{refreshToken4}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newjwtToken4"
    path: "$.token"
    required: true
  - var: "newrefreshToken4"
    path: "$.refresh_token"
    required: true

--- STEP
type: shell
id: "U5-03"
desc: Crear archivos dummy JPEG para Solicitante 5
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U5-04"
desc: "Subir documentos de identidad de Solicitante 5"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{jwtToken5}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U5-04s"
desc: "Esperar procesamiento de verificacion de Solicitante 5"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U5-05"
desc: "Verificar estado de verificacion de Solicitante 5 (debe ser aprobado)"
method: GET
url: http://localhost:3000/api/v1/auth/verification-status
headers:
  Authorization: "Bearer {{jwtToken5}}"
expected:
  status: 200
body_verify:
  estado: "aprobado"

--- STEP
type: http
id: "U5-06"
desc: "Refrescar token para actualizar estado de verificacion de Solicitante 5"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{refreshToken5}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newjwtToken5"
    path: "$.token"
    required: true
  - var: "newrefreshToken5"
    path: "$.refresh_token"
    required: true

--- STEP
type: shell
id: "U6-03"
desc: Crear archivos dummy JPEG para Mandadero 1
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U6-04"
desc: "Subir documentos de identidad de Mandadero 1"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{mandaderoToken1}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U6-04s"
desc: "Esperar procesamiento de verificacion de Mandadero 1"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U6-05"
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
id: "U6-06"
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
type: shell
id: "U7-03"
desc: Crear archivos dummy JPEG para Mandadero 2
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U7-04"
desc: "Subir documentos de identidad de Mandadero 2"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{mandaderoToken2}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U7-04s"
desc: "Esperar procesamiento de verificacion de Mandadero 2"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U7-05"
desc: "Verificar estado de verificacion de Mandadero 2 (debe ser aprobado)"
method: GET
url: http://localhost:3000/api/v1/auth/verification-status
headers:
  Authorization: "Bearer {{mandaderoToken2}}"
expected:
  status: 200
body_verify:
  estado: "aprobado"

--- STEP
type: http
id: "U7-06"
desc: "Refrescar token para actualizar estado de verificacion de Mandadero 2"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{mandaderoRefresh2}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newmandaderoToken2"
    path: "$.token"
    required: true
  - var: "newmandaderoRefresh2"
    path: "$.refresh_token"
    required: true

--- STEP
type: shell
id: "U8-03"
desc: Crear archivos dummy JPEG para Mandadero 3
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U8-04"
desc: "Subir documentos de identidad de Mandadero 3"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{mandaderoToken3}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U8-04s"
desc: "Esperar procesamiento de verificacion de Mandadero 3"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U8-05"
desc: "Verificar estado de verificacion de Mandadero 3 (debe ser aprobado)"
method: GET
url: http://localhost:3000/api/v1/auth/verification-status
headers:
  Authorization: "Bearer {{mandaderoToken3}}"
expected:
  status: 200
body_verify:
  estado: "aprobado"

--- STEP
type: http
id: "U8-06"
desc: "Refrescar token para actualizar estado de verificacion de Mandadero 3"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{mandaderoRefresh3}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newmandaderoToken3"
    path: "$.token"
    required: true
  - var: "newmandaderoRefresh3"
    path: "$.refresh_token"
    required: true

--- STEP
type: shell
id: "U9-03"
desc: Crear archivos dummy JPEG para Mandadero 4
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U9-04"
desc: "Subir documentos de identidad de Mandadero 4"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{mandaderoToken4}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U9-04s"
desc: "Esperar procesamiento de verificacion de Mandadero 4"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U9-05"
desc: "Verificar estado de verificacion de Mandadero 4 (debe ser aprobado)"
method: GET
url: http://localhost:3000/api/v1/auth/verification-status
headers:
  Authorization: "Bearer {{mandaderoToken4}}"
expected:
  status: 200
body_verify:
  estado: "aprobado"

--- STEP
type: http
id: "U9-06"
desc: "Refrescar token para actualizar estado de verificacion de Mandadero 4"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{mandaderoRefresh4}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newmandaderoToken4"
    path: "$.token"
    required: true
  - var: "newmandaderoRefresh4"
    path: "$.refresh_token"
    required: true

--- STEP
type: shell
id: "U10-03"
desc: Crear archivos dummy JPEG para Mandadero 5
command: "test -f /tmp/dummy_ine.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_ine.jpg && test -f /tmp/dummy_selfie.jpg || printf '\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00\\xff\\xd9' > /tmp/dummy_selfie.jpg && echo 'Archivos dummy listos'"

--- STEP
type: shell
id: "U10-04"
desc: "Subir documentos de identidad de Mandadero 5"
command: "curl -s -X POST http://localhost:3000/api/v1/auth/verify-identity -H 'Authorization: Bearer {{mandaderoToken5}}' -F 'foto_ine=@/tmp/dummy_ine.jpg;type=image/jpeg' -F 'foto_vivo=@/tmp/dummy_selfie.jpg;type=image/jpeg'"

--- STEP
type: shell
id: "U10-04s"
desc: "Esperar procesamiento de verificacion de Mandadero 5"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "U10-05"
desc: "Verificar estado de verificacion de Mandadero 5 (debe ser aprobado)"
method: GET
url: http://localhost:3000/api/v1/auth/verification-status
headers:
  Authorization: "Bearer {{mandaderoToken5}}"
expected:
  status: 200
body_verify:
  estado: "aprobado"

--- STEP
type: http
id: "U10-06"
desc: "Refrescar token para actualizar estado de verificacion de Mandadero 5"
method: POST
url: http://localhost:3000/api/v1/auth/refresh
headers:
  Content-Type: application/json
body:
  refresh_token: "{{mandaderoRefresh5}}"
expected:
  status: 200
  body_contains: ["token", "refresh_token"]
extract:
  - var: "newmandaderoToken5"
    path: "$.token"
    required: true
  - var: "newmandaderoRefresh5"
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
id: "M20-01"
desc: "Crear mandado (Solicitante 1)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 2"
  descripcion: "Descripcion del mandado de prueba 2"
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
  - var: "mandadoM2Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M20-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M20-02"
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
id: "M20-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM2Id}}"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M20-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM2Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM2Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M20-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M20-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM2Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200

--- STEP
type: http
id: "M20-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM2Id}}"
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
id: "M20-01"
desc: "Solicitante 1 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM2Id}}/mensajes"
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
id: "M20-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM2Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M20-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM2Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M20-04"
desc: "Solicitante 1 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM2Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M20-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM2Id}}/estado"
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
id: "M20-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M20-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM2Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M20-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM2Id}}"
  id_calificado: "{{userId1}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M30-01"
desc: "Crear mandado (Solicitante 1)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 3"
  descripcion: "Descripcion del mandado de prueba 3"
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
  - var: "mandadoM3Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M30-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M30-02"
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
id: "M30-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM3Id}}"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M30-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM3Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM3Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M30-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M30-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM3Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200

--- STEP
type: http
id: "M30-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM3Id}}"
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
id: "M30-01"
desc: "Solicitante 1 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM3Id}}/mensajes"
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
id: "M30-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM3Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M30-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM3Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M30-04"
desc: "Solicitante 1 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM3Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M30-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM3Id}}/estado"
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
id: "M30-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M30-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM3Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M30-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM3Id}}"
  id_calificado: "{{userId1}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M40-01"
desc: "Crear mandado (Solicitante 1)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 4"
  descripcion: "Descripcion del mandado de prueba 4"
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
  - var: "mandadoM4Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M40-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M40-02"
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
id: "M40-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM4Id}}"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M40-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM4Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM4Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M40-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M40-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM4Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200

--- STEP
type: http
id: "M40-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM4Id}}"
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
id: "M40-01"
desc: "Solicitante 1 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM4Id}}/mensajes"
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
id: "M40-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM4Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M40-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM4Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M40-04"
desc: "Solicitante 1 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM4Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M40-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM4Id}}/estado"
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
id: "M40-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M40-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM4Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M40-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM4Id}}"
  id_calificado: "{{userId1}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M50-01"
desc: "Crear mandado (Solicitante 1)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 5"
  descripcion: "Descripcion del mandado de prueba 5"
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
  - var: "mandadoM5Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M50-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M50-02"
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
id: "M50-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM5Id}}"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M50-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM5Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM5Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M50-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M50-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM5Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200

--- STEP
type: http
id: "M50-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM5Id}}"
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
id: "M50-01"
desc: "Solicitante 1 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM5Id}}/mensajes"
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
id: "M50-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM5Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M50-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM5Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M50-04"
desc: "Solicitante 1 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM5Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M50-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM5Id}}/estado"
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
id: "M50-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M50-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM5Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M50-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM5Id}}"
  id_calificado: "{{userId1}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M60-01"
desc: "Crear mandado (Solicitante 2)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken2}}"
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
  - var: "mandadoM6Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M60-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M60-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M60-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM6Id}}"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M60-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM6Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM6Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M60-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M60-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM6Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200

--- STEP
type: http
id: "M60-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM6Id}}"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M60-01"
desc: "Solicitante 2 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM6Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M60-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM6Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M60-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM6Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M60-04"
desc: "Solicitante 2 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM6Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M60-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM6Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M60-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M60-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM6Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M60-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM6Id}}"
  id_calificado: "{{userId2}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M70-01"
desc: "Crear mandado (Solicitante 2)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 2"
  descripcion: "Descripcion del mandado de prueba 2"
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
  - var: "mandadoM7Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M70-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M70-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M70-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM7Id}}"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M70-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM7Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM7Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M70-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M70-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM7Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200

--- STEP
type: http
id: "M70-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM7Id}}"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M70-01"
desc: "Solicitante 2 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM7Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M70-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM7Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M70-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM7Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M70-04"
desc: "Solicitante 2 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM7Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M70-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM7Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M70-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M70-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM7Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M70-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM7Id}}"
  id_calificado: "{{userId2}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M80-01"
desc: "Crear mandado (Solicitante 2)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 3"
  descripcion: "Descripcion del mandado de prueba 3"
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
  - var: "mandadoM8Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M80-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M80-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M80-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM8Id}}"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M80-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM8Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM8Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M80-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M80-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM8Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200

--- STEP
type: http
id: "M80-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM8Id}}"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M80-01"
desc: "Solicitante 2 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM8Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M80-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM8Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M80-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM8Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M80-04"
desc: "Solicitante 2 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM8Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M80-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM8Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M80-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M80-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM8Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M80-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM8Id}}"
  id_calificado: "{{userId2}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M90-01"
desc: "Crear mandado (Solicitante 2)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 4"
  descripcion: "Descripcion del mandado de prueba 4"
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
  - var: "mandadoM9Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M90-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M90-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M90-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM9Id}}"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M90-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM9Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM9Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M90-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M90-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM9Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200

--- STEP
type: http
id: "M90-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM9Id}}"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M90-01"
desc: "Solicitante 2 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM9Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M90-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM9Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M90-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM9Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M90-04"
desc: "Solicitante 2 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM9Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M90-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM9Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M90-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M90-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM9Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M90-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM9Id}}"
  id_calificado: "{{userId2}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M100-01"
desc: "Crear mandado (Solicitante 2)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 5"
  descripcion: "Descripcion del mandado de prueba 5"
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
  - var: "mandadoM10Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M100-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M100-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M100-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM10Id}}"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M100-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM10Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM10Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M100-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M100-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM10Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200

--- STEP
type: http
id: "M100-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM10Id}}"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M100-01"
desc: "Solicitante 2 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM10Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M100-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM10Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M100-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM10Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M100-04"
desc: "Solicitante 2 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM10Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M100-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM10Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M100-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M100-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken2}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM10Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M100-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM10Id}}"
  id_calificado: "{{userId2}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M110-01"
desc: "Crear mandado (Solicitante 3)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken3}}"
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
  - var: "mandadoM11Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M110-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M110-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M110-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM11Id}}"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M110-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM11Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM11Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M110-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M110-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM11Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200

--- STEP
type: http
id: "M110-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM11Id}}"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M110-01"
desc: "Solicitante 3 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM11Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M110-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM11Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M110-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM11Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M110-04"
desc: "Solicitante 3 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM11Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M110-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM11Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M110-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M110-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM11Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M110-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM11Id}}"
  id_calificado: "{{userId3}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M120-01"
desc: "Crear mandado (Solicitante 3)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 2"
  descripcion: "Descripcion del mandado de prueba 2"
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
  - var: "mandadoM12Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M120-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M120-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M120-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM12Id}}"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M120-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM12Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM12Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M120-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M120-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM12Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200

--- STEP
type: http
id: "M120-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM12Id}}"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M120-01"
desc: "Solicitante 3 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM12Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M120-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM12Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M120-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM12Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M120-04"
desc: "Solicitante 3 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM12Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M120-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM12Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M120-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M120-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM12Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M120-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM12Id}}"
  id_calificado: "{{userId3}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M130-01"
desc: "Crear mandado (Solicitante 3)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 3"
  descripcion: "Descripcion del mandado de prueba 3"
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
  - var: "mandadoM13Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M130-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M130-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M130-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM13Id}}"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M130-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM13Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM13Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M130-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M130-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM13Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200

--- STEP
type: http
id: "M130-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM13Id}}"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M130-01"
desc: "Solicitante 3 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM13Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M130-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM13Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M130-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM13Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M130-04"
desc: "Solicitante 3 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM13Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M130-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM13Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M130-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M130-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM13Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M130-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM13Id}}"
  id_calificado: "{{userId3}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M140-01"
desc: "Crear mandado (Solicitante 3)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 4"
  descripcion: "Descripcion del mandado de prueba 4"
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
  - var: "mandadoM14Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M140-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M140-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M140-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM14Id}}"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M140-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM14Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM14Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M140-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M140-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM14Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200

--- STEP
type: http
id: "M140-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM14Id}}"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M140-01"
desc: "Solicitante 3 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM14Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M140-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM14Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M140-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM14Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M140-04"
desc: "Solicitante 3 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM14Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M140-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM14Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M140-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M140-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM14Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M140-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM14Id}}"
  id_calificado: "{{userId3}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M150-01"
desc: "Crear mandado (Solicitante 3)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 5"
  descripcion: "Descripcion del mandado de prueba 5"
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
  - var: "mandadoM15Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M150-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M150-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M150-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM15Id}}"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M150-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM15Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM15Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M150-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M150-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM15Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200

--- STEP
type: http
id: "M150-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM15Id}}"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M150-01"
desc: "Solicitante 3 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM15Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M150-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM15Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M150-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM15Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M150-04"
desc: "Solicitante 3 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM15Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M150-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM15Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M150-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M150-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken3}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM15Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M150-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM15Id}}"
  id_calificado: "{{userId3}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M160-01"
desc: "Crear mandado (Solicitante 4)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken4}}"
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
  - var: "mandadoM16Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M160-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M160-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M160-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM16Id}}"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M160-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM16Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM16Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M160-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M160-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM16Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200

--- STEP
type: http
id: "M160-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM16Id}}"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M160-01"
desc: "Solicitante 4 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM16Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M160-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM16Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M160-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM16Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M160-04"
desc: "Solicitante 4 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM16Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M160-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM16Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M160-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M160-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM16Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M160-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM16Id}}"
  id_calificado: "{{userId4}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M170-01"
desc: "Crear mandado (Solicitante 4)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 2"
  descripcion: "Descripcion del mandado de prueba 2"
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
  - var: "mandadoM17Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M170-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M170-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M170-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM17Id}}"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M170-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM17Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM17Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M170-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M170-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM17Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200

--- STEP
type: http
id: "M170-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM17Id}}"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M170-01"
desc: "Solicitante 4 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM17Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M170-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM17Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M170-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM17Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M170-04"
desc: "Solicitante 4 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM17Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M170-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM17Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M170-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M170-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM17Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M170-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM17Id}}"
  id_calificado: "{{userId4}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M180-01"
desc: "Crear mandado (Solicitante 4)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 3"
  descripcion: "Descripcion del mandado de prueba 3"
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
  - var: "mandadoM18Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M180-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M180-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M180-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM18Id}}"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M180-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM18Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM18Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M180-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M180-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM18Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200

--- STEP
type: http
id: "M180-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM18Id}}"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M180-01"
desc: "Solicitante 4 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM18Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M180-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM18Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M180-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM18Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M180-04"
desc: "Solicitante 4 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM18Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M180-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM18Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M180-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M180-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM18Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M180-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM18Id}}"
  id_calificado: "{{userId4}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M190-01"
desc: "Crear mandado (Solicitante 4)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 4"
  descripcion: "Descripcion del mandado de prueba 4"
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
  - var: "mandadoM19Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M190-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M190-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M190-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM19Id}}"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M190-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM19Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM19Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M190-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M190-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM19Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200

--- STEP
type: http
id: "M190-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM19Id}}"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M190-01"
desc: "Solicitante 4 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM19Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M190-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM19Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M190-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM19Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M190-04"
desc: "Solicitante 4 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM19Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M190-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM19Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M190-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M190-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM19Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M190-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM19Id}}"
  id_calificado: "{{userId4}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M200-01"
desc: "Crear mandado (Solicitante 4)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 5"
  descripcion: "Descripcion del mandado de prueba 5"
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
  - var: "mandadoM20Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M200-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M200-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M200-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM20Id}}"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M200-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM20Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM20Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M200-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M200-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM20Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200

--- STEP
type: http
id: "M200-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM20Id}}"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M200-01"
desc: "Solicitante 4 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM20Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M200-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM20Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M200-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM20Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M200-04"
desc: "Solicitante 4 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM20Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M200-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM20Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M200-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M200-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken4}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM20Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M200-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM20Id}}"
  id_calificado: "{{userId4}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M210-01"
desc: "Crear mandado (Solicitante 5)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken5}}"
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
  - var: "mandadoM21Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M210-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M210-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M210-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM21Id}}"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M210-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM21Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM21Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M210-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M210-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM21Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200

--- STEP
type: http
id: "M210-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM21Id}}"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M210-01"
desc: "Solicitante 5 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM21Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M210-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM21Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M210-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM21Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M210-04"
desc: "Solicitante 5 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM21Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M210-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM21Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M210-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M210-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM21Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M210-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM21Id}}"
  id_calificado: "{{userId5}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M220-01"
desc: "Crear mandado (Solicitante 5)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 2"
  descripcion: "Descripcion del mandado de prueba 2"
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
  - var: "mandadoM22Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M220-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M220-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M220-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM22Id}}"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M220-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM22Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM22Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M220-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M220-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM22Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200

--- STEP
type: http
id: "M220-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM22Id}}"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M220-01"
desc: "Solicitante 5 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM22Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M220-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM22Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M220-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM22Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M220-04"
desc: "Solicitante 5 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM22Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M220-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM22Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M220-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M220-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM22Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M220-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM22Id}}"
  id_calificado: "{{userId5}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M230-01"
desc: "Crear mandado (Solicitante 5)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 3"
  descripcion: "Descripcion del mandado de prueba 3"
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
  - var: "mandadoM23Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M230-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M230-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M230-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM23Id}}"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M230-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM23Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM23Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M230-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M230-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM23Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200

--- STEP
type: http
id: "M230-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM23Id}}"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M230-01"
desc: "Solicitante 5 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM23Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M230-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM23Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M230-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM23Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M230-04"
desc: "Solicitante 5 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM23Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M230-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM23Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M230-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M230-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM23Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M230-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM23Id}}"
  id_calificado: "{{userId5}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M240-01"
desc: "Crear mandado (Solicitante 5)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 4"
  descripcion: "Descripcion del mandado de prueba 4"
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
  - var: "mandadoM24Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M240-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M240-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M240-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM24Id}}"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M240-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM24Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM24Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M240-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M240-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM24Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200

--- STEP
type: http
id: "M240-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM24Id}}"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M240-01"
desc: "Solicitante 5 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM24Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M240-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM24Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M240-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM24Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M240-04"
desc: "Solicitante 5 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM24Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M240-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM24Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M240-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M240-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM24Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M240-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM24Id}}"
  id_calificado: "{{userId5}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M250-01"
desc: "Crear mandado (Solicitante 5)"
method: POST
url: http://localhost:3000/api/v1/mandados
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  titulo: "Mandado de prueba 5"
  descripcion: "Descripcion del mandado de prueba 5"
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
  - var: "mandadoM25Id"
    path: "$.id"
    required: true

--- STEP
type: shell
id: "M250-01s"
desc: "Esperar propagacion de BD tras crear mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M250-02"
desc: "Listar mandados cercanos"
method: GET
url: "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=10"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["data"]

--- STEP
type: http
id: "M250-03"
desc: "Ver detalle del mandado"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM25Id}}"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "M250-01"
desc: "Mandadero envia oferta al mandado"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM25Id}}/ofertas"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  monto_ofertado: 50.00
expected:
  status: 201
  body_contains: ["id", "estado"]
extract:
  - var: "ofertaM25Id"
    path: "$.id"
checkpoint: true

--- STEP
type: shell
id: "M250-01s"
desc: "Esperar propagacion de BD tras crear oferta"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M250-02"
desc: "Solicitante lista ofertas"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM25Id}}/ofertas"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200

--- STEP
type: http
id: "M250-03"
desc: "Solicitante acepta la oferta"
method: PATCH
url: "http://localhost:3000/api/v1/ofertas/{{ofertaM25Id}}"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  accion: "aceptada"
expected:
  status: 200
  body_contains: ["mensaje", "contacto_mandadero"]

--- STEP
type: http
id: "M250-01"
desc: "Solicitante 5 envia mensaje en el canal"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM25Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  texto: "Hola, gracias por aceptar la oferta"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M250-02"
desc: "Mandadero 1 lee los mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM25Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M250-03"
desc: "Mandadero 1 responde al mensaje"
method: POST
url: "http://localhost:3000/api/v1/mandados/{{mandadoM25Id}}/mensajes"
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  texto: "Si, voy en 30 minutos"
expected:
  status: 201

--- STEP
type: http
id: "M250-04"
desc: "Solicitante 5 lee ambos mensajes"
method: GET
url: "http://localhost:3000/api/v1/mandados/{{mandadoM25Id}}/mensajes"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
expected:
  status: 200
  body_contains: ["mensajes"]

--- STEP
type: http
id: "M250-01"
desc: "Solicitante completa el mandado"
method: PATCH
url: "http://localhost:3000/api/v1/mandados/{{mandadoM25Id}}/estado"
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  estado: "completado"
expected:
  status: 200
  body_contains: ["id", "estado"]

--- STEP
type: shell
id: "M250-01s"
desc: "Esperar propagacion de BD tras completar mandado"
command: "sleep 7"
checkpoint: true

--- STEP
type: http
id: "M250-02"
desc: "Solicitante califica al mandadero"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newjwtToken5}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM25Id}}"
  id_calificado: "{{mandaderoId1}}"
  puntuacion: 5
  comentario: "Excelente servicio"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "M250-03"
desc: "Mandadero califica al solicitante"
method: POST
url: http://localhost:3000/api/v1/calificaciones
headers:
  Authorization: "Bearer {{newmandaderoToken1}}"
  Content-Type: application/json
body:
  id_mandado: "{{mandadoM25Id}}"
  id_calificado: "{{userId5}}"
  puntuacion: 5
  comentario: "Muy buen trato"
expected:
  status: 201
  body_contains: ["id"]

--- STEP
type: http
id: "D01-01"
desc: "Solicitante denuncia al mandadero por acoso"
method: POST
url: http://localhost:3000/api/v1/denuncias
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  id_usuario_denunciado: "{{mandaderoId1}}"
  id_mandado: "{{mandadoM1Id}}"
  motivo: "acoso"
  descripcion: "Mensajes inapropiados post entrega"
expected:
  status: 201
  body_contains: ["id", "estado"]

--- STEP
type: http
id: "D01-02"
desc: "Intentar auto-denuncia (400)"
method: POST
url: http://localhost:3000/api/v1/denuncias
headers:
  Authorization: "Bearer {{newjwtToken1}}"
  Content-Type: application/json
body:
  id_usuario_denunciado: "{{userId1}}"
  id_mandado: "{{mandadoM1Id}}"
  motivo: "otro"
  descripcion: "Auto denuncia de prueba"
expected:
  status: 400

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
📌 QA-000 2026-06-26T04:21:53Z ✅ (0.3s) Pre-flight - verificar que el servidor Express responde y la BD esta lista
📌 QA-00H 2026-06-26T04:21:53Z ✅ (0.0s) Health check - verificar que el servidor responde
U101-01 2026-06-26T04:21:53Z ✅ (0.0s) Registrar usuario Solicitante 1 (telefono +524421100001)
U101-02 2026-06-26T04:21:54Z ✅ (0.1s) Verificar OTP de Solicitante 1
U102-01 2026-06-26T04:21:54Z ✅ (0.0s) Registrar usuario Solicitante 2 (telefono +524421100002)
U102-02 2026-06-26T04:21:54Z ✅ (0.1s) Verificar OTP de Solicitante 2
U103-01 2026-06-26T04:21:54Z ✅ (0.0s) Registrar usuario Solicitante 3 (telefono +524421100003)
U103-02 2026-06-26T04:21:54Z ✅ (0.1s) Verificar OTP de Solicitante 3
U104-01 2026-06-26T04:21:54Z ✅ (0.0s) Registrar usuario Solicitante 4 (telefono +524421100004)
U104-02 2026-06-26T04:21:54Z ✅ (0.1s) Verificar OTP de Solicitante 4
U105-01 2026-06-26T04:21:54Z ✅ (0.0s) Registrar usuario Solicitante 5 (telefono +524421100005)
U105-02 2026-06-26T04:21:54Z ✅ (0.1s) Verificar OTP de Solicitante 5
U206-01 2026-06-26T04:21:54Z ✅ (0.0s) Registrar usuario Mandadero 1 (telefono +524421100006)
U206-02 2026-06-26T04:21:54Z ✅ (0.1s) Verificar OTP de Mandadero 1
U207-01 2026-06-26T04:21:54Z ✅ (0.0s) Registrar usuario Mandadero 2 (telefono +524421100007)
U207-02 2026-06-26T04:21:54Z ✅ (0.1s) Verificar OTP de Mandadero 2
U208-01 2026-06-26T04:21:54Z ✅ (0.0s) Registrar usuario Mandadero 3 (telefono +524421100008)
U208-02 2026-06-26T04:21:54Z ✅ (0.1s) Verificar OTP de Mandadero 3
U209-01 2026-06-26T04:21:54Z ✅ (0.0s) Registrar usuario Mandadero 4 (telefono +524421100009)
U209-02 2026-06-26T04:21:54Z ✅ (0.1s) Verificar OTP de Mandadero 4
U2010-01 2026-06-26T04:21:54Z ✅ (0.0s) Registrar usuario Mandadero 5 (telefono +524421100010)
U2010-02 2026-06-26T04:21:54Z ✅ (0.1s) Verificar OTP de Mandadero 5
U1-03 2026-06-26T04:21:54Z ✅ (0.0s) Crear archivos dummy JPEG para Solicitante 1
U1-04 2026-06-26T04:21:54Z ✅ (0.0s) Subir documentos de identidad de Solicitante 1
📌 U1-04s 2026-06-26T04:22:01Z ✅ (7.0s) Esperar procesamiento de verificacion de Solicitante 1
U1-05 2026-06-26T04:22:01Z ✅ (0.0s) Verificar estado de verificacion de Solicitante 1 (debe ser aprobado)
U1-06 2026-06-26T04:22:02Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Solicitante 1
U2-03 2026-06-26T04:22:02Z ✅ (0.0s) Crear archivos dummy JPEG para Solicitante 2
U2-04 2026-06-26T04:22:02Z ✅ (0.0s) Subir documentos de identidad de Solicitante 2
📌 U2-04s 2026-06-26T04:22:09Z ✅ (7.0s) Esperar procesamiento de verificacion de Solicitante 2
U2-05 2026-06-26T04:22:09Z ✅ (0.0s) Verificar estado de verificacion de Solicitante 2 (debe ser aprobado)
U2-06 2026-06-26T04:22:09Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Solicitante 2
U3-03 2026-06-26T04:22:09Z ✅ (0.0s) Crear archivos dummy JPEG para Solicitante 3
U3-04 2026-06-26T04:22:09Z ✅ (0.0s) Subir documentos de identidad de Solicitante 3
📌 U3-04s 2026-06-26T04:22:16Z ✅ (7.0s) Esperar procesamiento de verificacion de Solicitante 3
U3-05 2026-06-26T04:22:16Z ✅ (0.0s) Verificar estado de verificacion de Solicitante 3 (debe ser aprobado)
U3-06 2026-06-26T04:22:16Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Solicitante 3
U4-03 2026-06-26T04:22:16Z ✅ (0.0s) Crear archivos dummy JPEG para Solicitante 4
U4-04 2026-06-26T04:22:16Z ✅ (0.0s) Subir documentos de identidad de Solicitante 4
📌 U4-04s 2026-06-26T04:22:23Z ✅ (7.0s) Esperar procesamiento de verificacion de Solicitante 4
U4-05 2026-06-26T04:22:23Z ✅ (0.0s) Verificar estado de verificacion de Solicitante 4 (debe ser aprobado)
U4-06 2026-06-26T04:22:23Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Solicitante 4
U5-03 2026-06-26T04:22:23Z ✅ (0.0s) Crear archivos dummy JPEG para Solicitante 5
U5-04 2026-06-26T04:22:23Z ✅ (0.0s) Subir documentos de identidad de Solicitante 5
📌 U5-04s 2026-06-26T04:22:30Z ✅ (7.0s) Esperar procesamiento de verificacion de Solicitante 5
U5-05 2026-06-26T04:22:30Z ✅ (0.0s) Verificar estado de verificacion de Solicitante 5 (debe ser aprobado)
U5-06 2026-06-26T04:22:30Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Solicitante 5
U6-03 2026-06-26T04:22:30Z ✅ (0.0s) Crear archivos dummy JPEG para Mandadero 1
U6-04 2026-06-26T04:22:30Z ✅ (0.0s) Subir documentos de identidad de Mandadero 1
📌 U6-04s 2026-06-26T04:22:37Z ✅ (7.0s) Esperar procesamiento de verificacion de Mandadero 1
U6-05 2026-06-26T04:22:37Z ✅ (0.0s) Verificar estado de verificacion de Mandadero 1 (debe ser aprobado)
U6-06 2026-06-26T04:22:37Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Mandadero 1
U7-03 2026-06-26T04:22:37Z ✅ (0.0s) Crear archivos dummy JPEG para Mandadero 2
U7-04 2026-06-26T04:22:37Z ✅ (0.0s) Subir documentos de identidad de Mandadero 2
📌 U7-04s 2026-06-26T04:22:44Z ✅ (7.0s) Esperar procesamiento de verificacion de Mandadero 2
U7-05 2026-06-26T04:22:44Z ✅ (0.0s) Verificar estado de verificacion de Mandadero 2 (debe ser aprobado)
U7-06 2026-06-26T04:22:45Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Mandadero 2
U8-03 2026-06-26T04:22:45Z ✅ (0.0s) Crear archivos dummy JPEG para Mandadero 3
U8-04 2026-06-26T04:22:45Z ✅ (0.0s) Subir documentos de identidad de Mandadero 3
📌 U8-04s 2026-06-26T04:22:52Z ✅ (7.0s) Esperar procesamiento de verificacion de Mandadero 3
U8-05 2026-06-26T04:22:52Z ✅ (0.0s) Verificar estado de verificacion de Mandadero 3 (debe ser aprobado)
U8-06 2026-06-26T04:22:52Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Mandadero 3
U9-03 2026-06-26T04:22:52Z ✅ (0.0s) Crear archivos dummy JPEG para Mandadero 4
U9-04 2026-06-26T04:22:52Z ✅ (0.0s) Subir documentos de identidad de Mandadero 4
📌 U9-04s 2026-06-26T04:22:59Z ✅ (7.0s) Esperar procesamiento de verificacion de Mandadero 4
U9-05 2026-06-26T04:22:59Z ✅ (0.0s) Verificar estado de verificacion de Mandadero 4 (debe ser aprobado)
U9-06 2026-06-26T04:22:59Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Mandadero 4
U10-03 2026-06-26T04:22:59Z ✅ (0.0s) Crear archivos dummy JPEG para Mandadero 5
U10-04 2026-06-26T04:22:59Z ✅ (0.1s) Subir documentos de identidad de Mandadero 5
📌 U10-04s 2026-06-26T04:23:06Z ✅ (7.0s) Esperar procesamiento de verificacion de Mandadero 5
U10-05 2026-06-26T04:23:06Z ✅ (0.0s) Verificar estado de verificacion de Mandadero 5 (debe ser aprobado)
U10-06 2026-06-26T04:23:06Z ✅ (0.1s) Refrescar token para actualizar estado de verificacion de Mandadero 5
M10-01 2026-06-26T04:23:06Z ✅ (0.0s) Crear mandado (Solicitante 1)
📌 M10-01s 2026-06-26T04:23:13Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M10-02 2026-06-26T04:23:13Z ✅ (0.1s) Listar mandados cercanos
M10-03 2026-06-26T04:23:13Z ✅ (0.0s) Ver detalle del mandado
📌 M10-01 2026-06-26T04:23:13Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M10-01s 2026-06-26T04:23:20Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M10-02 2026-06-26T04:23:20Z ✅ (0.0s) Solicitante lista ofertas
M10-03 2026-06-26T04:23:20Z ✅ (0.0s) Solicitante acepta la oferta
M10-01 2026-06-26T04:23:20Z ✅ (0.0s) Solicitante 1 envia mensaje en el canal
M10-02 2026-06-26T04:23:20Z ✅ (0.0s) Mandadero 1 lee los mensajes
M10-03 2026-06-26T04:23:20Z ✅ (0.0s) Mandadero 1 responde al mensaje
M10-04 2026-06-26T04:23:20Z ✅ (0.0s) Solicitante 1 lee ambos mensajes
M10-01 2026-06-26T04:23:20Z ✅ (0.0s) Solicitante completa el mandado
📌 M10-01s 2026-06-26T04:23:27Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M10-02 2026-06-26T04:23:27Z ✅ (0.0s) Solicitante califica al mandadero
M10-03 2026-06-26T04:23:27Z ✅ (0.0s) Mandadero califica al solicitante
M20-01 2026-06-26T04:23:27Z ✅ (0.0s) Crear mandado (Solicitante 1)
📌 M20-01s 2026-06-26T04:23:34Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M20-02 2026-06-26T04:23:34Z ✅ (0.0s) Listar mandados cercanos
M20-03 2026-06-26T04:23:34Z ✅ (0.0s) Ver detalle del mandado
📌 M20-01 2026-06-26T04:23:34Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M20-01s 2026-06-26T04:23:41Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M20-02 2026-06-26T04:23:41Z ✅ (0.0s) Solicitante lista ofertas
M20-03 2026-06-26T04:23:42Z ✅ (0.0s) Solicitante acepta la oferta
M20-01 2026-06-26T04:23:42Z ✅ (0.0s) Solicitante 1 envia mensaje en el canal
M20-02 2026-06-26T04:23:42Z ✅ (0.0s) Mandadero 1 lee los mensajes
M20-03 2026-06-26T04:23:42Z ✅ (0.0s) Mandadero 1 responde al mensaje
M20-04 2026-06-26T04:23:42Z ✅ (0.0s) Solicitante 1 lee ambos mensajes
M20-01 2026-06-26T04:23:42Z ✅ (0.0s) Solicitante completa el mandado
📌 M20-01s 2026-06-26T04:23:49Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M20-02 2026-06-26T04:23:49Z ✅ (0.1s) Solicitante califica al mandadero
M20-03 2026-06-26T04:23:49Z ✅ (0.0s) Mandadero califica al solicitante
M30-01 2026-06-26T04:23:49Z ✅ (0.0s) Crear mandado (Solicitante 1)
📌 M30-01s 2026-06-26T04:23:56Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M30-02 2026-06-26T04:23:56Z ✅ (0.0s) Listar mandados cercanos
M30-03 2026-06-26T04:23:56Z ✅ (0.0s) Ver detalle del mandado
📌 M30-01 2026-06-26T04:23:56Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M30-01s 2026-06-26T04:24:03Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M30-02 2026-06-26T04:24:03Z ✅ (0.0s) Solicitante lista ofertas
M30-03 2026-06-26T04:24:03Z ✅ (0.1s) Solicitante acepta la oferta
M30-01 2026-06-26T04:24:03Z ✅ (0.0s) Solicitante 1 envia mensaje en el canal
M30-02 2026-06-26T04:24:03Z ✅ (0.0s) Mandadero 1 lee los mensajes
M30-03 2026-06-26T04:24:03Z ✅ (0.0s) Mandadero 1 responde al mensaje
M30-04 2026-06-26T04:24:03Z ✅ (0.0s) Solicitante 1 lee ambos mensajes
M30-01 2026-06-26T04:24:03Z ✅ (0.0s) Solicitante completa el mandado
📌 M30-01s 2026-06-26T04:24:10Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M30-02 2026-06-26T04:24:10Z ✅ (0.0s) Solicitante califica al mandadero
M30-03 2026-06-26T04:24:10Z ✅ (0.0s) Mandadero califica al solicitante
M40-01 2026-06-26T04:24:10Z ✅ (0.0s) Crear mandado (Solicitante 1)
📌 M40-01s 2026-06-26T04:24:17Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M40-02 2026-06-26T04:24:17Z ✅ (0.0s) Listar mandados cercanos
M40-03 2026-06-26T04:24:17Z ✅ (0.0s) Ver detalle del mandado
📌 M40-01 2026-06-26T04:24:17Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M40-01s 2026-06-26T04:24:24Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M40-02 2026-06-26T04:24:24Z ✅ (0.0s) Solicitante lista ofertas
M40-03 2026-06-26T04:24:24Z ✅ (0.0s) Solicitante acepta la oferta
M40-01 2026-06-26T04:24:24Z ✅ (0.0s) Solicitante 1 envia mensaje en el canal
M40-02 2026-06-26T04:24:24Z ✅ (0.0s) Mandadero 1 lee los mensajes
M40-03 2026-06-26T04:24:24Z ✅ (0.0s) Mandadero 1 responde al mensaje
M40-04 2026-06-26T04:24:24Z ✅ (0.0s) Solicitante 1 lee ambos mensajes
M40-01 2026-06-26T04:24:24Z ✅ (0.0s) Solicitante completa el mandado
📌 M40-01s 2026-06-26T04:24:31Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M40-02 2026-06-26T04:24:31Z ✅ (0.0s) Solicitante califica al mandadero
M40-03 2026-06-26T04:24:31Z ✅ (0.0s) Mandadero califica al solicitante
M50-01 2026-06-26T04:24:31Z ✅ (0.0s) Crear mandado (Solicitante 1)
📌 M50-01s 2026-06-26T04:24:38Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M50-02 2026-06-26T04:24:38Z ✅ (0.0s) Listar mandados cercanos
M50-03 2026-06-26T04:24:38Z ✅ (0.0s) Ver detalle del mandado
📌 M50-01 2026-06-26T04:24:38Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M50-01s 2026-06-26T04:24:45Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M50-02 2026-06-26T04:24:46Z ✅ (0.0s) Solicitante lista ofertas
M50-03 2026-06-26T04:24:46Z ✅ (0.0s) Solicitante acepta la oferta
M50-01 2026-06-26T04:24:46Z ✅ (0.0s) Solicitante 1 envia mensaje en el canal
M50-02 2026-06-26T04:24:46Z ✅ (0.0s) Mandadero 1 lee los mensajes
M50-03 2026-06-26T04:24:46Z ✅ (0.0s) Mandadero 1 responde al mensaje
M50-04 2026-06-26T04:24:46Z ✅ (0.0s) Solicitante 1 lee ambos mensajes
M50-01 2026-06-26T04:24:46Z ✅ (0.0s) Solicitante completa el mandado
📌 M50-01s 2026-06-26T04:24:53Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M50-02 2026-06-26T04:24:53Z ✅ (0.0s) Solicitante califica al mandadero
M50-03 2026-06-26T04:24:53Z ✅ (0.0s) Mandadero califica al solicitante
M60-01 2026-06-26T04:24:53Z ✅ (0.0s) Crear mandado (Solicitante 2)
📌 M60-01s 2026-06-26T04:25:00Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M60-02 2026-06-26T04:25:00Z ✅ (0.0s) Listar mandados cercanos
M60-03 2026-06-26T04:25:00Z ✅ (0.0s) Ver detalle del mandado
📌 M60-01 2026-06-26T04:25:00Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M60-01s 2026-06-26T04:25:07Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M60-02 2026-06-26T04:25:07Z ✅ (0.0s) Solicitante lista ofertas
M60-03 2026-06-26T04:25:07Z ✅ (0.0s) Solicitante acepta la oferta
M60-01 2026-06-26T04:25:07Z ✅ (0.0s) Solicitante 2 envia mensaje en el canal
M60-02 2026-06-26T04:25:07Z ✅ (0.0s) Mandadero 1 lee los mensajes
M60-03 2026-06-26T04:25:07Z ✅ (0.0s) Mandadero 1 responde al mensaje
M60-04 2026-06-26T04:25:07Z ✅ (0.0s) Solicitante 2 lee ambos mensajes
M60-01 2026-06-26T04:25:07Z ✅ (0.0s) Solicitante completa el mandado
📌 M60-01s 2026-06-26T04:25:14Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M60-02 2026-06-26T04:25:14Z ✅ (0.1s) Solicitante califica al mandadero
M60-03 2026-06-26T04:25:14Z ✅ (0.0s) Mandadero califica al solicitante
M70-01 2026-06-26T04:25:14Z ✅ (0.0s) Crear mandado (Solicitante 2)
📌 M70-01s 2026-06-26T04:25:21Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M70-02 2026-06-26T04:25:21Z ✅ (0.0s) Listar mandados cercanos
M70-03 2026-06-26T04:25:21Z ✅ (0.0s) Ver detalle del mandado
📌 M70-01 2026-06-26T04:25:21Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M70-01s 2026-06-26T04:25:28Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M70-02 2026-06-26T04:25:28Z ✅ (0.0s) Solicitante lista ofertas
M70-03 2026-06-26T04:25:28Z ✅ (0.0s) Solicitante acepta la oferta
M70-01 2026-06-26T04:25:28Z ✅ (0.0s) Solicitante 2 envia mensaje en el canal
M70-02 2026-06-26T04:25:28Z ✅ (0.0s) Mandadero 1 lee los mensajes
M70-03 2026-06-26T04:25:28Z ✅ (0.0s) Mandadero 1 responde al mensaje
M70-04 2026-06-26T04:25:28Z ✅ (0.0s) Solicitante 2 lee ambos mensajes
M70-01 2026-06-26T04:25:28Z ✅ (0.0s) Solicitante completa el mandado
📌 M70-01s 2026-06-26T04:25:35Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M70-02 2026-06-26T04:25:35Z ✅ (0.0s) Solicitante califica al mandadero
M70-03 2026-06-26T04:25:35Z ✅ (0.0s) Mandadero califica al solicitante
M80-01 2026-06-26T04:25:35Z ✅ (0.0s) Crear mandado (Solicitante 2)
📌 M80-01s 2026-06-26T04:25:42Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M80-02 2026-06-26T04:25:42Z ✅ (0.0s) Listar mandados cercanos
M80-03 2026-06-26T04:25:42Z ✅ (0.0s) Ver detalle del mandado
📌 M80-01 2026-06-26T04:25:42Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M80-01s 2026-06-26T04:25:49Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M80-02 2026-06-26T04:25:49Z ✅ (0.0s) Solicitante lista ofertas
M80-03 2026-06-26T04:25:50Z ✅ (0.1s) Solicitante acepta la oferta
M80-01 2026-06-26T04:25:50Z ✅ (0.0s) Solicitante 2 envia mensaje en el canal
M80-02 2026-06-26T04:25:50Z ✅ (0.0s) Mandadero 1 lee los mensajes
M80-03 2026-06-26T04:25:50Z ✅ (0.0s) Mandadero 1 responde al mensaje
M80-04 2026-06-26T04:25:50Z ✅ (0.0s) Solicitante 2 lee ambos mensajes
M80-01 2026-06-26T04:25:50Z ✅ (0.0s) Solicitante completa el mandado
📌 M80-01s 2026-06-26T04:25:57Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M80-02 2026-06-26T04:25:57Z ✅ (0.0s) Solicitante califica al mandadero
M80-03 2026-06-26T04:25:57Z ✅ (0.0s) Mandadero califica al solicitante
M90-01 2026-06-26T04:25:57Z ✅ (0.0s) Crear mandado (Solicitante 2)
📌 M90-01s 2026-06-26T04:26:04Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M90-02 2026-06-26T04:26:04Z ✅ (0.0s) Listar mandados cercanos
M90-03 2026-06-26T04:26:04Z ✅ (0.0s) Ver detalle del mandado
📌 M90-01 2026-06-26T04:26:04Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M90-01s 2026-06-26T04:26:11Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M90-02 2026-06-26T04:26:11Z ✅ (0.0s) Solicitante lista ofertas
M90-03 2026-06-26T04:26:11Z ✅ (0.0s) Solicitante acepta la oferta
M90-01 2026-06-26T04:26:11Z ✅ (0.0s) Solicitante 2 envia mensaje en el canal
M90-02 2026-06-26T04:26:11Z ✅ (0.0s) Mandadero 1 lee los mensajes
M90-03 2026-06-26T04:26:11Z ✅ (0.0s) Mandadero 1 responde al mensaje
M90-04 2026-06-26T04:26:11Z ✅ (0.0s) Solicitante 2 lee ambos mensajes
M90-01 2026-06-26T04:26:11Z ✅ (0.0s) Solicitante completa el mandado
📌 M90-01s 2026-06-26T04:26:18Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M90-02 2026-06-26T04:26:18Z ✅ (0.1s) Solicitante califica al mandadero
M90-03 2026-06-26T04:26:18Z ✅ (0.0s) Mandadero califica al solicitante
M100-01 2026-06-26T04:26:18Z ✅ (0.0s) Crear mandado (Solicitante 2)
📌 M100-01s 2026-06-26T04:26:25Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M100-02 2026-06-26T04:26:25Z ✅ (0.0s) Listar mandados cercanos
M100-03 2026-06-26T04:26:25Z ✅ (0.0s) Ver detalle del mandado
📌 M100-01 2026-06-26T04:26:25Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M100-01s 2026-06-26T04:26:32Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M100-02 2026-06-26T04:26:32Z ✅ (0.0s) Solicitante lista ofertas
M100-03 2026-06-26T04:26:32Z ✅ (0.0s) Solicitante acepta la oferta
M100-01 2026-06-26T04:26:32Z ✅ (0.0s) Solicitante 2 envia mensaje en el canal
M100-02 2026-06-26T04:26:32Z ✅ (0.0s) Mandadero 1 lee los mensajes
M100-03 2026-06-26T04:26:32Z ✅ (0.0s) Mandadero 1 responde al mensaje
M100-04 2026-06-26T04:26:32Z ✅ (0.0s) Solicitante 2 lee ambos mensajes
M100-01 2026-06-26T04:26:32Z ✅ (0.0s) Solicitante completa el mandado
📌 M100-01s 2026-06-26T04:26:39Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M100-02 2026-06-26T04:26:39Z ✅ (0.0s) Solicitante califica al mandadero
M100-03 2026-06-26T04:26:39Z ✅ (0.0s) Mandadero califica al solicitante
M110-01 2026-06-26T04:26:39Z ✅ (0.0s) Crear mandado (Solicitante 3)
📌 M110-01s 2026-06-26T04:26:46Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M110-02 2026-06-26T04:26:46Z ✅ (0.0s) Listar mandados cercanos
M110-03 2026-06-26T04:26:46Z ✅ (0.0s) Ver detalle del mandado
📌 M110-01 2026-06-26T04:26:46Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M110-01s 2026-06-26T04:26:53Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M110-02 2026-06-26T04:26:53Z ✅ (0.0s) Solicitante lista ofertas
M110-03 2026-06-26T04:26:53Z ✅ (0.0s) Solicitante acepta la oferta
M110-01 2026-06-26T04:26:53Z ✅ (0.0s) Solicitante 3 envia mensaje en el canal
M110-02 2026-06-26T04:26:54Z ✅ (0.0s) Mandadero 1 lee los mensajes
M110-03 2026-06-26T04:26:54Z ✅ (0.0s) Mandadero 1 responde al mensaje
M110-04 2026-06-26T04:26:54Z ✅ (0.0s) Solicitante 3 lee ambos mensajes
M110-01 2026-06-26T04:26:54Z ✅ (0.0s) Solicitante completa el mandado
📌 M110-01s 2026-06-26T04:27:01Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M110-02 2026-06-26T04:27:01Z ✅ (0.0s) Solicitante califica al mandadero
M110-03 2026-06-26T04:27:01Z ✅ (0.0s) Mandadero califica al solicitante
M120-01 2026-06-26T04:27:01Z ✅ (0.0s) Crear mandado (Solicitante 3)
📌 M120-01s 2026-06-26T04:27:08Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M120-02 2026-06-26T04:27:08Z ✅ (0.0s) Listar mandados cercanos
M120-03 2026-06-26T04:27:08Z ✅ (0.0s) Ver detalle del mandado
📌 M120-01 2026-06-26T04:27:08Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M120-01s 2026-06-26T04:27:15Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M120-02 2026-06-26T04:27:15Z ✅ (0.0s) Solicitante lista ofertas
M120-03 2026-06-26T04:27:15Z ✅ (0.0s) Solicitante acepta la oferta
M120-01 2026-06-26T04:27:15Z ✅ (0.0s) Solicitante 3 envia mensaje en el canal
M120-02 2026-06-26T04:27:15Z ✅ (0.0s) Mandadero 1 lee los mensajes
M120-03 2026-06-26T04:27:15Z ✅ (0.0s) Mandadero 1 responde al mensaje
M120-04 2026-06-26T04:27:15Z ✅ (0.0s) Solicitante 3 lee ambos mensajes
M120-01 2026-06-26T04:27:15Z ✅ (0.0s) Solicitante completa el mandado
📌 M120-01s 2026-06-26T04:27:22Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M120-02 2026-06-26T04:27:22Z ✅ (0.0s) Solicitante califica al mandadero
M120-03 2026-06-26T04:27:22Z ✅ (0.0s) Mandadero califica al solicitante
M130-01 2026-06-26T04:27:22Z ✅ (0.0s) Crear mandado (Solicitante 3)
📌 M130-01s 2026-06-26T04:27:29Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M130-02 2026-06-26T04:27:29Z ✅ (0.0s) Listar mandados cercanos
M130-03 2026-06-26T04:27:29Z ✅ (0.0s) Ver detalle del mandado
📌 M130-01 2026-06-26T04:27:29Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M130-01s 2026-06-26T04:27:36Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M130-02 2026-06-26T04:27:36Z ✅ (0.0s) Solicitante lista ofertas
M130-03 2026-06-26T04:27:36Z ✅ (0.0s) Solicitante acepta la oferta
M130-01 2026-06-26T04:27:36Z ✅ (0.0s) Solicitante 3 envia mensaje en el canal
M130-02 2026-06-26T04:27:36Z ✅ (0.0s) Mandadero 1 lee los mensajes
M130-03 2026-06-26T04:27:36Z ✅ (0.0s) Mandadero 1 responde al mensaje
M130-04 2026-06-26T04:27:36Z ✅ (0.0s) Solicitante 3 lee ambos mensajes
M130-01 2026-06-26T04:27:36Z ✅ (0.0s) Solicitante completa el mandado
📌 M130-01s 2026-06-26T04:27:43Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M130-02 2026-06-26T04:27:43Z ✅ (0.0s) Solicitante califica al mandadero
M130-03 2026-06-26T04:27:43Z ✅ (0.0s) Mandadero califica al solicitante
M140-01 2026-06-26T04:27:43Z ✅ (0.0s) Crear mandado (Solicitante 3)
📌 M140-01s 2026-06-26T04:27:50Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M140-02 2026-06-26T04:27:50Z ✅ (0.0s) Listar mandados cercanos
M140-03 2026-06-26T04:27:50Z ✅ (0.0s) Ver detalle del mandado
📌 M140-01 2026-06-26T04:27:50Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M140-01s 2026-06-26T04:27:57Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M140-02 2026-06-26T04:27:57Z ✅ (0.0s) Solicitante lista ofertas
M140-03 2026-06-26T04:27:57Z ✅ (0.0s) Solicitante acepta la oferta
M140-01 2026-06-26T04:27:57Z ✅ (0.0s) Solicitante 3 envia mensaje en el canal
M140-02 2026-06-26T04:27:57Z ✅ (0.0s) Mandadero 1 lee los mensajes
M140-03 2026-06-26T04:27:57Z ✅ (0.0s) Mandadero 1 responde al mensaje
M140-04 2026-06-26T04:27:57Z ✅ (0.0s) Solicitante 3 lee ambos mensajes
M140-01 2026-06-26T04:27:57Z ✅ (0.0s) Solicitante completa el mandado
📌 M140-01s 2026-06-26T04:28:04Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M140-02 2026-06-26T04:28:05Z ✅ (0.1s) Solicitante califica al mandadero
M140-03 2026-06-26T04:28:05Z ✅ (0.0s) Mandadero califica al solicitante
M150-01 2026-06-26T04:28:05Z ✅ (0.0s) Crear mandado (Solicitante 3)
📌 M150-01s 2026-06-26T04:28:12Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M150-02 2026-06-26T04:28:12Z ✅ (0.0s) Listar mandados cercanos
M150-03 2026-06-26T04:28:12Z ✅ (0.0s) Ver detalle del mandado
📌 M150-01 2026-06-26T04:28:12Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M150-01s 2026-06-26T04:28:19Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M150-02 2026-06-26T04:28:19Z ✅ (0.0s) Solicitante lista ofertas
M150-03 2026-06-26T04:28:19Z ✅ (0.1s) Solicitante acepta la oferta
M150-01 2026-06-26T04:28:19Z ✅ (0.0s) Solicitante 3 envia mensaje en el canal
M150-02 2026-06-26T04:28:19Z ✅ (0.0s) Mandadero 1 lee los mensajes
M150-03 2026-06-26T04:28:19Z ✅ (0.0s) Mandadero 1 responde al mensaje
M150-04 2026-06-26T04:28:19Z ✅ (0.0s) Solicitante 3 lee ambos mensajes
M150-01 2026-06-26T04:28:19Z ✅ (0.0s) Solicitante completa el mandado
📌 M150-01s 2026-06-26T04:28:26Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M150-02 2026-06-26T04:28:26Z ✅ (0.1s) Solicitante califica al mandadero
M150-03 2026-06-26T04:28:26Z ✅ (0.0s) Mandadero califica al solicitante
M160-01 2026-06-26T04:28:26Z ✅ (0.0s) Crear mandado (Solicitante 4)
📌 M160-01s 2026-06-26T04:28:33Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M160-02 2026-06-26T04:28:33Z ✅ (0.0s) Listar mandados cercanos
M160-03 2026-06-26T04:28:33Z ✅ (0.0s) Ver detalle del mandado
📌 M160-01 2026-06-26T04:28:33Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M160-01s 2026-06-26T04:28:40Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M160-02 2026-06-26T04:28:40Z ✅ (0.0s) Solicitante lista ofertas
M160-03 2026-06-26T04:28:40Z ✅ (0.1s) Solicitante acepta la oferta
M160-01 2026-06-26T04:28:40Z ✅ (0.0s) Solicitante 4 envia mensaje en el canal
M160-02 2026-06-26T04:28:40Z ✅ (0.0s) Mandadero 1 lee los mensajes
M160-03 2026-06-26T04:28:40Z ✅ (0.0s) Mandadero 1 responde al mensaje
M160-04 2026-06-26T04:28:40Z ✅ (0.0s) Solicitante 4 lee ambos mensajes
M160-01 2026-06-26T04:28:40Z ✅ (0.0s) Solicitante completa el mandado
📌 M160-01s 2026-06-26T04:28:47Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M160-02 2026-06-26T04:28:47Z ✅ (0.1s) Solicitante califica al mandadero
M160-03 2026-06-26T04:28:47Z ✅ (0.0s) Mandadero califica al solicitante
M170-01 2026-06-26T04:28:47Z ✅ (0.0s) Crear mandado (Solicitante 4)
📌 M170-01s 2026-06-26T04:28:54Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M170-02 2026-06-26T04:28:54Z ✅ (0.0s) Listar mandados cercanos
M170-03 2026-06-26T04:28:54Z ✅ (0.0s) Ver detalle del mandado
📌 M170-01 2026-06-26T04:28:54Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M170-01s 2026-06-26T04:29:01Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M170-02 2026-06-26T04:29:01Z ✅ (0.0s) Solicitante lista ofertas
M170-03 2026-06-26T04:29:01Z ✅ (0.1s) Solicitante acepta la oferta
M170-01 2026-06-26T04:29:01Z ✅ (0.0s) Solicitante 4 envia mensaje en el canal
M170-02 2026-06-26T04:29:02Z ✅ (0.0s) Mandadero 1 lee los mensajes
M170-03 2026-06-26T04:29:02Z ✅ (0.0s) Mandadero 1 responde al mensaje
M170-04 2026-06-26T04:29:02Z ✅ (0.0s) Solicitante 4 lee ambos mensajes
M170-01 2026-06-26T04:29:02Z ✅ (0.0s) Solicitante completa el mandado
📌 M170-01s 2026-06-26T04:29:09Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M170-02 2026-06-26T04:29:09Z ✅ (0.1s) Solicitante califica al mandadero
M170-03 2026-06-26T04:29:09Z ✅ (0.0s) Mandadero califica al solicitante
M180-01 2026-06-26T04:29:09Z ✅ (0.0s) Crear mandado (Solicitante 4)
📌 M180-01s 2026-06-26T04:29:16Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M180-02 2026-06-26T04:29:16Z ✅ (0.0s) Listar mandados cercanos
M180-03 2026-06-26T04:29:16Z ✅ (0.0s) Ver detalle del mandado
📌 M180-01 2026-06-26T04:29:16Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M180-01s 2026-06-26T04:29:23Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M180-02 2026-06-26T04:29:23Z ✅ (0.0s) Solicitante lista ofertas
M180-03 2026-06-26T04:29:23Z ✅ (0.1s) Solicitante acepta la oferta
M180-01 2026-06-26T04:29:23Z ✅ (0.0s) Solicitante 4 envia mensaje en el canal
M180-02 2026-06-26T04:29:23Z ✅ (0.0s) Mandadero 1 lee los mensajes
M180-03 2026-06-26T04:29:23Z ✅ (0.0s) Mandadero 1 responde al mensaje
M180-04 2026-06-26T04:29:23Z ✅ (0.0s) Solicitante 4 lee ambos mensajes
M180-01 2026-06-26T04:29:23Z ✅ (0.0s) Solicitante completa el mandado
📌 M180-01s 2026-06-26T04:29:30Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M180-02 2026-06-26T04:29:30Z ✅ (0.1s) Solicitante califica al mandadero
M180-03 2026-06-26T04:29:30Z ✅ (0.0s) Mandadero califica al solicitante
M190-01 2026-06-26T04:29:30Z ✅ (0.0s) Crear mandado (Solicitante 4)
📌 M190-01s 2026-06-26T04:29:37Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M190-02 2026-06-26T04:29:37Z ✅ (0.0s) Listar mandados cercanos
M190-03 2026-06-26T04:29:37Z ✅ (0.0s) Ver detalle del mandado
📌 M190-01 2026-06-26T04:29:37Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M190-01s 2026-06-26T04:29:44Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M190-02 2026-06-26T04:29:44Z ✅ (0.0s) Solicitante lista ofertas
M190-03 2026-06-26T04:29:44Z ✅ (0.0s) Solicitante acepta la oferta
M190-01 2026-06-26T04:29:44Z ✅ (0.0s) Solicitante 4 envia mensaje en el canal
M190-02 2026-06-26T04:29:44Z ✅ (0.0s) Mandadero 1 lee los mensajes
M190-03 2026-06-26T04:29:44Z ✅ (0.0s) Mandadero 1 responde al mensaje
M190-04 2026-06-26T04:29:44Z ✅ (0.0s) Solicitante 4 lee ambos mensajes
M190-01 2026-06-26T04:29:44Z ✅ (0.0s) Solicitante completa el mandado
📌 M190-01s 2026-06-26T04:29:51Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M190-02 2026-06-26T04:29:51Z ✅ (0.0s) Solicitante califica al mandadero
M190-03 2026-06-26T04:29:51Z ✅ (0.0s) Mandadero califica al solicitante
M200-01 2026-06-26T04:29:51Z ✅ (0.0s) Crear mandado (Solicitante 4)
📌 M200-01s 2026-06-26T04:29:58Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M200-02 2026-06-26T04:29:58Z ✅ (0.0s) Listar mandados cercanos
M200-03 2026-06-26T04:29:58Z ✅ (0.0s) Ver detalle del mandado
📌 M200-01 2026-06-26T04:29:58Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M200-01s 2026-06-26T04:30:05Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M200-02 2026-06-26T04:30:05Z ✅ (0.0s) Solicitante lista ofertas
M200-03 2026-06-26T04:30:06Z ✅ (0.1s) Solicitante acepta la oferta
M200-01 2026-06-26T04:30:06Z ✅ (0.0s) Solicitante 4 envia mensaje en el canal
M200-02 2026-06-26T04:30:06Z ✅ (0.0s) Mandadero 1 lee los mensajes
M200-03 2026-06-26T04:30:06Z ✅ (0.0s) Mandadero 1 responde al mensaje
M200-04 2026-06-26T04:30:06Z ✅ (0.0s) Solicitante 4 lee ambos mensajes
M200-01 2026-06-26T04:30:06Z ✅ (0.0s) Solicitante completa el mandado
📌 M200-01s 2026-06-26T04:30:13Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M200-02 2026-06-26T04:30:13Z ✅ (0.1s) Solicitante califica al mandadero
M200-03 2026-06-26T04:30:13Z ✅ (0.0s) Mandadero califica al solicitante
M210-01 2026-06-26T04:30:13Z ✅ (0.0s) Crear mandado (Solicitante 5)
📌 M210-01s 2026-06-26T04:30:20Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M210-02 2026-06-26T04:30:20Z ✅ (0.0s) Listar mandados cercanos
M210-03 2026-06-26T04:30:20Z ✅ (0.0s) Ver detalle del mandado
📌 M210-01 2026-06-26T04:30:20Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M210-01s 2026-06-26T04:30:27Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M210-02 2026-06-26T04:30:27Z ✅ (0.0s) Solicitante lista ofertas
M210-03 2026-06-26T04:30:27Z ✅ (0.1s) Solicitante acepta la oferta
M210-01 2026-06-26T04:30:27Z ✅ (0.0s) Solicitante 5 envia mensaje en el canal
M210-02 2026-06-26T04:30:27Z ✅ (0.0s) Mandadero 1 lee los mensajes
M210-03 2026-06-26T04:30:27Z ✅ (0.0s) Mandadero 1 responde al mensaje
M210-04 2026-06-26T04:30:27Z ✅ (0.0s) Solicitante 5 lee ambos mensajes
M210-01 2026-06-26T04:30:27Z ✅ (0.0s) Solicitante completa el mandado
📌 M210-01s 2026-06-26T04:30:34Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M210-02 2026-06-26T04:30:34Z ✅ (0.0s) Solicitante califica al mandadero
M210-03 2026-06-26T04:30:34Z ✅ (0.0s) Mandadero califica al solicitante
M220-01 2026-06-26T04:30:34Z ✅ (0.0s) Crear mandado (Solicitante 5)
📌 M220-01s 2026-06-26T04:30:41Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M220-02 2026-06-26T04:30:41Z ✅ (0.0s) Listar mandados cercanos
M220-03 2026-06-26T04:30:41Z ✅ (0.0s) Ver detalle del mandado
📌 M220-01 2026-06-26T04:30:41Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M220-01s 2026-06-26T04:30:48Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M220-02 2026-06-26T04:30:48Z ✅ (0.0s) Solicitante lista ofertas
M220-03 2026-06-26T04:30:48Z ✅ (0.1s) Solicitante acepta la oferta
M220-01 2026-06-26T04:30:48Z ✅ (0.0s) Solicitante 5 envia mensaje en el canal
M220-02 2026-06-26T04:30:48Z ✅ (0.0s) Mandadero 1 lee los mensajes
M220-03 2026-06-26T04:30:48Z ✅ (0.0s) Mandadero 1 responde al mensaje
M220-04 2026-06-26T04:30:48Z ✅ (0.0s) Solicitante 5 lee ambos mensajes
M220-01 2026-06-26T04:30:48Z ✅ (0.0s) Solicitante completa el mandado
📌 M220-01s 2026-06-26T04:30:55Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M220-02 2026-06-26T04:30:55Z ✅ (0.0s) Solicitante califica al mandadero
M220-03 2026-06-26T04:30:55Z ✅ (0.0s) Mandadero califica al solicitante
M230-01 2026-06-26T04:30:55Z ✅ (0.0s) Crear mandado (Solicitante 5)
📌 M230-01s 2026-06-26T04:31:02Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M230-02 2026-06-26T04:31:02Z ✅ (0.0s) Listar mandados cercanos
M230-03 2026-06-26T04:31:02Z ✅ (0.0s) Ver detalle del mandado
📌 M230-01 2026-06-26T04:31:03Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M230-01s 2026-06-26T04:31:10Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M230-02 2026-06-26T04:31:10Z ✅ (0.0s) Solicitante lista ofertas
M230-03 2026-06-26T04:31:10Z ✅ (0.1s) Solicitante acepta la oferta
M230-01 2026-06-26T04:31:10Z ✅ (0.0s) Solicitante 5 envia mensaje en el canal
M230-02 2026-06-26T04:31:10Z ✅ (0.0s) Mandadero 1 lee los mensajes
M230-03 2026-06-26T04:31:10Z ✅ (0.0s) Mandadero 1 responde al mensaje
M230-04 2026-06-26T04:31:10Z ✅ (0.0s) Solicitante 5 lee ambos mensajes
M230-01 2026-06-26T04:31:10Z ✅ (0.0s) Solicitante completa el mandado
📌 M230-01s 2026-06-26T04:31:17Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M230-02 2026-06-26T04:31:17Z ✅ (0.0s) Solicitante califica al mandadero
M230-03 2026-06-26T04:31:17Z ✅ (0.0s) Mandadero califica al solicitante
M240-01 2026-06-26T04:31:17Z ✅ (0.0s) Crear mandado (Solicitante 5)
📌 M240-01s 2026-06-26T04:31:24Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M240-02 2026-06-26T04:31:24Z ✅ (0.0s) Listar mandados cercanos
M240-03 2026-06-26T04:31:24Z ✅ (0.0s) Ver detalle del mandado
📌 M240-01 2026-06-26T04:31:24Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M240-01s 2026-06-26T04:31:31Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M240-02 2026-06-26T04:31:31Z ✅ (0.0s) Solicitante lista ofertas
M240-03 2026-06-26T04:31:31Z ✅ (0.0s) Solicitante acepta la oferta
M240-01 2026-06-26T04:31:31Z ✅ (0.0s) Solicitante 5 envia mensaje en el canal
M240-02 2026-06-26T04:31:31Z ✅ (0.0s) Mandadero 1 lee los mensajes
M240-03 2026-06-26T04:31:31Z ✅ (0.0s) Mandadero 1 responde al mensaje
M240-04 2026-06-26T04:31:31Z ✅ (0.0s) Solicitante 5 lee ambos mensajes
M240-01 2026-06-26T04:31:31Z ✅ (0.0s) Solicitante completa el mandado
📌 M240-01s 2026-06-26T04:31:38Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M240-02 2026-06-26T04:31:38Z ✅ (0.0s) Solicitante califica al mandadero
M240-03 2026-06-26T04:31:38Z ✅ (0.0s) Mandadero califica al solicitante
M250-01 2026-06-26T04:31:38Z ✅ (0.0s) Crear mandado (Solicitante 5)
📌 M250-01s 2026-06-26T04:31:45Z ✅ (7.0s) Esperar propagacion de BD tras crear mandado
M250-02 2026-06-26T04:31:45Z ✅ (0.0s) Listar mandados cercanos
M250-03 2026-06-26T04:31:45Z ✅ (0.0s) Ver detalle del mandado
📌 M250-01 2026-06-26T04:31:45Z ✅ (0.0s) Mandadero envia oferta al mandado
📌 M250-01s 2026-06-26T04:31:52Z ✅ (7.0s) Esperar propagacion de BD tras crear oferta
M250-02 2026-06-26T04:31:52Z ✅ (0.0s) Solicitante lista ofertas
M250-03 2026-06-26T04:31:52Z ✅ (0.0s) Solicitante acepta la oferta
M250-01 2026-06-26T04:31:52Z ✅ (0.0s) Solicitante 5 envia mensaje en el canal
M250-02 2026-06-26T04:31:52Z ✅ (0.0s) Mandadero 1 lee los mensajes
M250-03 2026-06-26T04:31:52Z ✅ (0.0s) Mandadero 1 responde al mensaje
M250-04 2026-06-26T04:31:52Z ✅ (0.0s) Solicitante 5 lee ambos mensajes
M250-01 2026-06-26T04:31:52Z ✅ (0.0s) Solicitante completa el mandado
📌 M250-01s 2026-06-26T04:31:59Z ✅ (7.0s) Esperar propagacion de BD tras completar mandado
M250-02 2026-06-26T04:31:59Z ✅ (0.0s) Solicitante califica al mandadero
M250-03 2026-06-26T04:31:59Z ✅ (0.0s) Mandadero califica al solicitante
D01-01 2026-06-26T04:31:59Z ✅ (0.0s) Solicitante denuncia al mandadero por acoso
D01-02 2026-06-26T04:31:59Z ✅ (0.0s) Intentar auto-denuncia (400)
E01-01 2026-06-26T04:31:59Z ✅ (0.0s) Error - OTP invalido (401)
E01-02 2026-06-26T04:31:59Z ✅ (0.0s) Error - mandado con datos invalidos (422)
E01-03 2026-06-26T04:31:59Z ✅ (0.0s) Error - auto-denuncia (400)
C01-01 2026-06-26T04:32:00Z ✅ (0.1s) Refrescar token de acceso (rota el refresh token)
C01-02 2026-06-26T04:32:00Z ✅ (0.0s) Cerrar sesion (logout) con el nuevo refresh token
C01-03 2026-06-26T04:32:00Z ✅ (0.0s) Eliminar cuenta del solicitante
C01-04 2026-06-26T04:32:00Z ✅ (0.0s) Verificar que el usuario ya no existe (401)

### Resumen final

**Estado:** ✅ Completado — 481/481 pasos exitosos
**Fallidos:** 0  **Saltados:** 0

