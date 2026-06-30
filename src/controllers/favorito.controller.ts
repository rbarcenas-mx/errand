import { Request, Response } from 'express';
import { z } from 'zod';
import { favoritoRepository } from '../repositories/favorito.repository';
import { logger } from '../utils/logger';

const createFavoritoSchema = z.object({
  id_mandadero: z.string().uuid(),
});

export class FavoritoController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      const data = createFavoritoSchema.parse(req.body);

      if (data.id_mandadero === req.usuario.sub) {
        res.status(400).json({ error: 'No puedes marcarte como favorito a ti mismo' });
        return;
      }

      const existing = await favoritoRepository.findBySolicitanteAndMandadero(
        req.usuario.sub,
        data.id_mandadero,
      );

      if (existing) {
        res.status(409).json({ error: 'El mandadero ya está en tus favoritos' });
        return;
      }

      const favorito = await favoritoRepository.create(req.usuario.sub, data.id_mandadero);

      res.status(201).json({
        id: favorito.id,
        id_mandadero: favorito.id_mandadero,
        creado_en: favorito.creado_en,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error al crear favorito');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      const favorito = await favoritoRepository.findBySolicitanteAndMandadero(
        req.usuario.sub,
        req.params.id_mandadero,
      );

      if (!favorito) {
        res.status(404).json({ error: 'Favorito no encontrado' });
        return;
      }

      await favoritoRepository.delete(favorito.id);

      res.status(200).json({ mensaje: 'Favorito eliminado' });
    } catch (error) {
      logger.error({ error }, 'Error al eliminar favorito');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export const favoritoController = new FavoritoController();
