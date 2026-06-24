import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const createDenunciaSchema = z.object({
  id_usuario_denunciado: z.string().uuid(),
  id_mandado: z.string().uuid(),
  motivo: z.enum(['acoso', 'fraude', 'otro']),
  descripcion: z.string().min(10).max(2000),
});

export class DenunciaController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      const data = createDenunciaSchema.parse(req.body);

      if (data.id_usuario_denunciado === req.usuario.sub) {
        res.status(400).json({ error: 'No puedes denunciarte a ti mismo' });
        return;
      }

      const denunciado = await prisma.usuario.findUnique({
        where: { id: data.id_usuario_denunciado },
      });
      if (!denunciado) {
        res.status(404).json({ error: 'Usuario denunciado no encontrado' });
        return;
      }

      const mandado = await prisma.mandado.findUnique({
        where: { id: data.id_mandado },
      });
      if (!mandado) {
        res.status(404).json({ error: 'Mandado no encontrado' });
        return;
      }

      const rows: Array<{ id: string; estado: string; creado_en: Date }> = await prisma.$queryRawUnsafe(
        `INSERT INTO denuncias (id, id_denunciante, id_denunciado, id_mandado, motivo, descripcion, estado, creado_en)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'pendiente', NOW())
         RETURNING id, estado, creado_en`,
        req.usuario.sub,
        data.id_usuario_denunciado,
        data.id_mandado,
        data.motivo,
        data.descripcion,
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error al crear denuncia');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export const denunciaController = new DenunciaController();
