import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

const SISTEMA_MENSAJE_ACEPTACION = 'Canal de mensajería abierto. Oferta aceptada.';

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

  async acceptOferta(
    ofertaId: string,
    mandadoId: string,
    solicitanteId: string,
  ): Promise<{
    contacto_mandadero: { nombre_completo: string; telefono: string } | null;
    contacto_solicitante: { nombre_completo: string; telefono: string } | null;
  }> {
    await prisma.$transaction(async (tx) => {
      const oferta = await tx.oferta.findUnique({
        where: { id: ofertaId },
        select: {
          id_mandado: true,
          estado: true,
          id_mandadero: true,
          mandado: {
            select: {
              id_solicitante: true,
            },
          },
        },
      });

      if (!oferta) {
        throw new NotFoundError('Oferta no encontrada');
      }

      if (oferta.mandado.id_solicitante !== solicitanteId) {
        throw new ValidationError('No eres el solicitante de este mandado');
      }

      if (oferta.id_mandado !== mandadoId) {
        throw new ValidationError('La oferta no pertenece al mandado indicado');
      }

      if (oferta.estado !== 'pendiente') {
        throw new ConflictError('La oferta ya fue respondida');
      }

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

      await tx.mensaje.create({
        data: {
          id_mandado: mandadoId,
          id_remitente: oferta.mandado.id_solicitante,
          texto: SISTEMA_MENSAJE_ACEPTACION,
        },
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
