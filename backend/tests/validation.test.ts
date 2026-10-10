import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Validation & Centralized Error Handling', () => {
  it('should return 400 Bad Request when email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-a-valid-email',
        password: 'password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('valid email');
  });

  it('should return 400 Bad Request when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@demo.local',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 Not Found on unknown API routes with consistent error schema', async () => {
    const res = await request(app).get('/api/unknown-feature-endpoint');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toContain('Route not found');
  });
});
