import { z } from 'zod';
import { prisma } from '../config/database';
import { userRepository } from '../repositories/user.repository';
import { notificationService } from '../services/notification.service';
import { storageService } from '../services/storage.service';
import { otpService } from '../services/otp.service';
import { verificationService } from '../services/verification.service';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../services/token.service';
import { logger } from '../utils/logger';
import { env } from '../config/env';

import { Request, Response } from 'express';

const registerSchema = z.object({
  nombre_completo: z.string().min(3).max(150),
  telefono: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Formato E.164 requerido (+524421234567)'),
  correo_electronico: z.string().email().max(255).optional(),
});

const verifyOtpSchema = z.object({
  telefono: z.string().regex(/^\+[1-9]\d{1,14}$/),
  codigo: z.string().length(6),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

const logoutSchema = z.object({
  refresh_token: z.string().min(1),
});

function generateTokens(usuario: { id: string; telefono: string; estado_verificacion: string }) {
  const accessToken = generateAccessToken(usuario);
  const refreshToken = generateRefreshToken();
  return { accessToken, refreshToken };
}

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);

      const existing = await userRepository.findByTelefono(data.telefono);
      if (existing) {
        if (env.ALLOW_TEST_OTP && existing.estado_verificacion !== 'aprobado') {
          const codigo = otpService.generateCode();
          otpService.setOtp(data.telefono, codigo);
          res.status(200).json({
            mensaje: 'Codigo OTP reenviado via SMS',
            telefono: data.telefono,
          });
          return;
        }
        res.status(409).json({ error: 'Telefono ya registrado' });
        return;
      }

      await userRepository.create(data);

      const codigo = otpService.generateCode();
      otpService.setOtp(data.telefono, codigo);

      try {
        await notificationService.sendOTP(data.telefono, codigo);
      } catch {
        logger.warn({ telefono: data.telefono }, 'No se pudo enviar OTP, verificar en logs');
      }

      res.status(201).json({
        mensaje: 'Código OTP enviado vía SMS',
        telefono: data.telefono,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error en registro');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const data = verifyOtpSchema.parse(req.body);

      const isValid = await otpService.verifyOtp(data.telefono, data.codigo);
      if (!isValid) {
        res.status(401).json({ error: 'Código inválido o expirado' });
        return;
      }

      const usuario = await userRepository.findByTelefono(data.telefono);
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const { accessToken, refreshToken } = generateTokens({
        id: usuario.id,
        telefono: usuario.telefono,
        estado_verificacion: usuario.estado_verificacion,
      });

      await storeRefreshToken(usuario.id, refreshToken);

      res.status(200).json({
        token: accessToken,
        refresh_token: refreshToken,
        usuario: {
          id: usuario.id,
          nombre_completo: usuario.nombre_completo,
          telefono: usuario.telefono,
          rol: usuario.rol,
          estado_verificacion: usuario.estado_verificacion,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error en verify-otp');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const data = refreshSchema.parse(req.body);

      const tokenRecord = await rotateRefreshToken(data.refresh_token);
      if (!tokenRecord) {
        res.status(401).json({ error: 'Refresh token inválido, expirado o revocado' });
        return;
      }

      const usuario = tokenRecord.usuario;
      const accessToken = generateAccessToken({
        id: usuario.id,
        telefono: usuario.telefono,
        estado_verificacion: usuario.estado_verificacion,
      });

      res.status(200).json({
        token: accessToken,
        refresh_token: tokenRecord.nuevoToken,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error en refresh');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const data = logoutSchema.parse(req.body);

      const revoked = await revokeRefreshToken(data.refresh_token);
      if (!revoked) {
        res.status(401).json({ error: 'Refresh token no encontrado' });
        return;
      }

      res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error en logout');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      const userId = req.usuario.sub;

      await prisma.$transaction([
        prisma.refreshToken.deleteMany({ where: { id_usuario: userId } }),
        prisma.mensaje.deleteMany({ where: { id_remitente: userId } }),
        prisma.calificacion.deleteMany({
          where: { OR: [{ id_calificador: userId }, { id_calificado: userId }] },
        }),
        prisma.oferta.deleteMany({ where: { id_mandadero: userId } }),
        prisma.$executeRawUnsafe('DELETE FROM denuncias WHERE id_denunciante = $1 OR id_denunciado = $1', userId),
        prisma.mandado.updateMany({
          where: { id_solicitante: userId },
          data: { id_solicitante: '00000000-0000-0000-0000-000000000000' },
        }),
        prisma.usuario.delete({ where: { id: userId } }),
      ]);

      logger.info({ userId }, 'Cuenta eliminada correctamente');
      res.status(200).json({ mensaje: 'Cuenta eliminada correctamente' });
    } catch (error) {
      logger.error({ error }, 'Error al eliminar cuenta');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async verifyIdentity(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      const usuario = await userRepository.findById(req.usuario.sub);
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      if (usuario.estado_verificacion === 'aprobado') {
        res.status(409).json({ error: 'Tu identidad ya fue verificada' });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const fotoIne = files?.['foto_ine']?.[0];
      const fotoVivo = files?.['foto_vivo']?.[0];

      if (!fotoIne || !fotoVivo) {
        res.status(400).json({ error: 'Ambas fotos (INE y selfie) son requeridas' });
        return;
      }

      const fotoIneUrl = await storageService.uploadImage(fotoIne.path, 'ine');
      const fotoVivoUrl = await storageService.uploadImage(fotoVivo.path, 'selfies');

      await userRepository.updateVerificationStatus(
        req.usuario.sub,
        'pendiente',
        fotoIneUrl,
        fotoVivoUrl,
      );

      verificationService.processVerification(req.usuario.sub, fotoIneUrl, fotoVivoUrl).catch(
        (err) => {
          logger.error({ err }, 'Error en verificación asíncrona');
        },
      );

      res.status(200).json({
        estado: 'pendiente',
        mensaje: 'Documentos recibidos, verificación en proceso',
      });
    } catch (error) {
      logger.error({ error }, 'Error en verify-identity');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async verificationStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      const usuario = await userRepository.findById(req.usuario.sub);
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json({
        estado: usuario.estado_verificacion,
        documento_recibido: !!usuario.foto_ine_url,
        foto_vivo_recibida: !!usuario.foto_vivo_url,
        mensaje:
          usuario.estado_verificacion === 'pendiente'
            ? 'Verificación en proceso, espera resultados'
            : usuario.estado_verificacion === 'aprobado'
              ? 'Verificación aprobada'
              : 'Verificación rechazada. Puedes reintentar subiendo nuevos documentos.',
      });
    } catch (error) {
      logger.error({ error }, 'Error en verification-status');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export const authController = new AuthController();
