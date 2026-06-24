import { prisma } from '../config/database';
import { env } from '../config/env';
import crypto from 'crypto';

function hashOtp(telefono: string, codigo: string): string {
  return crypto
    .createHash('sha256')
    .update(`${telefono}:${codigo}`)
    .digest('hex');
}

class OtpService {
  generateCode(): string {
    if (env.ALLOW_TEST_OTP) {
      return '123456';
    }
    return crypto.randomInt(100000, 999999).toString();
  }

  async setOtp(telefono: string, codigo: string, ttlMinutes = 10): Promise<void> {
    const codigoHash = hashOtp(telefono, codigo);
    await prisma.oTPCode.upsert({
      where: { telefono },
      update: {
        codigo: codigoHash,
        intentos: 0,
        expira_en: new Date(Date.now() + ttlMinutes * 60 * 1000),
      },
      create: {
        telefono,
        codigo: codigoHash,
        expira_en: new Date(Date.now() + ttlMinutes * 60 * 1000),
      },
    });
  }

  async verifyOtp(telefono: string, codigo: string): Promise<boolean> {
    const entry = await prisma.oTPCode.findUnique({ where: { telefono } });
    if (!entry) return false;

    if (new Date() > entry.expira_en) {
      await prisma.oTPCode.delete({ where: { telefono } });
      return false;
    }

    if (entry.intentos >= 5) {
      await prisma.oTPCode.delete({ where: { telefono } });
      return false;
    }

    await prisma.oTPCode.update({
      where: { telefono },
      data: { intentos: entry.intentos + 1 },
    });

    const codigoHash = hashOtp(telefono, codigo);
    if (entry.codigo !== codigoHash) return false;

    await prisma.oTPCode.delete({ where: { telefono } });
    return true;
  }

  async clearOtp(telefono: string): Promise<void> {
    await prisma.oTPCode.delete({ where: { telefono } }).catch(() => {});
  }
}

export const otpService = new OtpService();
