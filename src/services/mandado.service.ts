import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class MandadoService {
  async revealContactInfo(ofertaId: string): Promise<{
    mandadero: { nombre_completo: string; telefono: string };
    solicitante: { nombre_completo: string; telefono: string };
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
          mandado: {
            include: {
              solicitante: {
                select: {
                  id: true,
                  nombre_completo: true,
                  telefono: true,
                },
              },
            },
          },
        },
      });

      if (!oferta || oferta.estado !== 'aceptada') return null;

      if (!oferta.mandado.solicitante) {
        throw new Error('Solicitante no disponible (cuenta eliminada)');
      }

      return {
        mandadero: {
          nombre_completo: oferta.mandadero.nombre_completo,
          telefono: oferta.mandadero.telefono,
        },
        solicitante: {
          nombre_completo: oferta.mandado.solicitante.nombre_completo,
          telefono: oferta.mandado.solicitante.telefono,
        },
      };
    } catch (error) {
      logger.error({ error }, 'Error al revelar información de contacto');
      return null;
    }
  }

  async acceptOferta(ofertaId: string, mandadoId: string): Promise<{
    contacto_mandadero: { nombre_completo: string; telefono: string } | null;
    contacto_solicitante: { nombre_completo: string; telefono: string } | null;
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
    return {
      contacto_mandadero: contacto ? contacto.mandadero : null,
      contacto_solicitante: contacto ? contacto.solicitante : null,
    };
  }
}

export const mandadoService = new MandadoService();
