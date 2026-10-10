import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { ROLES } from '../src/constants/roles.js';

describe('Phase 2 Academic Core API Integration Tests', () => {
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

  // 1. Dashboard
  it('GET /api/academic/dashboard - Student receives personalized academic summary', async () => {
    const res = await request(app)
      .get('/api/academic/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe(ROLES.STUDENT);
    expect(res.body.data.enrolledCourses).toBeDefined();
    expect(res.body.data.attendance).toBeDefined();
    expect(res.body.data.todaySchedule).toBeDefined();
  });

  it('GET /api/academic/dashboard - Faculty receives teaching overview', async () => {
    const res = await request(app)
      .get('/api/academic/dashboard')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe(ROLES.FACULTY);
    expect(res.body.data.taughtCourses).toBeDefined();
  });

  // 2. Subjects & Terms
  it('GET /api/academic/subjects - returns list of subjects', async () => {
    const res = await request(app)
      .get('/api/academic/subjects')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/academic/terms - returns academic terms', async () => {
    const res = await request(app)
      .get('/api/academic/terms')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((t: any) => t.status === 'ACTIVE')).toBe(true);
  });

  // 3. Timetable / Schedule
  it('GET /api/academic/schedule - returns enrolled student schedule', async () => {
    const res = await request(app)
      .get('/api/academic/schedule')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // 4. Attendance
  it('GET /api/academic/attendance - student retrieves calculated attendance breakdown', async () => {
    const res = await request(app)
      .get('/api/academic/attendance')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overall).toBeDefined();
    expect(res.body.data.overall.percentage).toBeDefined();
    expect(Array.isArray(res.body.data.subjectBreakdown)).toBe(true);
  });

  // 5. Assignments
  it('GET /api/academic/assignments - returns student assignments', async () => {
    const res = await request(app)
      .get('/api/academic/assignments')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // 6. Exams & Results
  it('GET /api/academic/exams - returns scheduled exams', async () => {
    const res = await request(app)
      .get('/api/academic/exams')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/academic/results - student receives only their own published results', async () => {
    const res = await request(app)
      .get('/api/academic/results')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.gpa).toBeDefined();
    expect(Array.isArray(res.body.data.results)).toBe(true);
  });

  // 7. Academic Calendar
  it('GET /api/academic/calendar - returns institutional calendar events', async () => {
    const res = await request(app)
      .get('/api/academic/calendar')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
