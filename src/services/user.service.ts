import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class UserService {
  async recalculateRating(userId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        const result = await tx.calificacion.aggregate({
          where: { id_calificado: userId },
          _avg: { puntuacion: true },
          _count: { puntuacion: true },
        });

        const promedio = result._avg.puntuacion || 0;
        const total = result._count.puntuacion || 0;

        await tx.usuario.update({
          where: { id: userId },
          data: {
            puntuacion_promedio: Math.round(promedio * 10) / 10,
            total_calificaciones: total,
          },
        });

        logger.info({ userId, promedio, total }, 'Rating actualizado');
      });
    } catch (error) {
      logger.error({ error, userId }, 'Error al recalcular rating');
    }
  }
}

export const userService = new UserService();
