import request from 'supertest';
import { createApp } from '../../src/app';
import { generateTestToken } from '../setup';

const app = createApp();

jest.mock('../../src/config/database', () => ({
  prisma: {
    mandado: {
      findMany: jest.fn(),
    },
    oferta: {
      findMany: jest.fn(),
    },
  },
}));

describe('Mis endpoints', () => {
  const token = generateTestToken('user-1');

  describe('GET /api/v1/mandados/mis-mandados', () => {
    it('should return user mandados', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findMany.mockResolvedValue([
        {
          id: 'm-1',
          titulo: 'Test',
          tipo: 'compra',
          estado: 'publicado',
          fecha_hora_limite: new Date(),
          creado_en: new Date(),
        },
      ]);

      const res = await request(app)
        .get('/api/v1/mandados/mis-mandados')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return empty list when no mandados', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/mandados/mis-mandados')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/api/v1/mandados/mis-mandados');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/ofertas/mis-ofertas', () => {
    it('should return user ofertas', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.oferta.findMany.mockResolvedValue([
        {
          id: 'o-1',
          monto_ofertado: { toString: () => '50.00' },
          estado: 'pendiente',
          creado_en: new Date().toISOString(),
          mandado: {
            id: 'm-1',
            titulo: 'Test',
            tipo: 'compra',
            estado: 'publicado',
            fecha_hora_limite: new Date(),
            solicitante: { id: 'u-1', nombre_completo: 'Juan', puntuacion_promedio: 4.5 },
          },
        },
      ]);

      const res = await request(app)
        .get('/api/v1/ofertas/mis-ofertas')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/api/v1/ofertas/mis-ofertas');
      expect(res.status).toBe(401);
    });
  });
});
