import { Router } from 'express';
import { logger } from '../utils/logger';

export const webhookRoutes = Router();

webhookRoutes.post('/twilio', (req, res) => {
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
