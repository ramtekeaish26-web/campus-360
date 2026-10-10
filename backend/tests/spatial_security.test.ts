import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { AuthService } from '../src/services/authService.js';

describe('Phase 3 Mandatory Spatial Security & RBAC Tests', () => {
  let studentToken: string;
  let facultyToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@demo.local', password: 'DemoStudent@360' });
    studentToken = studentRes.body.data.token;

    const facultyRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'faculty@demo.local', password: 'DemoFaculty@360' });
    facultyToken = facultyRes.body.data.token;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@demo.local', password: 'DemoAdmin@360' });
    adminToken = adminRes.body.data.token;
  });

  it('STUDENT MUST receive 403 Forbidden on creating building', async () => {
    const res = await request(app)
      .post('/api/admin/campus/buildings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        campusId: '00000000-0000-0000-0000-000000000000',
        name: 'Unauthorized Student Lab',
        code: 'UNAUTH_LAB',
        latitude: 21.0125,
        longitude: 79.0275,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('FACULTY MUST receive 403 Forbidden on creating building', async () => {
    const res = await request(app)
      .post('/api/admin/campus/buildings')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        campusId: '00000000-0000-0000-0000-000000000000',
        name: 'Faculty Experimental Wing',
        code: 'FAC_EXP_WING',
        latitude: 21.0125,
        longitude: 79.0275,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('STUDENT MUST receive 403 Forbidden on registering campus place', async () => {
    const res = await request(app)
      .post('/api/admin/campus/places')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        campusId: '00000000-0000-0000-0000-000000000000',
        categoryId: '00000000-0000-0000-0000-000000000000',
        name: 'Unauthorized Lounge',
        slug: 'unauthorized-lounge',
        latitude: 21.0125,
        longitude: 79.0275,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('STUDENT MUST receive 403 Forbidden on modifying campus paths', async () => {
    const res = await request(app)
      .post('/api/admin/campus/paths')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        campusId: '00000000-0000-0000-0000-000000000000',
        name: 'Secret Shortcut',
        geometry: { type: 'LineString', coordinates: [[79.027, 21.012], [79.028, 21.013]] },
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('ADMIN can access admin spatial management APIs', async () => {
    // Check that admin is authorized (not 401 or 403)
    const res = await request(app)
      .post('/api/admin/campus/facilities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: 'TEST_FACILITY_' + Date.now(),
        name: 'Automated Test EV Charging Station',
        description: 'Rapid charging ports for electric scooters and vehicles.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });
});
