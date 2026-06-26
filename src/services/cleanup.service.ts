import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { v2 as cloudinary } from 'cloudinary';

export class CleanupService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start(intervalMs: number = 86_400_000): void {
    if (this.intervalId) return;

    logger.info({ intervalMs }, 'Iniciando scheduler de limpieza de datos sensibles');

    this.execute();
    this.intervalId = setInterval(() => this.execute(), intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Scheduler de limpieza detenido');
    }
  }

  async execute(): Promise<void> {
    try {
      const ahora = new Date();
      const diasAprobado = 90;
      const diasRechazado = 30;

      const fechaLimiteAprobado = new Date(ahora.getTime() - diasAprobado * 24 * 60 * 60 * 1000);
      const fechaLimiteRechazado = new Date(ahora.getTime() - diasRechazado * 24 * 60 * 60 * 1000);

      const usuariosLimpiar = await prisma.usuario.findMany({
        where: {
          OR: [
            { estado_verificacion: 'aprobado', verificado_en: { lte: fechaLimiteAprobado } },
            { estado_verificacion: 'rechazado', actualizado_en: { lte: fechaLimiteRechazado } },
          ],
          NOT: { foto_ine_url: null, foto_vivo_url: null },
        },
        select: { id: true, foto_ine_url: true, foto_vivo_url: true },
      });

      if (usuariosLimpiar.length === 0) {
        logger.debug('No hay documentos de verificación para limpiar');
        return;
      }

      logger.info({ cantidad: usuariosLimpiar.length }, 'Limpiando documentos de verificación');

      for (const usuario of usuariosLimpiar) {
        const publicIds: string[] = [];

        for (const url of [usuario.foto_ine_url, usuario.foto_vivo_url]) {
          if (url) {
            const publicId = this.extraerPublicId(url);
            if (publicId) {
              publicIds.push(publicId);
            }
          }
        }

        for (const publicId of publicIds) {
          try {
            await cloudinary.uploader.destroy(publicId);
            logger.debug({ publicId }, 'Documento eliminado de Cloudinary');
          } catch (error) {
            logger.warn({ publicId, error }, 'Error al eliminar documento de Cloudinary');
          }
        }

        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { foto_ine_url: null, foto_vivo_url: null },
        });

        logger.info(
          { userId: usuario.id, documentos: publicIds.length },
          'Documentos de verificación limpiados',
        );
      }
    } catch (error) {
      logger.error({ error }, 'Error en ejecución de limpieza de datos sensibles');
    }
  }

  private extraerPublicId(url: string): string | null {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.\w+$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}

export const cleanupService = new CleanupService();
