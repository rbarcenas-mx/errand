import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { env } from '../config/env';

export function generateAccessToken(usuario: {
  id: string;
  telefono: string;
  estado_verificacion: string;
}): string {
  return jwt.sign(
    {
      sub: usuario.id,
      telefono: usuario.telefono,
      estado_verificacion: usuario.estado_verificacion,
    },
    env.JWT_SECRET,
    { expiresIn: '1h' } as jwt.SignOptions,
  );
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function sha256(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function storeRefreshToken(idUsuario: string, refreshToken: string): Promise<void> {
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const tokenSha256 = sha256(refreshToken);
  const expiraEn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      token_hash: tokenHash,
      token_sha256: tokenSha256,
      id_usuario: idUsuario,
      expira_en: expiraEn,
    },
  });
}

export async function revokeRefreshToken(refreshToken: string): Promise<boolean> {
  const tokenSha256 = sha256(refreshToken);
  const record = await prisma.refreshToken.findUnique({ where: { token_sha256: tokenSha256 } });
  if (!record) return false;
  await prisma.refreshToken.delete({ where: { id: record.id } });
  return true;
}

export async function rotateRefreshToken(refreshToken: string): Promise<{
  nuevoToken: string;
  usuario: { id: string; telefono: string; estado_verificacion: string };
} | null> {
  const tokenSha256 = sha256(refreshToken);
  const record = await prisma.refreshToken.findUnique({
    where: { token_sha256: tokenSha256, expira_en: { gt: new Date() } },
    include: { usuario: true },
  });
  if (!record) return null;

  const nuevoToken = generateRefreshToken();
  const nuevoTokenHash = await bcrypt.hash(nuevoToken, 10);
  const nuevoTokenSha256 = sha256(nuevoToken);
  const expiraEn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: record.id } }),
    prisma.refreshToken.create({
      data: {
        token_hash: nuevoTokenHash,
        token_sha256: nuevoTokenSha256,
        id_usuario: record.id_usuario,
        expira_en: expiraEn,
      },
    }),
  ]);

  return { nuevoToken, usuario: record.usuario };
}
