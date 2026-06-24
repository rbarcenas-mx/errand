# Guía de Validación Rápida — Mandadero MVP

## Prerrequisitos

- Node.js >= 18
- PostgreSQL >= 14 con PostGIS
- Cuenta de Twilio (SMS/WhatsApp)
- Cuenta de Cloudinary (almacenamiento de imágenes)

## Setup del Proyecto

```bash
# Clonar e instalar
git clone <repo-url>
cd errand
npm install

# Configurar variables de entorno
cp .env.example .env
```

### Variables de entorno requeridas (`.env`)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/mandadero
TWILIO_ACCOUNT_SID=tu_sid
TWILIO_AUTH_TOKEN=tu_token
TWILIO_PHONE_NUMBER=+52XXXX
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret
JWT_SECRET=clave_secreta_para_jwt
PORT=3000
ALLOW_TEST_OTP=true
```

```bash
# Ejecutar migraciones de base de datos
npm run db:migrate

# Sembrar datos de prueba (opcional)
npm run db:seed

# Iniciar servidor de desarrollo
npm run dev
```

## Escenarios de Validación

### Escenario 1: Registro y verificación de identidad

```bash
# 1. Registrar nuevo usuario
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre_completo": "Juan Pérez", "telefono": "+524421234567", "correo_electronico": "juan@ejemplo.com"}'

# Salida esperada: 201, mensaje OTP enviado

# 2. Verificar OTP (revisar logs del servidor para código)
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"telefono": "+524421234567", "codigo": "123456"}'

# Salida esperada: 200, token JWT + datos de usuario
# Nota: El código "123456" funciona solo si ALLOW_TEST_OTP=true en .env

# 3. Subir documentos de identidad (usando el token obtenido)
curl -X POST http://localhost:3000/api/v1/auth/verify-identity \
  -H "Authorization: Bearer <token>" \
  -F "foto_ine=@/ruta/a/ine.jpg" \
  -F "foto_vivo=@/ruta/a/selfie.jpg"

# Salida esperada: 200, estado "pendiente"
```

**Resultado esperado**: Usuario registrado, OTP validado, documentos subidos.

---

### Escenario 2: Publicar mandado y recibir ofertas

```bash
# 1. Solicitante autenticado publica un mandado
curl -X POST http://localhost:3000/api/v1/mandados \
  -H "Authorization: Bearer <token_solicitante>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Comprar tortillas",
    "descripcion": "1kg tortillas + 500g frijoles + 1L leche",
    "tipo": "compra",
    "ubicacion_recogida": {
      "lat": 20.588,
      "lng": -100.389,
      "direccion": "Av. Principal 123, Centro"
    },
    "ubicacion_entrega": {
      "lat": 20.590,
      "lng": -100.392,
      "direccion": "Calle Secundaria 456, Centro"
    },
    "fecha_hora_limite": "2026-06-20T18:00:00Z"
  }'

# Salida esperada: 201, mandado creado con estado "publicado"

# 2. Mandadero autenticado ve mandados cercanos
curl -X GET "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389&radio_km=5" \
  -H "Authorization: Bearer <token_mandadero>"

# Salida esperada: 200, lista con el mandado recién creado

# 3. Mandadero envía una oferta
curl -X POST http://localhost:3000/api/v1/mandados/<mandado_id>/ofertas \
  -H "Authorization: Bearer <token_mandadero>" \
  -H "Content-Type: application/json" \
  -d '{"monto_ofertado": 50.00}'

# Salida esperada: 201, oferta creada con estado "pendiente"

# 4. Solicitante ve las ofertas recibidas
curl -X GET http://localhost:3000/api/v1/mandados/<mandado_id>/ofertas \
  -H "Authorization: Bearer <token_solicitante>"

# Salida esperada: 200, lista con la oferta del mandadero

# 5. Solicitante acepta la oferta
curl -X PATCH http://localhost:3000/api/v1/ofertas/<oferta_id> \
  -H "Authorization: Bearer <token_solicitante>" \
  -H "Content-Type: application/json" \
  -d '{"accion": "aceptada"}'

# Salida esperada: 200, contacto del mandadero revelado
```

**Resultado esperado**: Mandado creado, oferta enviada y aceptada, contacto revelado sin costo.

---

### Escenario 3: Finalización y calificación

```bash
# 1. Solicitante confirma recepción (completa el mandado)
curl -X PATCH http://localhost:3000/api/v1/mandados/<mandado_id>/estado \
  -H "Authorization: Bearer <token_solicitante>" \
  -H "Content-Type: application/json" \
  -d '{"estado": "completado"}'

# Salida esperada: 200, estado "completado"

# 2. Solicitante califica al mandadero
curl -X POST http://localhost:3000/api/v1/calificaciones \
  -H "Authorization: Bearer <token_solicitante>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_mandado": "<mandado_id>",
    "id_calificado": "<mandadero_id>",
    "puntuacion": 5,
    "comentario": "Excelente servicio"
  }'

# Salida esperada: 201

# 3. Mandadero califica al solicitante
curl -X POST http://localhost:3000/api/v1/calificaciones \
  -H "Authorization: Bearer <token_mandadero>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_mandado": "<mandado_id>",
    "id_calificado": "<solicitante_id>",
    "puntuacion": 5
  }'

# Salida esperada: 201
```

**Resultado esperado**: Mandado completado, ambas partes calificadas.

---

### Escenario 4: Verificación fallida (caso de borde)

```bash
# 1. Registrar y autenticar como en Escenario 1
# 2. Subir documentos inválidos (INE borroso)
curl -X POST http://localhost:3000/api/v1/auth/verify-identity \
  -H "Authorization: Bearer <token>" \
  -F "foto_ine=@/ruta/a/ine_borrosa.jpg" \
  -F "foto_vivo=@/ruta/a/selfie.jpg"

# Salida esperada: 200, estado "rechazado"

# 3. Verificar que el usuario puede ver mandados pero no ofertar
curl -X GET "http://localhost:3000/api/v1/mandados?lat=20.588&lng=-100.389" \
  -H "Authorization: Bearer <token>"

# Salida esperada: 200, lista de mandados visible

curl -X POST http://localhost:3000/api/v1/mandados/<mandado_id>/ofertas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"monto_ofertado": 50.00}'

# Salida esperada: 403, error "Verificación de identidad requerida"
```

**Resultado esperado**: Documentos rechazados, usuario puede ver pero no ofertar.

## Referencias

- [Modelo de datos](../data-model.md)
- [Contratos de API](../contracts/api.md)
