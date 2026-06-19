import request from 'supertest';
import { createApp } from '../../src/app';
import { generateTestToken } from '../setup';

const app = createApp();

jest.mock('../../src/config/database', () => ({
  prisma: {
    mandado: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  },
}));

describe('Mandado API', () => {
  const token = generateTestToken('user-1');

  describe('POST /api/v1/mandados', () => {
    it('should create a new mandado', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.create.mockResolvedValue({
        id: 'mandado-1',
        estado: 'publicado',
        creado_en: new Date().toISOString(),
      });

      const res = await request(app)
        .post('/api/v1/mandados')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Comprar tortillas',
          descripcion: 'Necesito 1kg de tortillas de maíz y frijoles',
          tipo: 'compra',
          ubicacion_recogida: {
            lat: 20.588,
            lng: -100.389,
            direccion: 'Av. Principal 123, Centro',
          },
          ubicacion_entrega: {
            lat: 20.59,
            lng: -100.392,
            direccion: 'Calle Secundaria 456, Centro',
          },
          fecha_hora_limite: '2027-06-20T18:00:00Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.estado).toBe('publicado');
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('creado_en');
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/mandados')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Test',
        });

      expect(res.status).toBe(422);
    });

    it('should reject short title', async () => {
      const res = await request(app)
        .post('/api/v1/mandados')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Abc',
          descripcion: 'Descripción muy corta',
          tipo: 'compra',
          ubicacion_recogida: { lat: 20.588, lng: -100.389, direccion: 'Calle 123' },
          ubicacion_entrega: { lat: 20.59, lng: -100.392, direccion: 'Calle 456' },
          fecha_hora_limite: '2027-06-20T18:00:00Z',
        });

      expect(res.status).toBe(422);
    });

    it('should reject past deadline', async () => {
      const res = await request(app)
        .post('/api/v1/mandados')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Mandado de prueba válido',
          descripcion: 'Descripción suficientemente larga para el mandado',
          tipo: 'compra',
          ubicacion_recogida: { lat: 20.588, lng: -100.389, direccion: 'Calle 123' },
          ubicacion_entrega: { lat: 20.59, lng: -100.392, direccion: 'Calle 456' },
          fecha_hora_limite: '2020-01-01T00:00:00Z',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/mandados', () => {
    it('should list mandados with spatial filtering', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.$queryRawUnsafe.mockResolvedValue([
        {
          id: 'mandado-1',
          titulo: 'Comprar tortillas',
          tipo: 'compra',
          ubicacion_recogida_lat: 20.588,
          ubicacion_recogida_lng: -100.389,
          ubicacion_entrega_lat: 20.59,
          ubicacion_entrega_lng: -100.392,
          distancia_km: 2.3,
          fecha_hora_limite: '2027-06-20T18:00:00Z',
          total_ofertas: 3,
          creado_en: new Date().toISOString(),
        },
      ]);
      prisma.mandado.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/mandados')
        .set('Authorization', `Bearer ${token}`)
        .query({ lat: '20.588', lng: '-100.389' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toHaveProperty('distancia_km');
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('should require lat and lng query params', async () => {
      const res = await request(app)
        .get('/api/v1/mandados')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/mandados/:id', () => {
    it('should return mandado detail', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue({
        id: 'mandado-1',
        solicitante: {
          id: 'user-1',
          nombre_completo: 'Juan Pérez',
          puntuacion_promedio: 4.5,
        },
        titulo: 'Comprar tortillas',
        descripcion: 'Necesito 1kg de tortillas',
        tipo: 'compra',
        foto_url: null,
        ubicacion_recogida_lat: 20.588,
        ubicacion_recogida_lng: -100.389,
        direccion_recogida: 'Av. Principal 123',
        ubicacion_entrega_lat: 20.59,
        ubicacion_entrega_lng: -100.392,
        direccion_entrega: 'Calle Secundaria 456',
        fecha_hora_limite: '2027-06-20T18:00:00Z',
        estado: 'publicado',
        ofertas: [],
        creado_en: new Date().toISOString(),
      });

      const res = await request(app)
        .get('/api/v1/mandados/mandado-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.solicitante).toBeDefined();
      expect(res.body.estado).toBe('publicado');
    });

    it('should return 404 for non-existent mandado', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/mandados/non-existent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
