import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

export function generateTestToken(
  userId = 'test-user-id',
  estadoVerificacion = 'pendiente',
): string {
  return jwt.sign(
    {
      sub: userId,
      telefono: '+524421234567',
      estado_verificacion: estadoVerificacion,
    },
    env.JWT_SECRET,
    { expiresIn: '1h' },
  );
}
