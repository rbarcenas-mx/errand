import { Router } from 'express';
import { ofertaController } from '../controllers/oferta.controller';
import { authenticate } from '../middleware/auth.middleware';

export const ofertaRoutes = Router();

ofertaRoutes.get('/mis-ofertas', authenticate, (req, res) =>
  ofertaController.listByMandadero(req, res),
);
ofertaRoutes.patch('/:id', authenticate, (req, res, next) =>
  ofertaController.patch(req, res, next),
);
