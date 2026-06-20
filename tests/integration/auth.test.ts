import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

jest.mock('../../src/config/database', () => ({
  prisma: {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    oTPCode: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('../../src/services/notification.service', () => ({
  notificationService: {
    sendOTP: jest.fn().mockResolvedValue(undefined),
    notifyNuevaOferta: jest.fn().mockResolvedValue(undefined),
    notifyOfertaAceptada: jest.fn().mockResolvedValue(undefined),
    notifyVerificacionCompleta: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.usuario.create.mockResolvedValue({
        id: 'uuid-1',
        nombre_completo: 'Juan Pérez',
        telefono: '+524421234567',
        estado_verificacion: 'pendiente',
        rol: 'ambos',
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        nombre_completo: 'Juan Pérez',
        telefono: '+524421234567',
        correo_electronico: 'juan@ejemplo.com',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('mensaje');
    });

    it('should reject invalid phone format', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        nombre_completo: 'Juan',
        telefono: '4421234567',
      });

      expect(res.status).toBe(422);
    });

    it('should reject duplicate phone', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'uuid-1',
        telefono: '+524421234567',
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        nombre_completo: 'Juan Pérez',
        telefono: '+524421234567',
      });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    it('should verify valid OTP and return tokens', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'uuid-1',
        nombre_completo: 'Juan Pérez',
        telefono: '+524421234567',
        rol: 'ambos',
        estado_verificacion: 'pendiente',
      });
      prisma.oTPCode.findUnique.mockResolvedValue({
        telefono: '+524421234567',
        codigo: '123456',
        intentos: 0,
        expira_en: new Date(Date.now() + 60000),
      });
      prisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const res = await request(app).post('/api/v1/auth/verify-otp').send({
        telefono: '+524421234567',
        codigo: '123456',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(res.body.usuario).toHaveProperty('estado_verificacion');
    });

    it('should reject invalid OTP code', async () => {
      const res = await request(app).post('/api/v1/auth/verify-otp').send({
        telefono: '+524421234567',
        codigo: '000000',
      });

      expect(res.status).toBe(401);
    });
  });
});
