import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Auth API - /api/auth', () => {
  it('should authenticate student with demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@demo.local',
        password: 'any-password',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('student@demo.local');
    expect(res.body.data.user.roles).toContain('STUDENT');
  });

  it('should authenticate faculty with demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'faculty@demo.local',
        password: 'any-password',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('faculty@demo.local');
    expect(res.body.data.user.roles).toContain('FACULTY');
  });

  it('should authenticate admin with demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@demo.local',
        password: 'any-password',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@demo.local');
    expect(res.body.data.user.roles).toContain('ADMIN');
  });

  it('should restore session with valid Bearer token on GET /api/auth/me', async () => {
    // 1. Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@demo.local',
        password: 'any-password',
      });

    const token = loginRes.body.data.token;

    // 2. Fetch /api/auth/me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe('student@demo.local');
    expect(meRes.body.data.user.roles).toContain('STUDENT');
  });

  it('should reject unauthenticated request on GET /api/auth/me with 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject invalid token on GET /api/auth/me with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-value');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('should logout user on POST /api/auth/logout', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@demo.local',
        password: 'any-password',
      });

    const token = loginRes.body.data.token;

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
    expect(logoutRes.body.data.sessionCleared).toBe(true);
  });
});
