import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { userService } from '../services/user.service';
import { verificationService } from '../services/verification.service';
import { logger } from '../utils/logger';

const createCalificacionSchema = z.object({
  id_mandado: z.string().uuid(),
  id_calificado: z.string().uuid(),
  puntuacion: z.number().int().min(1).max(5),
  comentario: z.string().max(500).optional(),
});

export class CalificacionController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      if (!verificationService.canRate(req.usuario.estado_verificacion)) {
        res.status(403).json({
          error: 'Verificación de identidad requerida para calificar',
          estado_actual: req.usuario.estado_verificacion,
        });
        return;
      }

      const data = createCalificacionSchema.parse(req.body);

      if (data.id_calificado === req.usuario.sub) {
        res.status(400).json({ error: 'No puedes calificarte a ti mismo' });
        return;
      }

      const mandado = await prisma.mandado.findUnique({
        where: { id: data.id_mandado },
        include: { ofertas: true },
      });

      if (!mandado) {
        res.status(404).json({ error: 'Mandado no encontrado' });
        return;
      }

      if (mandado.estado !== 'completado') {
        res.status(400).json({ error: 'Solo se puede calificar mandados completados' });
        return;
      }

      const userId = req.usuario!.sub;

      const isSolicitante = mandado.id_solicitante === userId;
      const isMandaderoAceptado = mandado.ofertas.some(
        (o) => o.id_mandadero === userId && o.estado === 'aceptada',
      );

      if (!isSolicitante && !isMandaderoAceptado) {
        res.status(403).json({ error: 'No participaste en este mandado' });
        return;
      }

      const existing = await prisma.calificacion.findUnique({
        where: {
          id_mandado_id_calificador: {
            id_mandado: data.id_mandado,
            id_calificador: req.usuario.sub,
          },
        },
      });

      if (existing) {
        res.status(409).json({ error: 'Ya calificaste esta transacción' });
        return;
      }

      const calificacion = await prisma.calificacion.create({
        data: {
          id_mandado: data.id_mandado,
          id_calificador: req.usuario.sub,
          id_calificado: data.id_calificado,
          puntuacion: data.puntuacion,
          comentario: data.comentario,
        },
      });

      await userService.recalculateRating(data.id_calificado);

      res.status(201).json({
        id: calificacion.id,
        creado_en: calificacion.creado_en,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error al crear calificación');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export const calificacionController = new CalificacionController();
