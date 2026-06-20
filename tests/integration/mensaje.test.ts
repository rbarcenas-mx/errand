import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

let solicitanteToken: string;
let mandaderoToken: string;
let thirdPartyToken: string;
let mandadoId: string;
let ofertaId: string;

beforeAll(async () => {
  await request(app)
    .post('/api/v1/auth/register')
    .send({ nombre_completo: 'Solicitante Chat', telefono: '+521111000001', correo_electronico: 'chat1@test.com' });
  const verifySolicitante = await request(app)
    .post('/api/v1/auth/verify-otp')
    .send({ telefono: '+521111000001', codigo: '123456' });
  solicitanteToken = verifySolicitante.body.token;

  await request(app)
    .post('/api/v1/auth/register')
    .send({ nombre_completo: 'Mandadero Chat', telefono: '+521111000002', correo_electronico: 'chat2@test.com' });
  const verifyMandadero = await request(app)
    .post('/api/v1/auth/verify-otp')
    .send({ telefono: '+521111000002', codigo: '123456' });
  mandaderoToken = verifyMandadero.body.token;

  await request(app)
    .post('/api/v1/auth/register')
    .send({ nombre_completo: 'Third Party', telefono: '+521111000003', correo_electronico: 'chat3@test.com' });
  const verifyThird = await request(app)
    .post('/api/v1/auth/verify-otp')
    .send({ telefono: '+521111000003', codigo: '123456' });
  thirdPartyToken = verifyThird.body.token;
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
      ubicacion_entrega: { lat: 20.590, lng: -100.392, direccion: 'Calle Secundaria 456' },
      fecha_hora_limite: new Date(Date.now() + 86400000).toISOString(),
    });
  mandadoId = mandado.body.id;

  const oferta = await request(app)
    .post(`/api/v1/mandados/${mandadoId}/ofertas`)
    .set('Authorization', `Bearer ${mandaderoToken}`)
    .send({ monto_ofertado: 50 });
  ofertaId = oferta.body.id;
});

describe('Mensajería Interna - GET /api/v1/mandados/:id/mensajes', () => {
  it('debe devolver 403 si no hay oferta aceptada', async () => {
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
    const res = await request(app)
      .get(`/api/v1/mandados/${mandadoId}/mensajes`);
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
