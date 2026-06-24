import { Router } from 'express';
import { denunciaController } from '../controllers/denuncia.controller';
import { authenticate } from '../middleware/auth.middleware';

export const denunciaRoutes = Router();

denunciaRoutes.post('/', authenticate, (req, res) => denunciaController.create(req, res));
