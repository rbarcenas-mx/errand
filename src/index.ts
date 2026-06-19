import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { expirationService } from './services/expiration.service';

const app = createApp();

if (env.NODE_ENV !== 'test') {
  expirationService.start();
}

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Servidor Mandadero iniciado');
});
