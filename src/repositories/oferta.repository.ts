import { prisma } from '../config/database';

export class OfertaRepository {
  async create(data: { id_mandado: string; id_mandadero: string; monto_ofertado: number }) {
    return prisma.oferta.create({ data });
  }

  async findById(id: string) {
    return prisma.oferta.findUnique({
      where: { id },
      include: {
        mandado: true,
        mandadero: {
          select: { id: true, nombre_completo: true, telefono: true },
        },
      },
    });
  }

  async updateEstado(id: string, estado: string) {
    return prisma.oferta.update({
      where: { id },
      data: { estado },
    });
  }

  async findByMandadoAndMandadero(mandadoId: string, mandaderoId: string) {
    return prisma.oferta.findUnique({
      where: {
        id_mandado_id_mandadero: {
          id_mandado: mandadoId,
          id_mandadero: mandaderoId,
        },
      },
    });
  }

  async findAceptadaByMandado(mandadoId: string) {
    return prisma.oferta.findFirst({
      where: { id_mandado: mandadoId, estado: 'aceptada' },
    });
  }

  async listByMandadoWithMandadero(mandadoId: string) {
    return prisma.oferta.findMany({
      where: { id_mandado: mandadoId },
      include: {
        mandadero: {
          select: {
            id: true,
            nombre_completo: true,
            puntuacion_promedio: true,
            total_calificaciones: true,
          },
        },
      },
      orderBy: { creado_en: 'desc' },
    });
  }
}

export const ofertaRepository = new OfertaRepository();
