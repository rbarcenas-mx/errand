import { Router } from 'express';
import { mandadoController } from '../controllers/mandado.controller';
import { ofertaController } from '../controllers/oferta.controller';
import { authenticate } from '../middleware/auth.middleware';
import { listMensajes, createMensaje } from '../controllers/mensaje.controller';

export const mandadoRoutes = Router();

mandadoRoutes.get('/mis-mandados', authenticate, (req, res) =>
  mandadoController.listBySolicitante(req, res),
);
mandadoRoutes.post('/', authenticate, (req, res) => mandadoController.create(req, res));
mandadoRoutes.get('/', (req, res) => mandadoController.list(req, res));
mandadoRoutes.get('/:id', (req, res) => mandadoController.getById(req, res));
mandadoRoutes.patch('/:id/estado', authenticate, (req, res) =>
  mandadoController.updateEstado(req, res),
);
mandadoRoutes.post('/:id/ofertas', authenticate, (req, res) => ofertaController.create(req, res));
mandadoRoutes.get('/:id/ofertas', authenticate, (req, res) =>
  ofertaController.listByMandado(req, res),
);
mandadoRoutes.get('/:id/mensajes', authenticate, listMensajes);
mandadoRoutes.post('/:id/mensajes', authenticate, createMensaje);
