import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { favoritoController } from '../controllers/favorito.controller';

export const favoritoRoutes = Router();

favoritoRoutes.post('/', authenticate, (req, res) => favoritoController.create(req, res));
favoritoRoutes.delete('/:id_mandadero', authenticate, (req, res) =>
  favoritoController.delete(req, res),
);
