import request from 'supertest';

jest.mock('../../src/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret-key',
    JWT_EXPIRES_IN: '1h',
    ADMIN_TELEFONO: '+524421234567',
  },
}));

jest.mock('../../src/config/database', () => ({
  prisma: {
    usuario: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    denuncia: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../src/services/notification.service', () => ({
  notificationService: {
    notifyVerificacionCompleta: jest.fn().mockResolvedValue(undefined),
  },
}));

import { createApp } from '../../src/app';
import { generateTestToken } from '../setup';

const app = createApp();
const adminToken = generateTestToken('admin-id', 'aprobado');

function makeToken(telefono: string): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { sub: 'user-id', telefono, estado_verificacion: 'aprobado' },
    'test-secret-key',
    { expiresIn: '1h' },
  );
}

describe('Admin Verification Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/admin/verificaciones-pendientes', () => {
    it('should reject non-admin users', async () => {
      const token = makeToken('+529990000000');

      const res = await request(app)
        .get('/api/v1/admin/verificaciones-pendientes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Acceso de administrador requerido');
    });

    it('should list pending manual verifications', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findMany.mockResolvedValue([
        {
          id: 'user-pending-1',
          nombre_completo: 'Juan Perez',
          correo_electronico: 'juan@test.com',
          telefono: '+524421111111',
          foto_ine_url: 'https://cloudinary.com/ine.jpg',
          foto_vivo_url: 'https://cloudinary.com/selfie.jpg',
          creado_en: new Date('2026-06-19').toISOString(),
        },
      ]);

      const res = await request(app)
        .get('/api/v1/admin/verificaciones-pendientes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.verificaciones).toHaveLength(1);
      expect(res.body.verificaciones[0].nombre_completo).toBe('Juan Perez');
      expect(res.body.total).toBe(1);
    });

    it('should return empty list when no pending verifications', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/admin/verificaciones-pendientes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.verificaciones).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });
  });

  describe('POST /api/v1/admin/verificaciones/:id/revisar', () => {
    it('should reject invalid action', async () => {
      const res = await request(app)
        .post('/api/v1/admin/verificaciones/user-1/revisar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accion: 'invalida' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ACCION_INVALIDA');
    });

    it('should reject if user not found', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/admin/verificaciones/user-not-found/revisar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accion: 'aprobar' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('USUARIO_NO_ENCONTRADO');
    });

    it('should reject if user is not in pendiente_manual state', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'aprobado',
      });

      const res = await request(app)
        .post('/api/v1/admin/verificaciones/user-1/revisar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accion: 'aprobar' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ESTADO_INVALIDO');
    });

    it('should approve pending manual verification', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'pendiente_manual',
      });
      prisma.usuario.update.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'aprobado',
      });

      const res = await request(app)
        .post('/api/v1/admin/verificaciones/user-1/revisar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accion: 'aprobar' });

      expect(res.status).toBe(200);
      expect(res.body.estado).toBe('aprobado');
    });

    it('should reject pending manual verification with motivo', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'pendiente_manual',
      });
      prisma.usuario.update.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'rechazado',
      });

      const res = await request(app)
        .post('/api/v1/admin/verificaciones/user-1/revisar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accion: 'rechazar', motivo: 'Documentos ilegibles' });

      expect(res.status).toBe(200);
      expect(res.body.estado).toBe('rechazado');
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/v1/admin/verificaciones/user-1/revisar')
        .send({ accion: 'aprobar' });

      expect(res.status).toBe(401);
    });
  });
});

describe('Admin Denuncias Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/admin/denuncias-pendientes', () => {
    it('should list pending denuncias', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.denuncia.findMany.mockResolvedValue([
        {
          id: 'den-1',
          id_denunciante: 'user-1',
          id_denunciado: 'user-2',
          id_mandado: 'mand-1',
          motivo: 'acoso',
          descripcion: 'Me acosó después del mandado',
          estado: 'pendiente',
          creado_en: new Date('2026-06-20').toISOString(),
          denunciante: { id: 'user-1', nombre_completo: 'Juan Perez', telefono: '+524421111111' },
          denunciado: { id: 'user-2', nombre_completo: 'Maria Lopez', telefono: '+524422222222' },
          mandado: { id: 'mand-1', titulo: 'Comprar tortillas', estado: 'completado' },
        },
      ]);

      const res = await request(app)
        .get('/api/v1/admin/denuncias-pendientes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.denuncias).toHaveLength(1);
      expect(res.body.denuncias[0].motivo).toBe('acoso');
      expect(res.body.total).toBe(1);
    });

    it('should return empty list when no pending denuncias', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.denuncia.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/admin/denuncias-pendientes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.denuncias).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });
  });

  describe('POST /api/v1/admin/denuncias/:id/resolver', () => {
    it('should reject invalid action', async () => {
      const res = await request(app)
        .post('/api/v1/admin/denuncias/den-1/resolver')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accion: 'invalida' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ACCION_INVALIDA');
    });

    it('should reject if denuncia not found', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.denuncia.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/admin/denuncias/den-not-found/resolver')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accion: 'rechazar_usuario' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('DENUNCIA_NO_ENCONTRADA');
    });

    it('should sanction user when action is rechazar_usuario', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.denuncia.findUnique.mockResolvedValue(
        { id: 'den-1', id_denunciado: 'user-2', estado: 'pendiente' },
      );
      prisma.usuario.update.mockResolvedValue({ id: 'user-2', estado_verificacion: 'rechazado' });
      prisma.denuncia.update.mockResolvedValue({ id: 'den-1', estado: 'aceptada' });

      const res = await request(app)
        .post('/api/v1/admin/denuncias/den-1/resolver')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accion: 'rechazar_usuario' });

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toBe('Usuario sancionado');
    });

    it('should dismiss denuncia when action is desestimar', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.denuncia.findUnique.mockResolvedValue(
        { id: 'den-1', id_denunciado: 'user-2', estado: 'pendiente' },
      );
      prisma.denuncia.update.mockResolvedValue({ id: 'den-1', estado: 'rechazada' });

      const res = await request(app)
        .post('/api/v1/admin/denuncias/den-1/resolver')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accion: 'desestimar' });

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toBe('Denuncia desestimada');
    });

    it('should reject if denuncia is not pending', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.denuncia.findUnique.mockResolvedValue(
        { id: 'den-1', id_denunciado: 'user-2', estado: 'aceptada' },
      );

      const res = await request(app)
        .post('/api/v1/admin/denuncias/den-1/resolver')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accion: 'rechazar_usuario' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ESTADO_INVALIDO');
    });
  });
});
