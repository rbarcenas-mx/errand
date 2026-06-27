import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Active routes', () => {
  it('should return 401 for protected route GET /api/v1/auth/verification-status', async () => {
    const res = await request(app).get('/api/v1/auth/verification-status');
    expect(res.status).toBe(401);
  });

  it('should return 401 for protected route GET /api/v1/mandados', async () => {
    const res = await request(app).get('/api/v1/mandados');
    expect(res.status).toBe(401);
  });

  it('should return 404 for nonexistent route', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
  });

  it('should return 404 for nonexistent nested route', async () => {
    const res = await request(app).get('/api/v1/mandados/nonexistent/unknown');
    expect(res.status).toBe(404);
  });
});
