import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class MandadoService {
  async revealContactInfo(ofertaId: string): Promise<{
    nombre_completo: string;
    telefono: string;
  } | null> {
    try {
      const oferta = await prisma.oferta.findUnique({
        where: { id: ofertaId },
        include: {
          mandadero: {
            select: {
              id: true,
              nombre_completo: true,
              telefono: true,
            },
          },
        },
      });

      if (!oferta || oferta.estado !== 'aceptada') return null;

      return {
        nombre_completo: oferta.mandadero.nombre_completo,
        telefono: oferta.mandadero.telefono,
      };
    } catch (error) {
      logger.error({ error }, 'Error al revelar información de contacto');
      return null;
    }
  }

  async acceptOferta(ofertaId: string, mandadoId: string): Promise<{
    contacto: { nombre_completo: string; telefono: string } | null;
  }> {
    await prisma.$transaction(async (tx) => {
      await tx.oferta.update({
        where: { id: ofertaId },
        data: { estado: 'aceptada' },
      });

      await tx.oferta.updateMany({
        where: {
          id_mandado: mandadoId,
          id: { not: ofertaId },
          estado: 'pendiente',
        },
        data: { estado: 'rechazada' },
      });

      await tx.mandado.update({
        where: { id: mandadoId },
        data: { estado: 'en_progreso' },
      });
    });

    const contacto = await this.revealContactInfo(ofertaId);
    return { contacto };
  }
}

export const mandadoService = new MandadoService();
