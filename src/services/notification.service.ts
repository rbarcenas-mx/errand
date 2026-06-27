import twilio from 'twilio';
import { env } from '../config/env';
import { logger } from '../utils/logger';

function maskTelefono(telefono: string): string {
  if (telefono.length <= 4) return telefono;
  return '*'.repeat(telefono.length - 4) + telefono.slice(-4);
}

function maskUserId(userId: string): string {
  if (userId.length <= 8) return userId;
  return userId.slice(0, 4) + '...' + userId.slice(-4);
}

export class NotificationService {
  private twilioClient: ReturnType<typeof twilio> | null = null;

  private getClient() {
    if (!this.twilioClient) {
      this.twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    }
    return this.twilioClient;
  }

  async sendOTP(telefono: string, codigo: string): Promise<void> {
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      logger.info({ telefono: maskTelefono(telefono), codigo }, 'OTP generado (modo desarrollo/test)');
      return;
    }
    try {
      await this.getClient().messages.create({
        body: `Tu código de verificación Mandadero es: ${codigo}`,
        from: env.TWILIO_PHONE_NUMBER,
        to: telefono,
      });
      logger.info({ telefono }, 'OTP enviado exitosamente');
    } catch (error) {
      logger.error({ telefono, error }, 'Error al enviar OTP');
      throw error;
    }
  }

  async notifyNuevaOferta(telefonoSolicitante: string, tituloMandado: string): Promise<void> {
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      logger.info(
        { telefonoSolicitante: maskTelefono(telefonoSolicitante), tituloMandado },
        'Notificación de nueva oferta (modo dev/test)',
      );
      return;
    }
    try {
      await this.getClient().messages.create({
        body: `Nueva oferta recibida para tu mandado "${tituloMandado}". Revisa la app.`,
        from: env.TWILIO_PHONE_NUMBER,
        to: telefonoSolicitante,
      });
    } catch (error) {
      logger.error({ error }, 'Error al enviar notificación de oferta');
    }
  }

  async notifyOfertaAceptada(telefonoMandadero: string, tituloMandado: string): Promise<void> {
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      logger.info(
        { telefonoMandadero: maskTelefono(telefonoMandadero), tituloMandado },
        'Notificación de oferta aceptada (modo dev/test)',
      );
      return;
    }
    try {
      await this.getClient().messages.create({
        body: `¡Felicidades! Tu oferta para "${tituloMandado}" fue aceptada. Revisa la app para más detalles.`,
        from: env.TWILIO_PHONE_NUMBER,
        to: telefonoMandadero,
      });
    } catch (error) {
      logger.error({ error }, 'Error al enviar notificación de oferta aceptada');
    }
  }

  async notifyVerificacionCompleta(
    userId: string,
    estado: string,
    mensajeAdicional?: string,
  ): Promise<void> {
    const { prisma } = await import('../config/database');
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { telefono: true },
    });
    if (!usuario) {
      logger.warn({ userId }, 'Usuario no encontrado para notificar verificación');
      return;
    }

    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      logger.info(
        { telefono: maskTelefono(usuario.telefono), userId: maskUserId(userId), estado, mensajeAdicional },
        'Notificación de verificación (modo dev/test)',
      );
      return;
    }
    const mensajeBase =
      estado === 'aprobado'
        ? 'Tu verificación de identidad ha sido aprobada. Ya puedes enviar ofertas.'
        : 'Tu verificación de identidad fue rechazada. Puedes reintentar subiendo nuevos documentos.';
    const mensaje = mensajeAdicional ? `${mensajeBase} Motivo: ${mensajeAdicional}` : mensajeBase;
    try {
      await this.getClient().messages.create({
        body: mensaje,
        from: env.TWILIO_PHONE_NUMBER,
        to: usuario.telefono,
      });
    } catch (error) {
      logger.error({ error }, 'Error al enviar notificación de verificación');
    }
  }
}

export const notificationService = new NotificationService();
