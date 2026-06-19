# Pre-Especificación: Mandadero - Conectando Servicios Locales

## 1. Resumen de la Idea
Mandadero es una aplicación que conecta a personas que necesitan realizar mandados o servicios con otros usuarios dispuestos a ejecutarlos. El problema resuelto es la falta de tiempo para realizar tareas diarias, como compras o servicios técnicos, facilitando la conexión entre demandantes y proveedores en Querétaro y su área metropolitana.

## 2. Ambigüedades Detectadas
1. **Definición de "mandado"**  
   - Interpretaciones: Puede incluir solo compras o también servicios técnicos como reparaciones.  
   - Impacto: Afecta la funcionalidad y el modelo de datos necesarios.  
   - **Decisión tomada**: Enfoque logístico/compras (Opción A). Solo traslados físicos y compras en el MVP.

2. **Proceso de ofertas**  
   - Interpretaciones: Ofertas abiertas (usuarios ven todas) vs cerradas (usuario selecciona a quién).  
   - Impacto: Influencia en la UX y complejidad del sistema.

3. **Reputación de usuarios**  
   - Interpretaciones: Sistema de calificaciones simple o con más parámetros.  
   - Impacto: Afecta la confianza entre usuarios y el diseño del sistema de evaluaciones.

## 3. Contradicciones Lógicas
No se detectaron contradicciones lógicas evidentes, ya que los requisitos parecen coherentes.

## 4. Piezas Faltantes del Alcance
- **Autenticación**: Requiere al menos teléfono validado. Decisión tomada: Verificación extendida con identificación oficial (Opción B).
- **Persistencia y modelo de datos**: Necesario para almacenar mandados, ofertas, usuarios y calificaciones.
- **Integraciones externas**: Mapas (ubicaciones), SMS/WhatsApp (notificaciones).
- **Manejo de errores**: Casos como fallas en notificaciones o coincidencias geográficas.
- **Infraestructura y despliegue**: Escalabilidad para crecimiento futuro.
- **Seguridad**: Protección de datos personales, especialmente teléfonos e identificación oficial.
- **Rendimiento**: Velocidad en búsquedas y notificaciones.
- **Modelo de monetización**: Tarifa por contacto/lead (Opción C) — se cobra al mandadero por desbloquear los datos de contacto del solicitante tras aceptar una oferta.
- **UX**: Diseño intuitivo para publicar mandados y recibir ofertas.

## 5. Preguntas Hiper-Críticas para el MVP
1. ¿La app manejará directamente las transacciones monetarias o solo actuará como intermediaria?  
   - A: Manejar dinero (riesgo financiero, pero mayor engagement).  
   - B: Solo conectar usuarios (menos riesgo, pero posible incumplimiento de pagos).  
   - Recomendación: Iniciar sin manejar dinero para reducir riesgos.

2. ¿Cómo se medirá la reputación de los usuarios?  
   - A: Calificaciones binarias (bueno/malo).  
   - B: Escala numérica con comentarios.  
   - C: Sistema mixto con verificación social.  
   - Recomendación: Empezar con calificaciones sencillas y expandir.

3. ¿Se limitará el MVP a ciertos tipos de servicios o será genérico?  
   - A: Permitir todos los servicios (mayor alcance inicial).  
   - B: Limitar a compras básicas (menos riesgo, pero menor valor).  
   - Recomendación: Ser genérico para capturar variedad de necesidades.

## 6. Pre-Especificación Base del MVP
- **Objetivo principal**: Conectar usuarios que necesitan servicios con proveedores locales en Querétaro.
- **Usuarios objetivo**: Personas ocupadas en Querétaro y área metropolitana buscando ahorrar tiempo.
- **Funcionalidades núcleo del MVP**:
  1. Publicación de mandados con ubicaciones, fecha/hora y detalles.
  2. Ofertas de usuarios con precio y reputación visible.
  3. Sistema básico de calificaciones post-transacción.
  4. Notificaciones via SMS/WhatsApp para interacciones clave.
  5. Verificación de identidad con INE/identificación oficial.
- **Explícitamente FUERA del MVP**: Manejo directo de dinero, expansión a otras ciudades, sistema avanzado de reputación, servicios profesionales/técnicos (reparaciones, instalaciones).
- **Stack técnico asumido**: React Native (front), Node.js con Express (back), MongoDB (base de datos), Google Maps API, Twilio para SMS/WhatsApp.
- **Top 3 riesgos**:
  1. Baja adopción inicial: el modelo de dos lados (ofrecedores y demandantes) requiere masa crítica en ambas partes para funcionar.
  2. Seguridad y fraude de identidad: la verificación con INE no es infalible; falsificación de documentos o cuentas falsas pueden erosionar la confianza.
  3. Monetización por lead: los mandaderos pueden rechazar el pago por el contacto o intentar contactar al solicitante fuera de la app para evadir la tarifa.
- **Criterios de éxito del MVP**:  
   - Al menos 100 publicaciones realizadas en el primer mes.  
   - Tasa de conversión de publicación a contratación superior al 20%.  
   - Puntuación promedio de usuarios en la app de 4/5 o más.

## 7. Flujo de Usuario (Happy Path)

### Rol: Solicitante
1. **Registro**: Se registra con nombre, teléfono, correo. Sube foto de INE/identificación. El sistema valida y activa la cuenta.
2. **Publicar mandado**: Indica tipo (compra/trámite), ubicación de recolección, ubicación de entrega, fecha/hora límite, descripción y foto opcional del producto/servicio.
3. **Recibir ofertas**: Ve un listado de ofertas entrantes con precio, nombre del mandadero y su calificación.
4. **Aceptar oferta**: Selecciona la mejor oferta. El sistema aplica la tarifa de contacto (pagada por el mandadero) y revela los datos de contacto del mandadero al solicitante.
5. **Ejecución**: El mandadero realiza el mandado. Ambas partes confirman la entrega en la app.
6. **Calificar**: Ambas partes se califican mutuamente (1-5 estrellas + comentario opcional).

### Rol: Mandadero
1. **Registro**: Mismo proceso de registro con verificación de identidad.
2. **Explorar mandados**: Ve un mapa/listado de mandados disponibles cerca de su ubicación.
3. **Ofertar**: Envía una oferta de precio por un mandado específico.
4. **Ser aceptado**: Recibe notificación si su oferta fue aceptada. Paga la tarifa de contacto (si aplica).
5. **Ejecutar**: Realiza el mandado, confirma la entrega.
6. **Calificar**: Califica al solicitante.

## 8. Modelo de Datos Básico

### Usuario
- id (UUID)
- nombre completo
- teléfono (único, validado vía SMS)
- correo electrónico
- foto de INE (URL)
- estado de verificación (pendiente/verificado/rechazado)
- ubicación predeterminada (lat, lng)
- calificación promedio
- total de calificaciones
- fecha de registro
- fecha de última actividad

### Mandado
- id (UUID)
- id_solicitante (ref Usuario)
- tipo (compra/trámite)
- título
- descripción
- foto (opcional, URL)
- ubicación_recolección (dirección, lat, lng)
- ubicación_entrega (dirección, lat, lng)
- fecha_hora_límite
- estado (publicado/en_progreso/completado/cancelado)
- precio_ofrecido_por_solicitante (opcional)
- fecha_publicación

### Oferta
- id (UUID)
- id_mandado (ref Mandado)
- id_mandadero (ref Usuario)
- monto_ofertado (MXN)
- estado (pendiente/aceptada/rechazada/cancelada)
- fecha_creación
- fecha_respuesta
- tarifa_contacto_pagada (bool)

### Calificación
- id (UUID)
- id_mandado (ref Mandado)
- id_calificador (ref Usuario)
- id_calificado (ref Usuario)
- puntuación (1-5)
- comentario (opcional)
- fecha

### Transacción de Monetización (para Opción C)
- id (UUID)
- id_oferta (ref Oferta)
- id_mandadero (ref Usuario)
- monto_tarifa (MXN)
- método_pago
- estado (pendiente/completada/reembolsada)
- fecha