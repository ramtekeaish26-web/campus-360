import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Phase 6 Smart Campus Intelligence & Analytics', () => {
  let studentToken: string;
  let facultyToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // 1. Authenticate Student
    const studentRes = await request(app).post('/api/auth/login').send({
      email: 'student@demo.local',
      password: 'password123',
    });
    studentToken = studentRes.body.data.token;

    // 2. Authenticate Faculty
    const facultyRes = await request(app).post('/api/auth/login').send({
      email: 'faculty@demo.local',
      password: 'password123',
    });
    facultyToken = facultyRes.body.data.token;

    // 3. Authenticate Admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@demo.local',
      password: 'password123',
    });
    adminToken = adminRes.body.data.token;
  });

  describe('1. Role-Based Analytics Access & Isolation', () => {
    it('Student should only receive isolated student analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('STUDENT');
      expect(res.body.data.kpis.overallAttendance).toBeDefined();
      expect(res.body.data.subjectBreakdown).toBeDefined();
      expect(res.body.data.insights.length).toBeGreaterThan(0);
      // Ensure student CANNOT see institutional data
      expect(res.body.data.departmentAttendance).toBeUndefined();
      expect(res.body.data.locationHotspots).toBeUndefined();
    });

    it('Faculty should only receive faculty-scoped course analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('FACULTY');
      expect(res.body.data.kpis.coursesTaught).toBeDefined();
      expect(res.body.data.courses).toBeDefined();
      expect(res.body.data.attendanceDistribution).toBeDefined();
    });

    it('Admin should receive institutional analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('ADMIN');
      expect(res.body.data.kpis.campusWideAttendance).toBeDefined();
      expect(res.body.data.categoryBreakdown.length).toBeGreaterThan(0);
      expect(res.body.data.locationHotspots.length).toBeGreaterThan(0);
      expect(res.body.data.departmentAttendance.length).toBeGreaterThan(0);
    });

    it('Should support date range filters', async () => {
      const res = await request(app)
        .get('/api/analytics/summary?period=7d')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.timeRange).toBe('7d');
    });
  });

  describe('2. AI-Powered Analytics Explanation & Safety', () => {
    it('Should explain metrics in natural language without arbitrary SQL', async () => {
      const res = await request(app)
        .post('/api/analytics/explain')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          question: 'What are the most common campus issues?',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answer).toBeDefined();
      expect(res.body.data.metricsUsed).toBeDefined();
    });

    it('Should validate required question parameter', async () => {
      const res = await request(app)
        .post('/api/analytics/explain')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          question: '',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('3. Export Security & Authorization', () => {
    it('Admin can export CSV analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/export?period=30d')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('TGPCET CAMPUS 360');
      expect(res.text).toContain('INSTITUTIONAL KPIS');
    });

    it('Student CANNOT export CSV analytics (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/analytics/export')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('Unauthenticated requests are rejected (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/analytics/summary');
      expect(res.status).toBe(401);
    });
  });
});
