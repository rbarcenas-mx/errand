import { createApp } from './app';
import { env } from './config/env';
import { initSentry } from './config/sentry';
import { logger } from './utils/logger';
import { expirationService } from './services/expiration.service';
import { cleanupService } from './services/cleanup.service';

initSentry();

const app = createApp();

if (env.NODE_ENV !== 'test') {
  expirationService.start();
  cleanupService.start();
}

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Servidor Mandadero iniciado');
});
