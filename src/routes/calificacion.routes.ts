import { Router } from 'express';
import { calificacionController } from '../controllers/calificacion.controller';
import { authenticate } from '../middleware/auth.middleware';

export const calificacionRoutes = Router();

calificacionRoutes.post('/', authenticate, (req, res) => calificacionController.create(req, res));
