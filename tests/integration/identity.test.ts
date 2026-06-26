import request from 'supertest';
import { createApp } from '../../src/app';
import { generateTestToken } from '../setup';

const app = createApp();

jest.mock('../../src/config/database', () => ({
  prisma: {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../src/services/storage.service', () => ({
  storageService: {
    uploadImage: jest.fn().mockResolvedValue('https://cloudinary.com/test/image.jpg'),
    uploadMultiple: jest.fn().mockResolvedValue(['url1', 'url2']),
    deleteImage: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../src/services/notification.service', () => ({
  notificationService: {
    sendOTP: jest.fn(),
    notifyNuevaOferta: jest.fn(),
    notifyOfertaAceptada: jest.fn(),
    notifyVerificacionCompleta: jest.fn(),
  },
}));

describe('Identity Verification API', () => {
  describe('POST /api/v1/auth/identity/upload', () => {
    it('should upload INE image and update status', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'pendiente',
        foto_ine_url: null,
        foto_vivo_url: null,
      });
      prisma.usuario.update.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'pendiente',
        foto_ine_url: 'https://cloudinary.com/ine.jpg',
        foto_vivo_url: null,
      });

      const token = generateTestToken('user-1', 'pendiente');

      const res = await request(app)
        .post('/api/v1/auth/identity/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('tipo', 'ine')
        .attach('archivo', Buffer.from('fake-image'), 'ine.jpg');

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toContain('INE');
    });

    it('should upload selfie and update status', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'pendiente',
        foto_ine_url: 'https://cloudinary.com/ine.jpg',
        foto_vivo_url: null,
      });
      prisma.usuario.update.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'en_revision',
        foto_ine_url: 'https://cloudinary.com/ine.jpg',
        foto_vivo_url: 'https://cloudinary.com/selfie.jpg',
      });

      const token = generateTestToken('user-1', 'pendiente');

      const res = await request(app)
        .post('/api/v1/auth/identity/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('tipo', 'selfie')
        .attach('archivo', Buffer.from('fake-selfie'), 'selfie.jpg');

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toContain('selfie');
    });

    it('should reject unauthenticated upload', async () => {
      const res = await request(app)
        .post('/api/v1/auth/identity/upload')
        .field('tipo', 'ine')
        .attach('archivo', Buffer.from('fake'), 'ine.jpg');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/identity/reintentar', () => {
    it('should allow retry after rejection', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'rechazado',
        foto_ine_url: 'https://cloudinary.com/ine-old.jpg',
        foto_vivo_url: null,
      });
      prisma.usuario.update.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'pendiente',
        foto_ine_url: null,
        foto_vivo_url: null,
      });

      const token = generateTestToken('user-1', 'rechazado');

      const res = await request(app)
        .post('/api/v1/auth/identity/reintentar')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.estado).toBe('pendiente');
    });

    it('should reject retry for non-rejected users', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'aprobado',
      });

      const token = generateTestToken('user-1', 'aprobado');

      const res = await request(app)
        .post('/api/v1/auth/identity/reintentar')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/verification-status', () => {
    it('should return pending status for new user', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'pendiente',
        foto_ine_url: null,
        foto_vivo_url: null,
      });

      const token = generateTestToken('user-1', 'pendiente');

      const res = await request(app)
        .get('/api/v1/auth/verification-status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.estado).toBe('pendiente');
      expect(res.body.documento_recibido).toBe(false);
      expect(res.body.foto_vivo_recibida).toBe(false);
    });

    it('should return approved status', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        estado_verificacion: 'aprobado',
        foto_ine_url: 'https://cloudinary.com/ine.jpg',
        foto_vivo_url: 'https://cloudinary.com/selfie.jpg',
      });

      const token = generateTestToken('user-1', 'aprobado');

      const res = await request(app)
        .get('/api/v1/auth/verification-status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.estado).toBe('aprobado');
      expect(res.body.documento_recibido).toBe(true);
      expect(res.body.foto_vivo_recibida).toBe(true);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/auth/verification-status');

      expect(res.status).toBe(401);
    });
  });
});
