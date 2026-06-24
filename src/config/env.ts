import dotenv from 'dotenv';

dotenv.config();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Variable de entorno obligatoria: ${name}`);
  }
  return value || '';
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: requiredEnv('DATABASE_URL'),
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  TWILIO_ACCOUNT_SID: requiredEnv('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: requiredEnv('TWILIO_AUTH_TOKEN'),
  TWILIO_PHONE_NUMBER: requiredEnv('TWILIO_PHONE_NUMBER'),
  CLOUDINARY_CLOUD_NAME: requiredEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: requiredEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: requiredEnv('CLOUDINARY_API_SECRET'),
  ALLOW_TEST_OTP: process.env.ALLOW_TEST_OTP === 'true',
  VERIFICACION_MANUAL: process.env.VERIFICACION_MANUAL === 'true',
  ADMIN_TELEFONO: process.env.ADMIN_TELEFONO || '',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
};

if (env.JWT_SECRET === 'dev-secret-change-in-production' && env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET debe cambiarse del valor por defecto en producción');
}

if (env.ALLOW_TEST_OTP && env.NODE_ENV === 'production') {
  throw new Error('ALLOW_TEST_OTP no debe estar activo en producción — permite codigos OTP de prueba (123456)');
}
