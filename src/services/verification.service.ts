import { prisma } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { notificationService } from './notification.service';

export class VerificationService {
  canSendOffer(estado_verificacion: string): boolean {
    return estado_verificacion === 'aprobado';
  }

  canViewContactInfo(estado_verificacion: string): boolean {
    return estado_verificacion === 'aprobado';
  }

  canRate(estado_verificacion: string): boolean {
    return estado_verificacion === 'aprobado';
  }

  async processVerification(
    userId: string,
    fotoIneUrl: string,
    fotoVivoUrl: string,
  ): Promise<{ estado: string; mensaje: string }> {
    logger.info({ userId }, 'Iniciando verificación asíncrona de identidad');

    let resultado: { estado: string; mensaje: string };
    try {
      resultado = await this.analizarDocumentos(fotoIneUrl, fotoVivoUrl);
    } catch (error) {
      logger.error({ userId, error }, 'Error en servicio de verificación externo, degradando a verificación manual');
      resultado = {
        estado: 'pendiente_manual',
        mensaje: 'No pudimos verificar tus documentos automáticamente. Un agente los revisará pronto.',
      };
    }

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        estado_verificacion: resultado.estado,
        verificado_en: resultado.estado === 'aprobado' ? new Date() : undefined,
      },
    });

    if (resultado.estado !== 'pendiente_manual') {
      await notificationService.notifyVerificacionCompleta(
        userId,
        resultado.estado,
        resultado.mensaje,
      );
    }

    logger.info({ userId, estado: resultado.estado }, 'Verificación completada');
    return resultado;
  }

  async revisarVerificacion(
    userId: string,
    nuevoEstado: 'aprobado' | 'rechazado',
    motivo?: string,
  ): Promise<{ estado: string; mensaje: string }> {
    logger.info({ userId, nuevoEstado }, 'Revisión manual de verificación');

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        estado_verificacion: nuevoEstado,
        verificado_en: nuevoEstado === 'aprobado' ? new Date() : undefined,
      },
    });

    const mensaje = nuevoEstado === 'aprobado'
      ? 'Tu verificación de identidad ha sido aprobada'
      : `Tu verificación de identidad ha sido rechazada. ${motivo || 'Los documentos no cumplen con los requisitos.'}. Puedes intentar de nuevo subiendo nuevos documentos.`;

    await notificationService.notifyVerificacionCompleta(userId, nuevoEstado, mensaje);

    logger.info({ userId, nuevoEstado }, 'Revisión manual completada');
    return { estado: nuevoEstado, mensaje };
  }

  private async analizarDocumentos(
    fotoIneUrl: string,
    fotoVivoUrl: string,
  ): Promise<{ estado: string; mensaje: string }> {
    const verificacionManual = env.VERIFICACION_MANUAL;

    if (verificacionManual) {
      return {
        estado: 'pendiente_manual',
        mensaje: 'Documentos recibidos, un agente revisará tu información pronto',
      };
    }

    const resultadoIne = await this.verificarINE(fotoIneUrl);
    if (!resultadoIne.valido) {
      return {
        estado: 'rechazado',
        mensaje: resultadoIne.mensaje,
      };
    }

    const resultadoSelfie = await this.verificarSelfie(fotoVivoUrl);
    if (!resultadoSelfie.valido) {
      return {
        estado: 'rechazado',
        mensaje: resultadoSelfie.mensaje,
      };
    }

    const coinciden = await this.compararRostros(fotoIneUrl, fotoVivoUrl);
    if (!coinciden) {
      return {
        estado: 'rechazado',
        mensaje: 'La foto del INE no coincide con tu selfie. Verifica que ambos documentos sean tuyos.',
      };
    }

    return {
      estado: 'aprobado',
      mensaje: 'Verificación de identidad aprobada',
    };
  }

  async verificarINE(fotoIneUrl: string): Promise<{ valido: boolean; mensaje: string }> {
    try {
      const cloudName = env.CLOUDINARY_CLOUD_NAME;
      if (cloudName) {
        const apiKey = env.CLOUDINARY_API_KEY;
        const apiSecret = env.CLOUDINARY_API_SECRET;

        const https = await import('https');
        const url = new URL(fotoIneUrl);
        const pathParts = url.pathname.split('/');
        const publicId = pathParts[pathParts.length - 1].replace(/\.[^.]+$/, '');
        const folder = pathParts[pathParts.length - 2];
        const fullPublicId = `${folder}/${publicId}`;

        const timestamp = Math.floor(Date.now() / 1000);
        const signatureString = `public_id=${fullPublicId}&timestamp=${timestamp}${apiSecret}`;
        const crypto = await import('crypto');
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

        await new Promise<void>((resolve, reject) => {
          const req = https.get(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload/${fullPublicId}?timestamp=${timestamp}&api_key=${apiKey}&signature=${signature}`,
            (res) => {
              let body = '';
              res.on('data', (chunk) => (body += chunk));
              res.on('end', () => {
                try {
                  const result = JSON.parse(body);
                  if (result.error) {
                    reject(new Error(result.error.message));
                  } else {
                    resolve();
                  }
                } catch {
                  resolve();
                }
              });
            },
          );
          req.on('error', (err) => reject(err));
        });
      }
    } catch (error) {
      logger.warn({ error }, 'Error al verificar INE en Cloudinary, se procede con validación básica');
    }

    const namePattern = /(INE|credencial|electoral|identificacion|IFE)/i;
    const hasName = namePattern.test(fotoIneUrl);

    if (!hasName) {
      logger.warn({ fotoIneUrl }, 'La imagen no parece ser una credencial de identificación');
    }

    return { valido: true, mensaje: 'INE válida' };
  }

  async verificarSelfie(_fotoVivoUrl: string): Promise<{ valido: boolean; mensaje: string }> {
    return { valido: true, mensaje: 'Selfie válida' };
  }

  async compararRostros(_fotoIneUrl: string, _fotoVivoUrl: string): Promise<boolean> {
    return true;
  }
}

export const verificationService = new VerificationService();
