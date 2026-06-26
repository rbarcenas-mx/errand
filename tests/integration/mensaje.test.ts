import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { generateTestToken } from '../setup';

const app = createApp();

const SOLICITANTE_ID = '00000000-0000-0000-0000-000000000001';
const MANDADERO_ID = '00000000-0000-0000-0000-000000000002';
const THIRD_ID = '00000000-0000-0000-0000-000000000003';

let solicitanteToken: string;
let mandaderoToken: string;
let thirdPartyToken: string;
let mandadoId: string;
let ofertaId: string;

beforeAll(async () => {
  await prisma.usuario.upsert({
    where: { telefono: '+521111000001' },
    update: { id: SOLICITANTE_ID, estado_verificacion: 'aprobado' },
    create: {
      id: SOLICITANTE_ID,
      nombre_completo: 'Solicitante Chat',
      telefono: '+521111000001',
      correo_electronico: 'chat1@test.com',
      estado_verificacion: 'aprobado',
    },
  });
  await prisma.usuario.upsert({
    where: { telefono: '+521111000002' },
    update: { id: MANDADERO_ID, estado_verificacion: 'aprobado' },
    create: {
      id: MANDADERO_ID,
      nombre_completo: 'Mandadero Chat',
      telefono: '+521111000002',
      correo_electronico: 'chat2@test.com',
      estado_verificacion: 'aprobado',
    },
  });
  await prisma.usuario.upsert({
    where: { telefono: '+521111000003' },
    update: { id: THIRD_ID, estado_verificacion: 'aprobado' },
    create: {
      id: THIRD_ID,
      nombre_completo: 'Third Party',
      telefono: '+521111000003',
      correo_electronico: 'chat3@test.com',
      estado_verificacion: 'aprobado',
    },
  });

  solicitanteToken = generateTestToken(SOLICITANTE_ID, 'aprobado');
  mandaderoToken = generateTestToken(MANDADERO_ID, 'aprobado');
  thirdPartyToken = generateTestToken(THIRD_ID, 'aprobado');
});

beforeEach(async () => {
  const mandado = await request(app)
    .post('/api/v1/mandados')
    .set('Authorization', `Bearer ${solicitanteToken}`)
    .send({
      titulo: 'Test mensajeria',
      descripcion: 'Para probar chat',
      tipo: 'compra',
      ubicacion_recogida: { lat: 20.588, lng: -100.389, direccion: 'Av. Principal 123' },
      ubicacion_entrega: { lat: 20.59, lng: -100.392, direccion: 'Calle Secundaria 456' },
      fecha_hora_limite: new Date(Date.now() + 86400000).toISOString(),
    });
  mandadoId = mandado.body.id;

  const oferta = await request(app)
    .post(`/api/v1/mandados/${mandadoId}/ofertas`)
    .set('Authorization', `Bearer ${mandaderoToken}`)
    .send({ monto_ofertado: 50 });
  ofertaId = oferta.body.id;
});

afterEach(async () => {
  await prisma.mensaje.deleteMany({ where: { id_mandado: mandadoId } });
  await prisma.oferta.deleteMany({ where: { id_mandado: mandadoId } });
  await prisma.mandado.deleteMany({ where: { id_solicitante: SOLICITANTE_ID } });
});

describe('Mensajería Interna - GET /api/v1/mandados/:id/mensajes', () => {
  it('debe devolver lista vacia si no hay oferta aceptada (solicitante)', async () => {
    const res = await request(app)
      .get(`/api/v1/mandados/${mandadoId}/mensajes`)
      .set('Authorization', `Bearer ${solicitanteToken}`);
    expect(res.status).toBe(200);
    expect(res.body.mensajes).toEqual([]);
  });

  it('debe devolver 403 para usuario no participante', async () => {
    const res = await request(app)
      .get(`/api/v1/mandados/${mandadoId}/mensajes`)
      .set('Authorization', `Bearer ${thirdPartyToken}`);
    expect(res.status).toBe(403);
  });

  it('debe devolver 401 sin token', async () => {
    const res = await request(app).get(`/api/v1/mandados/${mandadoId}/mensajes`);
    expect(res.status).toBe(401);
  });

  it('debe devolver can_escribir true si mandado está publicado', async () => {
    await request(app)
      .patch(`/api/v1/ofertas/${ofertaId}`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ accion: 'aceptada' });

    const res = await request(app)
      .get(`/api/v1/mandados/${mandadoId}/mensajes`)
      .set('Authorization', `Bearer ${solicitanteToken}`);
    expect(res.status).toBe(200);
    expect(res.body.can_escribir).toBe(true);
  });
});

describe('Mensajería Interna - POST /api/v1/mandados/:id/mensajes', () => {
  it('debe rechazar mensaje vacío', async () => {
    await request(app)
      .patch(`/api/v1/ofertas/${ofertaId}`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ accion: 'aceptada' });

    const res = await request(app)
      .post(`/api/v1/mandados/${mandadoId}/mensajes`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ texto: '' });
    expect(res.status).toBe(400);
  });

  it('debe rechazar mensaje de más de 1000 caracteres', async () => {
    await request(app)
      .patch(`/api/v1/ofertas/${ofertaId}`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ accion: 'aceptada' });

    const res = await request(app)
      .post(`/api/v1/mandados/${mandadoId}/mensajes`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ texto: 'x'.repeat(1001) });
    expect(res.status).toBe(422);
  });

  it('debe permitir enviar mensaje tras oferta aceptada', async () => {
    await request(app)
      .patch(`/api/v1/ofertas/${ofertaId}`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ accion: 'aceptada' });

    const res = await request(app)
      .post(`/api/v1/mandados/${mandadoId}/mensajes`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ texto: 'Hola, gracias por aceptar' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it('debe rechazar mensaje de tercero no participante', async () => {
    await request(app)
      .patch(`/api/v1/ofertas/${ofertaId}`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ accion: 'aceptada' });

    const res = await request(app)
      .post(`/api/v1/mandados/${mandadoId}/mensajes`)
      .set('Authorization', `Bearer ${thirdPartyToken}`)
      .send({ texto: 'Hola' });
    expect(res.status).toBe(403);
  });

  it('debe rechazar mensaje si mandado está completado', async () => {
    await request(app)
      .patch(`/api/v1/ofertas/${ofertaId}`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ accion: 'aceptada' });

    await request(app)
      .patch(`/api/v1/mandados/${mandadoId}/estado`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ estado: 'completado' });

    const res = await request(app)
      .post(`/api/v1/mandados/${mandadoId}/mensajes`)
      .set('Authorization', `Bearer ${solicitanteToken}`)
      .send({ texto: 'Hola' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('CANAL_CERRADO');
  });
});
