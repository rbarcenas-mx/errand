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
