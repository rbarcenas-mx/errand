-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "correo_electronico" VARCHAR(255),
    "foto_ine_url" TEXT,
    "foto_vivo_url" TEXT,
    "estado_verificacion" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "rol" VARCHAR(20) NOT NULL DEFAULT 'ambos',
    "ubicacion_lat" DOUBLE PRECISION,
    "ubicacion_lng" DOUBLE PRECISION,
    "puntuacion_promedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_calificaciones" INTEGER NOT NULL DEFAULT 0,
    "verificado_en" TIMESTAMPTZ(6),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "token_sha256" VARCHAR(64) NOT NULL,
    "id_usuario" UUID NOT NULL,
    "expira_en" TIMESTAMPTZ(6) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mandados" (
    "id" UUID NOT NULL,
    "id_solicitante" UUID,
    "titulo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "foto_url" TEXT,
    "ubicacion_recogida_lat" DOUBLE PRECISION NOT NULL,
    "ubicacion_recogida_lng" DOUBLE PRECISION NOT NULL,
    "ubicacion_entrega_lat" DOUBLE PRECISION NOT NULL,
    "ubicacion_entrega_lng" DOUBLE PRECISION NOT NULL,
    "direccion_recogida" TEXT NOT NULL,
    "direccion_entrega" TEXT NOT NULL,
    "fecha_hora_limite" TIMESTAMPTZ(6) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'publicado',
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mandados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ofertas" (
    "id" UUID NOT NULL,
    "id_mandado" UUID NOT NULL,
    "id_mandadero" UUID NOT NULL,
    "monto_ofertado" DECIMAL(10,2) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ofertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calificaciones" (
    "id" UUID NOT NULL,
    "id_mandado" UUID NOT NULL,
    "id_calificador" UUID NOT NULL,
    "id_calificado" UUID NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" UUID NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "codigo" VARCHAR(64) NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "expira_en" TIMESTAMPTZ(6) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" UUID NOT NULL,
    "id_mandado" UUID NOT NULL,
    "id_remitente" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "denuncias" (
    "id" UUID NOT NULL,
    "id_denunciante" UUID NOT NULL,
    "id_denunciado" UUID NOT NULL,
    "id_mandado" UUID NOT NULL,
    "motivo" VARCHAR(20) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "denuncias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telefono_key" ON "usuarios"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_sha256_key" ON "refresh_tokens"("token_sha256");

-- CreateIndex
CREATE UNIQUE INDEX "ofertas_id_mandado_id_mandadero_key" ON "ofertas"("id_mandado", "id_mandadero");

-- CreateIndex
CREATE UNIQUE INDEX "calificaciones_id_mandado_id_calificador_key" ON "calificaciones"("id_mandado", "id_calificador");

-- CreateIndex
CREATE INDEX "otp_codes_telefono_idx" ON "otp_codes"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "otp_codes_telefono_key" ON "otp_codes"("telefono");

-- CreateIndex
CREATE INDEX "mensajes_id_mandado_creado_en_idx" ON "mensajes"("id_mandado", "creado_en");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandados" ADD CONSTRAINT "mandados_id_solicitante_fkey" FOREIGN KEY ("id_solicitante") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofertas" ADD CONSTRAINT "ofertas_id_mandado_fkey" FOREIGN KEY ("id_mandado") REFERENCES "mandados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofertas" ADD CONSTRAINT "ofertas_id_mandadero_fkey" FOREIGN KEY ("id_mandadero") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_id_mandado_fkey" FOREIGN KEY ("id_mandado") REFERENCES "mandados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_id_calificador_fkey" FOREIGN KEY ("id_calificador") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_id_calificado_fkey" FOREIGN KEY ("id_calificado") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_id_mandado_fkey" FOREIGN KEY ("id_mandado") REFERENCES "mandados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_id_denunciante_fkey" FOREIGN KEY ("id_denunciante") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_id_denunciado_fkey" FOREIGN KEY ("id_denunciado") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_id_mandado_fkey" FOREIGN KEY ("id_mandado") REFERENCES "mandados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

