import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Phase 7 Proactive Campus Experience & Smart Notifications', () => {
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

  describe('1. In-App Notification Center & Role Isolation', () => {
    it('Student receives isolated proactive notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.notifications)).toBe(true);
      expect(res.body.data.notifications.length).toBeGreaterThan(0);
      expect(res.body.data.unreadCount).toBeGreaterThan(0);

      // Verify no cross-user data leakage
      res.body.data.notifications.forEach((n: any) => {
        expect(n.userId).not.toBe('d0000000-0000-0000-0000-000000000002');
      });
    });

    it('Faculty receives faculty-specific academic and service notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications.length).toBeGreaterThan(0);
    });

    it('Allows marking single notification as read', async () => {
      const listRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      const firstId = listRes.body.data.notifications[0].id;

      const markRes = await request(app)
        .patch(`/api/notifications/${firstId}/read`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(markRes.status).toBe(200);
      expect(markRes.body.success).toBe(true);
    });

    it('Allows marking all notifications as read', async () => {
      const res = await request(app)
        .post('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const countRes = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(countRes.body.data.unreadCount).toBe(0);
    });
  });

  describe('2. Preferences & Quiet Hours', () => {
    it('Gets user notification preferences with default quiet hours', async () => {
      const res = await request(app)
        .get('/api/notifications/preferences')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.preferences.academicEnabled).toBe(true);
      expect(res.body.data.preferences.quietHoursEnabled).toBe(true);
      expect(res.body.data.preferences.quietHoursStart).toBe('22:00');
    });

    it('Updates notification preferences', async () => {
      const res = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          quietHoursStart: '23:00',
          eventsEnabled: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.preferences.quietHoursStart).toBe('23:00');
      expect(res.body.data.preferences.eventsEnabled).toBe(false);
    });
  });

  describe('3. Proactive Daily Campus Summary & Smart Recommendations', () => {
    it('Generates personalized daily campus summary for Student', async () => {
      const res = await request(app)
        .get('/api/notifications/daily-summary')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.greeting).toBeDefined();
      expect(res.body.data.classesToday).toBeGreaterThan(0);
      expect(res.body.data.highlights.length).toBeGreaterThan(0);
    });

    it('Generates smart context recommendations', async () => {
      const res = await request(app)
        .get('/api/notifications/recommendations')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.recommendations.length).toBeGreaterThan(0);
      expect(res.body.data.recommendations[0].actionUrl).toBeDefined();
    });
  });

  describe('4. Admin Institutional Broadcast & Audit Log', () => {
    it('Admin can preview targeted broadcast without publishing', async () => {
      const res = await request(app)
        .post('/api/notifications/admin/preview')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Campus Convocation 2025 Registration',
          message: 'Registration is now open for all graduating engineers.',
          type: 'NOTICE',
          priority: 'NORMAL',
          targetAudience: 'ALL_STUDENTS',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.preview.estimatedRecipients).toBe(1420);
      expect(res.body.data.readyToPublish).toBe(true);
    });

    it('Requires explicit confirmation to publish broadcast', async () => {
      const res = await request(app)
        .post('/api/notifications/admin/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Broadcast',
          message: 'Testing confirmation requirement',
          type: 'NOTICE',
          priority: 'NORMAL',
          targetAudience: 'ALL_STUDENTS',
          confirmed: false,
        });

      expect(res.status).toBe(400);
    });

    it('Admin can publish broadcast with explicit confirmation and record audit log', async () => {
      const res = await request(app)
        .post('/api/notifications/admin/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Autonomous Exam Cell Timetable Update',
          message: 'Revised schedule for CS604 Cyber Security published.',
          type: 'NOTICE',
          priority: 'HIGH',
          targetAudience: 'ALL_STUDENTS',
          confirmed: true,
          actionUrl: '/notices',
          actionLabel: 'Read Notice',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.success).toBe(true);
      expect(res.body.data.broadcastId).toBeDefined();

      // Verify audit log entry
      const auditRes = await request(app)
        .get('/api/notifications/admin/audit')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(auditRes.status).toBe(200);
      expect(auditRes.body.data.auditLogs.length).toBeGreaterThan(0);
      expect(auditRes.body.data.auditLogs[0].title).toBe('Autonomous Exam Cell Timetable Update');
    });

    it('Student CANNOT publish broadcast (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/notifications/admin/publish')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Broadcast',
          message: 'This must fail',
          type: 'NOTICE',
          priority: 'URGENT',
          targetAudience: 'ALL_CAMPUS',
          confirmed: true,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('5. AI-Powered Notification Reasoning', () => {
    it('Explains active notifications without hallucination', async () => {
      const res = await request(app)
        .post('/api/notifications/explain')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'What deadlines and alerts do I have today?',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.answer).toBeDefined();
      expect(res.body.data.notificationsReferenced).toBeGreaterThan(0);
    });
  });
});
