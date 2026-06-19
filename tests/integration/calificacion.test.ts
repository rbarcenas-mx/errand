import request from 'supertest';
import { createApp } from '../../src/app';
import { generateTestToken } from '../setup';

const app = createApp();

jest.mock('../../src/config/database', () => ({
  prisma: {
    mandado: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    oferta: {
      findFirst: jest.fn(),
    },
    calificacion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
    },
    usuario: {
      update: jest.fn(),
    },
  },
}));

const UUID_SOLICITANTE = '550e8400-e29b-41d4-a716-446655440001';
const UUID_MANDADERO = '550e8400-e29b-41d4-a716-446655440002';
const UUID_MANDADO = '550e8400-e29b-41d4-a716-446655440003';

describe('Calificacion API', () => {
  const tokenSolicitante = generateTestToken(UUID_SOLICITANTE, 'aprobado');
  const tokenNoVerificado = generateTestToken('user-noverif', 'rechazado');

  describe('POST /api/v1/calificaciones', () => {
    it('should allow rating after completion', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue({
        id: UUID_MANDADO,
        id_solicitante: UUID_SOLICITANTE,
        estado: 'completado',
        ofertas: [
          {
            id_mandadero: UUID_MANDADERO,
            estado: 'aceptada',
          },
        ],
      });
      prisma.calificacion.findUnique.mockResolvedValue(null);
      prisma.calificacion.create.mockResolvedValue({
        id: 'cal-1',
        creado_en: new Date().toISOString(),
      });
      prisma.calificacion.aggregate.mockResolvedValue({
        _avg: { puntuacion: 4.5 },
        _count: { puntuacion: 10 },
      });
      prisma.usuario.update.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/calificaciones')
        .set('Authorization', `Bearer ${tokenSolicitante}`)
        .send({
          id_mandado: UUID_MANDADO,
          id_calificado: UUID_MANDADERO,
          puntuacion: 5,
          comentario: 'Excelente servicio',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('should reject rating non-completed mandado', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue({
        id: UUID_MANDADO,
        id_solicitante: UUID_SOLICITANTE,
        estado: 'publicado',
        ofertas: [],
      });

      const res = await request(app)
        .post('/api/v1/calificaciones')
        .set('Authorization', `Bearer ${tokenSolicitante}`)
        .send({
          id_mandado: UUID_MANDADO,
          id_calificado: UUID_MANDADERO,
          puntuacion: 5,
        });

      expect(res.status).toBe(400);
    });

    it('should reject self-rating', async () => {
      const res = await request(app)
        .post('/api/v1/calificaciones')
        .set('Authorization', `Bearer ${tokenSolicitante}`)
        .send({
          id_mandado: UUID_MANDADO,
          id_calificado: UUID_SOLICITANTE,
          puntuacion: 5,
        });

      expect(res.status).toBe(400);
    });

    it('should reject non-participant rating', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue({
        id: UUID_MANDADO,
        id_solicitante: '550e8400-e29b-41d4-a716-446655449999',
        estado: 'completado',
        ofertas: [
          {
            id_mandadero: UUID_MANDADERO,
            estado: 'aceptada',
          },
        ],
      });

      const res = await request(app)
        .post('/api/v1/calificaciones')
        .set('Authorization', `Bearer ${tokenSolicitante}`)
        .send({
          id_mandado: UUID_MANDADO,
          id_calificado: UUID_MANDADERO,
          puntuacion: 5,
        });

      expect(res.status).toBe(403);
    });

    it('should reject duplicate ratings', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue({
        id: UUID_MANDADO,
        id_solicitante: UUID_SOLICITANTE,
        estado: 'completado',
        ofertas: [
          {
            id_mandadero: UUID_MANDADERO,
            estado: 'aceptada',
          },
        ],
      });
      prisma.calificacion.findUnique.mockResolvedValue({ id: 'cal-1' });

      const res = await request(app)
        .post('/api/v1/calificaciones')
        .set('Authorization', `Bearer ${tokenSolicitante}`)
        .send({
          id_mandado: UUID_MANDADO,
          id_calificado: UUID_MANDADERO,
          puntuacion: 5,
        });

      expect(res.status).toBe(409);
    });

    it('should reject unverified users from rating', async () => {
      const res = await request(app)
        .post('/api/v1/calificaciones')
        .set('Authorization', `Bearer ${tokenNoVerificado}`)
        .send({
          id_mandado: UUID_MANDADO,
          id_calificado: UUID_MANDADERO,
          puntuacion: 5,
        });

      expect(res.status).toBe(403);
    });

    it('should reject invalid rating values', async () => {
      const res = await request(app)
        .post('/api/v1/calificaciones')
        .set('Authorization', `Bearer ${tokenSolicitante}`)
        .send({
          id_mandado: UUID_MANDADO,
          id_calificado: UUID_MANDADERO,
          puntuacion: 0,
        });

      expect(res.status).toBe(422);
    });
  });
});
