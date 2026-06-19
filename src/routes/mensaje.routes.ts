import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { listMensajes, createMensaje } from '../controllers/mensaje.controller';

const router = Router();

router.get('/api/v1/mandados/:id/mensajes', authenticate, listMensajes);
router.post('/api/v1/mandados/:id/mensajes', authenticate, createMensaje);

export default router;
