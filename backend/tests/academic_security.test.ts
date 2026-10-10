import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { ERROR_CODES } from '../src/constants/errorCodes.js';

describe('Phase 2 Mandatory Security & Authorization Tests (RBAC Isolation)', () => {
  let student1Token: string;
  let student2Token: string;
  let student2Id: string;
  let facultyToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const student1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@demo.local', password: 'DemoStudent@360' });
    student1Token = student1Res.body.data.token;

    const student2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student2@demo.local', password: 'DemoStudent@360' });
    student2Token = student2Res.body.data.token;
    student2Id = student2Res.body.data.user.id;

    const facultyRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'faculty@demo.local', password: 'DemoFaculty@360' });
    facultyToken = facultyRes.body.data.token;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@demo.local', password: 'DemoAdmin@360' });
    adminToken = adminRes.body.data.token;
  });

  it('STUDENT MUST NOT be able to request another student\'s private results (Data Isolation)', async () => {
    const res = await request(app)
      .get(`/api/academic/results?studentId=${student2Id}`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('STUDENT MUST receive 403 Forbidden on recording attendance sessions', async () => {
    const res = await request(app)
      .post('/api/academic/attendance/sessions')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        courseOfferingId: '00000000-0000-0000-0000-000000000000',
        date: new Date().toISOString(),
        startTime: '09:00',
        endTime: '10:00',
        records: [{ studentId: student2Id, status: 'PRESENT' }],
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('STUDENT MUST receive 403 Forbidden on publishing exam results', async () => {
    const res = await request(app)
      .post('/api/academic/results')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        examId: '00000000-0000-0000-0000-000000000000',
        studentId: student2Id,
        marksObtained: 95,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('STUDENT MUST receive 403 Forbidden on creating assignments', async () => {
    const res = await request(app)
      .post('/api/academic/assignments')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        courseOfferingId: '00000000-0000-0000-0000-000000000000',
        title: 'Unauthorized Assignment',
        description: 'Testing RBAC',
        dueDate: new Date().toISOString(),
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('FACULTY MUST receive 403 Forbidden on admin subject management', async () => {
    const res = await request(app)
      .post('/api/academic/admin/subjects')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        code: 'CS999',
        name: 'Unauthorized Subject',
        credits: 4,
        departmentId: '00000000-0000-0000-0000-000000000000',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('ADMIN can create subjects and institutional calendar events', async () => {
    const res = await request(app)
      .post('/api/academic/calendar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Institutional Convocation Ceremony 2026',
        description: 'Autonomous Annual Degree Distribution Ceremony',
        eventType: 'ACADEMIC',
        startDate: new Date('2026-03-15T00:00:00Z').toISOString(),
        endDate: new Date('2026-03-15T23:59:59Z').toISOString(),
        visibility: 'ALL',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Institutional Convocation Ceremony 2026');
  });
});
