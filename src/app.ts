import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { authRoutes } from './routes/auth.routes';
import { mandadoRoutes } from './routes/mandado.routes';
import { ofertaRoutes } from './routes/oferta.routes';
import { calificacionRoutes } from './routes/calificacion.routes';
import { webhookRoutes } from './routes/webhook.routes';
import mensajeRoutes from './routes/mensaje.routes';

import { adminRoutes } from './routes/admin.routes';
import { denunciaRoutes } from './routes/denuncia.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
  });
  app.use('/api/', limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos de registro, intenta de nuevo más tarde' },
  });
  app.use('/api/v1/auth/register', authLimiter);
  app.use('/api/v1/auth/verify-otp', authLimiter);

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/mandados', mandadoRoutes);
  app.use('/api/v1/ofertas', ofertaRoutes);
  app.use('/api/v1/calificaciones', calificacionRoutes);
  app.use('/api/v1/mandados', mensajeRoutes);
  app.use('/api/v1/denuncias', denunciaRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api', webhookRoutes);

  Sentry.setupExpressErrorHandler(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
