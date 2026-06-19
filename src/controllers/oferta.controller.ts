import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { mandadoRepository } from '../repositories/mandado.repository';
import { mandadoService } from '../services/mandado.service';
import { notificationService } from '../services/notification.service';
import { verificationService } from '../services/verification.service';
import { logger } from '../utils/logger';

const createOfertaSchema = z.object({
  monto_ofertado: z.number().positive().multipleOf(0.01),
});

const patchOfertaSchema = z.object({
  accion: z.enum(['aceptada', 'rechazada']),
});

export class OfertaController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      if (!verificationService.canSendOffer(req.usuario.estado_verificacion)) {
        res.status(403).json({
          error: 'Verificación de identidad requerida',
          estado_actual: req.usuario.estado_verificacion,
        });
        return;
      }

      const data = createOfertaSchema.parse(req.body);
      const mandadoId = req.params.id;

      const mandado = await mandadoRepository.findById(mandadoId);
      if (!mandado || mandado.estado !== 'publicado') {
        res.status(404).json({ error: 'Mandado no encontrado o expirado' });
        return;
      }

      if (mandado.id_solicitante === req.usuario.sub) {
        res.status(400).json({ error: 'No puedes ofertar en tu propio mandado' });
        return;
      }

      if (new Date(mandado.fecha_hora_limite) < new Date()) {
        res.status(400).json({ error: 'El mandado ya expiró' });
        return;
      }

      const existing = await prisma.oferta.findUnique({
        where: {
          id_mandado_id_mandadero: {
            id_mandado: mandadoId,
            id_mandadero: req.usuario.sub,
          },
        },
      });

      if (existing) {
        res.status(400).json({ error: 'Ya ofertaste en este mandado' });
        return;
      }

      const oferta = await prisma.oferta.create({
        data: {
          id_mandado: mandadoId,
          id_mandadero: req.usuario.sub,
          monto_ofertado: data.monto_ofertado,
        },
      });

      try {
        await notificationService.notifyNuevaOferta(
          mandado.solicitante.telefono,
          mandado.titulo,
        );
      } catch {
        logger.warn('No se pudo enviar notificación de nueva oferta');
      }

      res.status(201).json({
        id: oferta.id,
        estado: oferta.estado,
        creado_en: oferta.creado_en,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error al crear oferta');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async listByMandado(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      const mandadoId = req.params.id;

      const mandado = await mandadoRepository.findById(mandadoId);
      if (!mandado) {
        res.status(404).json({ error: 'Mandado no encontrado' });
        return;
      }

      if (mandado.id_solicitante !== req.usuario.sub) {
        res.status(403).json({ error: 'No eres el solicitante de este mandado' });
        return;
      }

      const ofertas = await prisma.oferta.findMany({
        where: { id_mandado: mandadoId },
        include: {
          mandadero: {
            select: {
              id: true,
              nombre_completo: true,
              puntuacion_promedio: true,
              total_calificaciones: true,
            },
          },
        },
        orderBy: { creado_en: 'desc' },
      });

      res.status(200).json({
        data: ofertas.map((o) => ({
          id: o.id,
          mandadero: o.mandadero,
          monto_ofertado: Number(o.monto_ofertado),
          estado: o.estado,
          creado_en: o.creado_en,
        })),
      });
    } catch (error) {
      logger.error({ error }, 'Error al listar ofertas');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      const data = patchOfertaSchema.parse(req.body);
      const ofertaId = req.params.id;

      const oferta = await prisma.oferta.findUnique({
        where: { id: ofertaId },
        include: { mandado: true, mandadero: true },
      });

      if (!oferta) {
        res.status(404).json({ error: 'Oferta no encontrada' });
        return;
      }

      if (oferta.mandado.id_solicitante !== req.usuario.sub) {
        res.status(403).json({ error: 'No eres el solicitante de este mandado' });
        return;
      }

      if (oferta.estado !== 'pendiente') {
        res.status(409).json({ error: 'Oferta ya no está pendiente' });
        return;
      }

      if (data.accion === 'rechazada') {
        const updated = await prisma.oferta.update({
          where: { id: ofertaId },
          data: { estado: 'rechazada' },
        });

        res.status(200).json({
          mensaje: 'Oferta rechazada',
          id: updated.id,
          estado: updated.estado,
        });
        return;
      }

      const { contacto } = await mandadoService.acceptOferta(
        ofertaId,
        oferta.id_mandado,
      );

      try {
        await notificationService.notifyOfertaAceptada(
          oferta.mandadero.telefono,
          oferta.mandado.titulo,
        );
      } catch {
        logger.warn('No se pudo enviar notificación de oferta aceptada');
      }

      res.status(200).json({
        mensaje: 'Oferta aceptada. Contacto del mandadero revelado.',
        contacto_mandadero: contacto,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error al gestionar oferta');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export const ofertaController = new OfertaController();
