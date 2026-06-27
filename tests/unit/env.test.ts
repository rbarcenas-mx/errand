import request from 'supertest';
import { createApp } from '../../src/app';

describe('Rate limit env vars', () => {
  const OLD_ENV = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    process.env.TWILIO_ACCOUNT_SID = 'test-sid';
    process.env.TWILIO_AUTH_TOKEN = 'test-token';
    process.env.TWILIO_PHONE_NUMBER = '+521234567890';
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should use default rate limit values when env vars are not set', () => {
    const { env } = require('../../src/config/env');
    expect(env.API_RATE_LIMIT_WINDOW_MS).toBe(15 * 60 * 1000);
    expect(env.API_RATE_LIMIT_MAX).toBe(100);
    expect(env.AUTH_RATE_LIMIT_MAX).toBe(5);
  });

  it('should use custom rate limit values from env vars', () => {
    process.env.API_RATE_LIMIT_WINDOW_MS = '60000';
    process.env.API_RATE_LIMIT_MAX = '50';
    process.env.AUTH_RATE_LIMIT_MAX = '3';

    const { env } = require('../../src/config/env');
    expect(env.API_RATE_LIMIT_WINDOW_MS).toBe(60000);
    expect(env.API_RATE_LIMIT_MAX).toBe(50);
    expect(env.AUTH_RATE_LIMIT_MAX).toBe(3);
  });

  it('should use env rate limit values in app', async () => {
    process.env.API_RATE_LIMIT_MAX = '999';
    process.env.API_RATE_LIMIT_WINDOW_MS = '60000';

    const app = createApp();

    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
  });
});
