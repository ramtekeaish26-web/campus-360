import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Security & Role-Based Access Control (RBAC) - Mandatory Requirement 22', () => {
  it('STUDENT role MUST receive 403 Forbidden on GET /api/admin/users', async () => {
    // 1. Authenticate as STUDENT
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@demo.local',
        password: 'any-password',
      });

    const studentToken = loginRes.body.data.token;
    expect(studentToken).toBeDefined();

    // 2. Attempt admin endpoint access
    const adminRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.success).toBe(false);
    expect(adminRes.body.error.code).toBe('FORBIDDEN');
    expect(adminRes.body.error.message).toBe(
      'You do not have permission to perform this action.'
    );
  });

  it('FACULTY role MUST receive 403 Forbidden on GET /api/admin/users', async () => {
    // 1. Authenticate as FACULTY
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'faculty@demo.local',
        password: 'any-password',
      });

    const facultyToken = loginRes.body.data.token;
    expect(facultyToken).toBeDefined();

    // 2. Attempt admin endpoint access
    const adminRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.success).toBe(false);
    expect(adminRes.body.error.code).toBe('FORBIDDEN');
    expect(adminRes.body.error.message).toBe(
      'You do not have permission to perform this action.'
    );
  });

  it('ADMIN role MUST receive 200 OK on GET /api/admin/users', async () => {
    // 1. Authenticate as ADMIN
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@demo.local',
        password: 'any-password',
      });

    const adminToken = loginRes.body.data.token;
    expect(adminToken).toBeDefined();

    // 2. Attempt admin endpoint access
    const adminRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    expect(adminRes.body.data.users).toBeDefined();
    expect(Array.isArray(adminRes.body.data.users)).toBe(true);
  });

  it('Unauthenticated request MUST receive 401 Unauthorized on GET /api/admin/users', async () => {
    const res = await request(app).get('/api/admin/users');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
