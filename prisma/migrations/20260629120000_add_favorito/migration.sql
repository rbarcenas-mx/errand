-- CreateTable
CREATE TABLE "favoritos" (
    "id" UUID NOT NULL,
    "id_solicitante" UUID NOT NULL,
    "id_mandadero" UUID NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favoritos_id_solicitante_id_mandadero_key" ON "favoritos"("id_solicitante", "id_mandadero");

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_id_solicitante_fkey" FOREIGN KEY ("id_solicitante") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_id_mandadero_fkey" FOREIGN KEY ("id_mandadero") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
