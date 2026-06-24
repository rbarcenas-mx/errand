import request from 'supertest';
import { createApp } from '../../src/app';
import { generateTestToken } from '../setup';

const app = createApp();

jest.mock('../../src/config/database', () => ({
  prisma: {
    mandado: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    oferta: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
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

describe('Offer Flow API', () => {
  const tokenSolicitante = generateTestToken('user-solicitante', 'aprobado');
  const tokenMandadero = generateTestToken('user-mandadero', 'aprobado');
  const tokenNoVerificado = generateTestToken('user-noverif', 'pendiente');

  describe('POST /api/v1/mandados/:id/ofertas', () => {
    it('should create an offer on an active mandado', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue({
        id: 'mandado-1',
        id_solicitante: 'user-solicitante',
        estado: 'publicado',
        titulo: 'Comprar tortillas',
        fecha_hora_limite: new Date(Date.now() + 86400000),
        solicitante: { telefono: '+525551234567' },
      });
      prisma.oferta.findUnique.mockResolvedValue(null);
      prisma.oferta.create.mockResolvedValue({
        id: 'oferta-1',
        estado: 'pendiente',
        creado_en: new Date().toISOString(),
      });

      const res = await request(app)
        .post('/api/v1/mandados/mandado-1/ofertas')
        .set('Authorization', `Bearer ${tokenMandadero}`)
        .send({ monto_ofertado: 50.0 });

      expect(res.status).toBe(201);
      expect(res.body.estado).toBe('pendiente');
      expect(res.body).toHaveProperty('id');
    });

    it('should reject unverified users from creating offers', async () => {
      const res = await request(app)
        .post('/api/v1/mandados/mandado-1/ofertas')
        .set('Authorization', `Bearer ${tokenNoVerificado}`)
        .send({ monto_ofertado: 50.0 });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Verificación');
    });

    it('should prevent offer on own mandado', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue({
        id: 'mandado-1',
        id_solicitante: 'user-solicitante',
        estado: 'publicado',
        fecha_hora_limite: new Date(Date.now() + 86400000),
      });

      const res = await request(app)
        .post('/api/v1/mandados/mandado-1/ofertas')
        .set('Authorization', `Bearer ${tokenSolicitante}`)
        .send({ monto_ofertado: 50.0 });

      expect(res.status).toBe(400);
    });

    it('should prevent duplicate offers', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue({
        id: 'mandado-1',
        id_solicitante: 'user-solicitante',
        estado: 'publicado',
        fecha_hora_limite: new Date(Date.now() + 86400000),
        solicitante: { telefono: '+525551234567' },
      });
      prisma.oferta.findUnique.mockResolvedValue({ id: 'oferta-1' });

      const res = await request(app)
        .post('/api/v1/mandados/mandado-1/ofertas')
        .set('Authorization', `Bearer ${tokenMandadero}`)
        .send({ monto_ofertado: 50.0 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/mandados/:id/ofertas', () => {
    it('should list offers for a mandado (owner only)', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue({
        id: 'mandado-1',
        id_solicitante: 'user-solicitante',
      });
      prisma.oferta.findMany.mockResolvedValue([
        {
          id: 'oferta-1',
          mandadero: {
            id: 'user-mandadero',
            nombre_completo: 'María López',
            puntuacion_promedio: 4.8,
            total_calificaciones: 12,
          },
          monto_ofertado: { toString: () => '50.00' },
          estado: 'pendiente',
          creado_en: new Date().toISOString(),
        },
      ]);

      const res = await request(app)
        .get('/api/v1/mandados/mandado-1/ofertas')
        .set('Authorization', `Bearer ${tokenSolicitante}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should reject non-owner listing offers', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.mandado.findUnique.mockResolvedValue({
        id: 'mandado-1',
        id_solicitante: 'user-solicitante',
      });

      const res = await request(app)
        .get('/api/v1/mandados/mandado-1/ofertas')
        .set('Authorization', `Bearer ${tokenMandadero}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/ofertas/:id', () => {
    it('should accept an offer and reveal both contacts', async () => {
      const { prisma } = require('../../src/config/database');
      let findUniqueCallCount = 0;
      prisma.oferta.findUnique.mockImplementation(() => {
        findUniqueCallCount++;
        return Promise.resolve({
          id: 'oferta-1',
          id_mandado: 'mandado-1',
          estado: findUniqueCallCount === 1 ? 'pendiente' : 'aceptada',
          mandado: {
            id_solicitante: 'user-solicitante',
            titulo: 'Comprar tortillas',
            solicitante: {
              id: 'user-solicitante',
              nombre_completo: 'Juan Solicitante',
              telefono: '+525551111111',
            },
          },
          mandadero: {
            id: 'user-mandadero',
            nombre_completo: 'María López',
            telefono: '+525551234567',
          },
        });
      });
      prisma.$transaction.mockImplementation(async (fn: Function) => {
        const tx = {
          oferta: {
            update: jest.fn().mockResolvedValue({ id: 'oferta-1', estado: 'aceptada' }),
            updateMany: jest.fn(),
          },
          mandado: {
            update: jest.fn(),
          },
        };
        return fn(tx);
      });

      const res = await request(app)
        .patch('/api/v1/ofertas/oferta-1')
        .set('Authorization', `Bearer ${tokenSolicitante}`)
        .send({ accion: 'aceptada' });

      expect(res.status).toBe(200);
      expect(res.body.contacto_mandadero).toBeDefined();
      expect(res.body.contacto_mandadero.telefono).toBeDefined();
      expect(res.body.contacto_solicitante).toBeDefined();
      expect(res.body.contacto_solicitante.telefono).toBeDefined();
      expect(res.body.contacto_solicitante.nombre_completo).toBe('Juan Solicitante');
    });

    it('should reject an offer', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.oferta.findUnique.mockResolvedValue({
        id: 'oferta-1',
        id_mandado: 'mandado-1',
        estado: 'pendiente',
        mandado: {
          id_solicitante: 'user-solicitante',
        },
      });
      prisma.oferta.update.mockResolvedValue({
        id: 'oferta-1',
        estado: 'rechazada',
      });

      const res = await request(app)
        .patch('/api/v1/ofertas/oferta-1')
        .set('Authorization', `Bearer ${tokenSolicitante}`)
        .send({ accion: 'rechazada' });

      expect(res.status).toBe(200);
      expect(res.body.estado).toBe('rechazada');
    });

    it('should reject non-solicitante patching offer', async () => {
      const { prisma } = require('../../src/config/database');
      prisma.oferta.findUnique.mockResolvedValue({
        id: 'oferta-1',
        id_mandado: 'mandado-1',
        estado: 'pendiente',
        mandado: {
          id_solicitante: 'user-solicitante',
        },
      });

      const res = await request(app)
        .patch('/api/v1/ofertas/oferta-1')
        .set('Authorization', `Bearer ${tokenMandadero}`)
        .send({ accion: 'aceptada' });

      expect(res.status).toBe(403);
    });
  });
});
