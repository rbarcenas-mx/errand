import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class ExpirationService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start(intervalMs: number = 60_000): void {
    if (this.intervalId) return;

    logger.info({ intervalMs }, 'Iniciando scheduler de expiración');

    this.execute();
    this.intervalId = setInterval(() => this.execute(), intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Scheduler de expiración detenido');
    }
  }

  async execute(): Promise<void> {
    try {
      const now = new Date();

      const expirados = await prisma.mandado.findMany({
        where: {
          estado: 'publicado',
          fecha_hora_limite: { lte: now },
        },
        include: {
          ofertas: {
            where: { estado: 'pendiente' },
          },
        },
      });

      for (const mandado of expirados) {
        await prisma.$transaction(async (tx) => {
          await tx.mandado.update({
            where: { id: mandado.id },
            data: { estado: 'expirado' },
          });

          if (mandado.ofertas.length > 0) {
            await tx.oferta.updateMany({
              where: {
                id_mandado: mandado.id,
                estado: 'pendiente',
              },
              data: { estado: 'expirada' },
            });
          }
        });

        logger.info(
          { mandadoId: mandado.id, ofertasExpiradas: mandado.ofertas.length },
          'Mandado expirado automáticamente',
        );
      }
    } catch (error) {
      logger.error({ error }, 'Error en ejecución de expiración automática');
    }
  }
}

export const expirationService = new ExpirationService();
