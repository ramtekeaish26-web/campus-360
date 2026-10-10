import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('User Profile API - /api/users/me', () => {
  let studentToken: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@demo.local',
        password: 'any-password',
      });
    studentToken = loginRes.body.data.token;
  });

  it('GET /api/users/me returns authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('student@demo.local');
    expect(res.body.data.user.roles).toContain('STUDENT');
    expect(res.body.data.user.profile).toBeDefined();
    expect(res.body.data.user.profile.firstName).toBeDefined();
  });

  it('PATCH /api/users/me updates permitted fields (bio, phone)', async () => {
    const updatePayload = {
      bio: 'Updated bio for IoT and Embedded Systems lead',
      phone: '+91 99887 76655',
    };

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.profile.bio).toBe(updatePayload.bio);
    expect(res.body.data.user.profile.phone).toBe(updatePayload.phone);
  });

  it('PATCH /api/users/me rejects modifications to immutable fields (role, email, isActive, prn)', async () => {
    const maliciousPayload = {
      role: 'ADMIN',
      email: 'hacked@admin.local',
      isActive: false,
      prn: 'PRN-HACKED-999',
    };

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(maliciousPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/users/me rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
