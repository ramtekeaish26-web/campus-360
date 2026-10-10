import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Phase 4 Mandatory Services Security & RBAC Isolation Tests', () => {
  let student1Token: string;
  let student2Token: string;
  let facultyToken: string;
  let adminToken: string;
  let student1RequestId: string;

  beforeAll(async () => {
    // 1. Authenticate Student 1
    const s1Res = await request(app).post('/api/auth/login').send({
      email: 'student@demo.local',
      password: 'password123',
    });
    student1Token = s1Res.body.data.token;

    // 2. Authenticate Student 2 (student2@demo.local)
    const s2Res = await request(app).post('/api/auth/login').send({
      email: 'student2@demo.local',
      password: 'password123',
    });
    student2Token = s2Res.body.data.token;

    // 3. Authenticate Faculty
    const fRes = await request(app).post('/api/auth/login').send({
      email: 'faculty@demo.local',
      password: 'password123',
    });
    facultyToken = fRes.body.data.token;

    // 4. Authenticate Admin
    const aRes = await request(app).post('/api/auth/login').send({
      email: 'admin@demo.local',
      password: 'password123',
    });
    adminToken = aRes.body.data.token;

    // Create a private request by Student 1
    const reqRes = await request(app)
      .post('/api/services/requests')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        title: 'Private Student 1 Dorm electrical issue',
        description: 'Personal room socket short-circuit.',
        category: 'ELECTRICAL',
        priority: 'MEDIUM',
      });

    student1RequestId = reqRes.body.data.request.id;
  });

  it('1. STUDENT 2 MUST receive 403 Forbidden when attempting to access Student 1 private service request', async () => {
    const res = await request(app)
      .get(`/api/services/requests/${student1RequestId}`)
      .set('Authorization', `Bearer ${student2Token}`);

    expect(res.status).toBe(403);
  });

  it('2. STUDENT MUST receive 403 Forbidden when attempting to modify service request status', async () => {
    const res = await request(app)
      .patch(`/api/services/requests/${student1RequestId}/status`)
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        status: 'RESOLVED',
      });

    expect(res.status).toBe(403);
  });

  it('3. STUDENT MUST receive 403 Forbidden on publishing official campus notices', async () => {
    const res = await request(app)
      .post('/api/admin/services/notices')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        title: 'Unauthorized student notice',
        summary: 'Fake circular',
        content: 'This should be blocked',
        category: 'GENERAL',
        priority: 'NORMAL',
        audience: 'ALL',
      });

    expect(res.status).toBe(403);
  });

  it('4. FACULTY MUST receive 403 Forbidden on publishing admin emergency contacts', async () => {
    const res = await request(app)
      .post('/api/admin/services/emergency')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        name: 'Unauthorized contact',
        category: 'CAMPUS_SECURITY',
        phone: '100',
        instructions: 'Test',
      });

    expect(res.status).toBe(403);
  });

  it('5. ADMIN role MUST successfully access admin services overview and publish official notice', async () => {
    const res = await request(app)
      .post('/api/admin/services/notices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Official Autonomous End-Semester Notice',
        summary: 'Verified institutional announcement',
        content: 'Comprehensive guidelines published by Controller of Examinations.',
        category: 'EXAM',
        priority: 'IMPORTANT',
        audience: 'STUDENT',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.notice.title).toBe('Official Autonomous End-Semester Notice');
  });
});
