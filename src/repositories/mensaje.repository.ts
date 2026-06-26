import { prisma } from '../config/database';

export class MensajeRepository {
  async findByMandado(mandadoId: string, options?: { antesDe?: string; limit?: number }) {
    const where: Record<string, unknown> = { id_mandado: mandadoId };
    if (options?.antesDe) {
      where.creado_en = { lt: new Date(options.antesDe) };
    }

    return prisma.mensaje.findMany({
      where,
      orderBy: { creado_en: 'desc' },
      take: options?.limit ?? 50,
      select: {
        id: true,
        id_remitente: true,
        texto: true,
        leido: true,
        creado_en: true,
      },
    });
  }

  async create(data: { id_mandado: string; id_remitente: string; texto: string }) {
    return prisma.mensaje.create({
      data,
      select: { id: true, creado_en: true },
    });
  }

  async marcarLeidos(mandadoId: string, remitenteId: string) {
    return prisma.mensaje.updateMany({
      where: {
        id_mandado: mandadoId,
        id_remitente: { not: remitenteId },
        leido: false,
      },
      data: { leido: true },
    });
  }
}

export const mensajeRepository = new MensajeRepository();
