import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { listMensajes, createMensaje } from '../controllers/mensaje.controller';

const router = Router();

router.get('/:id/mensajes', authenticate, listMensajes);
router.post('/:id/mensajes', authenticate, createMensaje);

export default router;
