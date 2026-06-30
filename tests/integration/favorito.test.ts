import request from 'supertest';
import { createApp } from '../../src/app';
import { generateTestToken } from '../setup';

const app = createApp();

jest.mock('../../src/config/database', () => ({
  prisma: {
    favorito: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Favoritos API', () => {
  const token = generateTestToken('550e8400-e29b-41d4-a716-446655440001');
  const mandaderoUuid = '550e8400-e29b-41d4-a716-446655440002';

  describe('POST /api/v1/favoritos', () => {
    it('should create a favorite', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.favorito.findUnique.mockResolvedValue(null);
      prisma.favorito.create.mockResolvedValue({
        id: 'fav-1',
        id_mandadero: mandaderoUuid,
        creado_en: new Date().toISOString(),
      });

      const res = await request(app)
        .post('/api/v1/favoritos')
        .set('Authorization', `Bearer ${token}`)
        .send({ id_mandadero: mandaderoUuid });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.id_mandadero).toBe(mandaderoUuid);
    });

    it('should reject self-favorite', async () => {
      const res = await request(app)
        .post('/api/v1/favoritos')
        .set('Authorization', `Bearer ${token}`)
        .send({ id_mandadero: '550e8400-e29b-41d4-a716-446655440001' });

      expect(res.status).toBe(400);
    });

    it('should reject duplicate', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.favorito.findUnique.mockResolvedValue({ id: 'fav-1' });

      const res = await request(app)
        .post('/api/v1/favoritos')
        .set('Authorization', `Bearer ${token}`)
        .send({ id_mandadero: mandaderoUuid });

      expect(res.status).toBe(409);
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app)
        .post('/api/v1/favoritos')
        .send({ id_mandadero: mandaderoUuid });

      expect(res.status).toBe(401);
    });

    it('should reject invalid uuid', async () => {
      const res = await request(app)
        .post('/api/v1/favoritos')
        .set('Authorization', `Bearer ${token}`)
        .send({ id_mandadero: 'not-a-uuid' });

      expect(res.status).toBe(422);
    });
  });

  describe('DELETE /api/v1/favoritos/:id_mandadero', () => {
    it('should delete a favorite', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.favorito.findUnique.mockResolvedValue({ id: 'fav-1' });
      prisma.favorito.delete.mockResolvedValue({ id: 'fav-1' });

      const res = await request(app)
        .delete(`/api/v1/favoritos/${mandaderoUuid}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 when not found', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.favorito.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/v1/favoritos/${mandaderoUuid}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app).delete(`/api/v1/favoritos/${mandaderoUuid}`);

      expect(res.status).toBe(401);
    });
  });
});
