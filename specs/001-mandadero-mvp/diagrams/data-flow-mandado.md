# Flujo de Datos del Mandado

[//]: # (INICIO_DIAGRAMA)

```mermaid
flowchart LR
    subgraph MobileApp [Mobile App]
        direction TB
        Solicitante["👤 Solicitante"]
        Mandadero["🛵 Mandadero"]
    end

    subgraph BackendAPI [Backend API - Node.js/Express]
        direction TB
        AuthSvc["Servicio de Autenticación (JWT/OTP)"]
        MandadoSvc["Servicio de Mandados"]
        OfertaSvc["Servicio de Ofertas"]
        ChatSvc["Servicio de Mensajería"]
        AdminSvc["Servicio Administrativo"]
    end

    subgraph Database [PostgreSQL + PostGIS]
        direction TB
        DB_Users[(Usuarios & Verificación)]
        DB_Mandados[(Mandados & Ubicaciones)]
        DB_Ofertas[(Ofertas & Estados)]
        DB_Chat[(Mensajes & Chat)]
    end

    subgraph ExternalServices [Servicios Externos]
        direction TB
        Twilio["Twilio (SMS OTP)"]
        Cloudinary["Cloudinary (Imágenes)"]
        Nominatim["Nominatim (Geocodificación)"]
        IdentitySvc["OCR/Selfie Service"]
    end

    %% Flujo de Creación de Mandado
    Solicitante -->|1. Crea Mandado| MandadoSvc
    MandadoSvc -->|2. Geocodifica Dirección| Nominatim
    MandadoSvc -->|3. Sube Fotos| Cloudinary
    MandadoSvc -->|4. Persiste Datos| DB_Mandados

    %% Flujo de Descubrimiento y Oferta
    Mandadero -->|5. Busca Mandados Cercanos| MandadoSvc
    MandadoSvc -->|6. Query Espacial (PostGIS)| DB_Mandados
    Mandadero -->|7. Envía Oferta| OfertaSvc
    OfertaSvc -->|8. Guarda Oferta| DB_Ofertas
    OfertaSvc -.->|9. Notifica Nueva Oferta| Solicitante

    %% Flujo de Aceptación y Negociación
    Solicitante -->|10. Acepta Oferta| OfertaSvc
    OfertaSvc -->|11. Cambia Estado: en_progreso| DB_Mandados
    OfertaS_Contact[{"Revelar Contacto"}] --> ChatSvc
    Mandadero <-->|12. Intercambio de Mensajes| ChatSvc
    ChatSvc <-->|13. Persiste Mensajes| DB_Chat

    %% Flujo de Finalización y Calificación
    Mandadero -->|14. Marca como Completado| MandadoSvc
    MandadoSvc -->|15. Actualiza Estado| DB_Mandados
    Solicitante -->|16. Envía Calificación| AdminSvc
    AdminSvc -->|17. Actualiza Puntuación| DB_Users

    %% Flujo de Seguridad y Verificación
    AuthSvc -->|OTP| Twilio
    Mandadero -->|Subir Identidad| IdentitySvc
    IdentitySvc -->|URL Imagen| Cloudinary
    AdminSvc -->|Revisión Manual| DB_Users
```