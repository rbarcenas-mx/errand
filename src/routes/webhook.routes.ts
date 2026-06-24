import { Router } from 'express';
import twilio from 'twilio';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const webhookRoutes = Router();

webhookRoutes.post('/twilio', (req, res) => {
  const twilioSignature = req.headers['x-twilio-signature'] as string;
  const webhookUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  if (env.TWILIO_AUTH_TOKEN) {
    const isValid = twilio.validateRequest(
      env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      webhookUrl,
      req.body,
    );

    if (!isValid) {
      logger.warn({ webhookUrl }, 'Firma de webhook Twilio inválida');
      res.status(403).json({ error: 'Firma inválida' });
      return;
    }
  } else {
    logger.warn('TWILIO_AUTH_TOKEN no configurado, omitiendo validación de firma');
  }

  const { MessageSid, MessageStatus, To, From, ErrorCode } = req.body;

  logger.info(
    {
      messageSid: MessageSid,
      status: MessageStatus,
      to: To,
      from: From,
      errorCode: ErrorCode,
    },
    'Webhook de Twilio recibido',
  );

  res.status(200).json({ status: 'received' });
});
