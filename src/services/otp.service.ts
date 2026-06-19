import { prisma } from '../config/database';
import { env } from '../config/env';
import crypto from 'crypto';

class OtpService {
  generateCode(): string {
    if (env.ALLOW_TEST_OTP) {
      return '123456';
    }
    return crypto.randomInt(100000, 999999).toString();
  }

  async setOtp(telefono: string, codigo: string, ttlMinutes = 10): Promise<void> {
    await prisma.oTPCode.upsert({
      where: { telefono },
      update: {
        codigo,
        intentos: 0,
        expira_en: new Date(Date.now() + ttlMinutes * 60 * 1000),
      },
      create: {
        telefono,
        codigo,
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

    if (entry.codigo !== codigo) return false;

    await prisma.oTPCode.delete({ where: { telefono } });
    return true;
  }

  async clearOtp(telefono: string): Promise<void> {
    await prisma.oTPCode.delete({ where: { telefono } }).catch(() => {});
  }
}

export const otpService = new OtpService();
