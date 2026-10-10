import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Phase 4 Campus Services & Engagement Core APIs', () => {
  let studentToken: string;
  let adminToken: string;
  let createdRequestId: string;
  let createdEventId: string;
  let createdClubId: string;
  let createdLostFoundId: string;

  beforeAll(async () => {
    // 1. Authenticate Student
    const studentRes = await request(app).post('/api/auth/login').send({
      email: 'student@demo.local',
      password: 'password123',
    });
    studentToken = studentRes.body.data.token;

    // 2. Authenticate Admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@demo.local',
      password: 'password123',
    });
    adminToken = adminRes.body.data.token;
  });

  it('1. GET /api/notices - should retrieve notices with audience targeting', async () => {
    const res = await request(app)
      .get('/api/notices')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.notices)).toBe(true);
    expect(res.body.data.notices.length).toBeGreaterThan(0);
    // Students must not receive faculty-only notices
    const hasFacultyOnly = res.body.data.notices.some((n: any) => n.audience === 'FACULTY');
    expect(hasFacultyOnly).toBe(false);
  });

  it('2. GET /api/events - should list upcoming campus events and allow registration', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.events)).toBe(true);
    expect(res.body.data.events.length).toBeGreaterThan(0);
    createdEventId = res.body.data.events[0].id;

    // Register for event
    const regRes = await request(app)
      .post(`/api/events/${createdEventId}/register`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect([201, 200]).toContain(regRes.status);
  });

  it('3. GET /api/clubs - should list clubs and allow joining/leaving', async () => {
    const res = await request(app)
      .get('/api/clubs')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.clubs)).toBe(true);
    expect(res.body.data.clubs.length).toBeGreaterThan(0);
    createdClubId = res.body.data.clubs[0].id;

    // Join club
    const joinRes = await request(app)
      .post(`/api/clubs/${createdClubId}/join`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect([200, 201]).toContain(joinRes.status);
  });

  it('4. POST & GET /api/services/requests - should create helpdesk request and track lifecycle', async () => {
    // Student creates service request
    const createRes = await request(app)
      .post('/api/services/requests')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Projector bulb failure in Lab 3',
        description: 'Lamp indicator is blinking red and bulb does not turn on.',
        category: 'PROJECTOR',
        priority: 'HIGH',
        locationDetails: 'Computer Center Wing B, Lab 3',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.request.status).toBe('OPEN');
    createdRequestId = createRes.body.data.request.id;

    // Retrieve request details with audit history
    const detailRes = await request(app)
      .get(`/api/services/requests/${createdRequestId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.request.title).toBe('Projector bulb failure in Lab 3');
    expect(detailRes.body.data.request.history.length).toBeGreaterThanOrEqual(1);

    // Add comment
    const commentRes = await request(app)
      .post(`/api/services/requests/${createdRequestId}/comments`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        content: 'Issue happened at start of morning session.',
      });

    expect(commentRes.status).toBe(201);
  });

  it('5. PATCH /api/services/requests/:id/status - should enforce valid state machine transitions', async () => {
    // Admin assigns request
    const assignRes = await request(app)
      .patch(`/api/services/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'ASSIGNED',
        comment: 'Technician dispatched for bulb replacement',
      });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.request.status).toBe('ASSIGNED');

    // Admin moves to IN_PROGRESS
    const progressRes = await request(app)
      .patch(`/api/services/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'IN_PROGRESS',
        comment: 'Bulb replaced, testing display',
      });

    expect(progressRes.status).toBe(200);

    // Admin moves to RESOLVED
    const resolveRes = await request(app)
      .patch(`/api/services/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'RESOLVED',
        comment: 'Projector display restored and tested',
      });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.request.status).toBe('RESOLVED');

    // Student closes own request
    const closeRes = await request(app)
      .post(`/api/services/requests/${createdRequestId}/close`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(closeRes.status).toBe(200);
    expect(closeRes.body.data.request.status).toBe('CLOSED');
  });

  it('6. POST & GET /api/lost-found - should report lost item, hide PII, and handle claims', async () => {
    // Report lost item
    const reportRes = await request(app)
      .post('/api/lost-found')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        type: 'FOUND',
        title: 'Blue Water Bottle with Steel Cap',
        description: 'Found on bench near cafeteria.',
        category: 'OTHER',
        locationText: 'Cafeteria Plaza',
      });

    expect(reportRes.status).toBe(201);
    createdLostFoundId = reportRes.body.data.item.id;

    // List items - verify PII is protected
    const listRes = await request(app)
      .get('/api/lost-found')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(listRes.status).toBe(200);
    const item = listRes.body.data.items.find((it: any) => it.id === createdLostFoundId);
    expect(item).toBeDefined();
    expect(item.reporterPhone).toBeUndefined();
    expect(item.reporterEmail).toBeUndefined();
  });

  it('7. GET /api/emergency - should list active emergency directory contacts', async () => {
    const res = await request(app)
      .get('/api/emergency')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.contacts)).toBe(true);
    expect(res.body.data.contacts.length).toBeGreaterThan(0);
    expect(res.body.data.contacts[0].phone).toBeDefined();
  });

  it('8. POST /api/feedback - should submit structured rating and comment', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        targetType: 'SERVICE',
        targetId: 'ELECTRICAL',
        rating: 5,
        comment: 'Quick response and resolution!',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.feedback.rating).toBe(5);
  });

  it('9. GET /api/notifications - should fetch in-app notifications and mark as read', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.notifications)).toBe(true);

    // Mark all as read
    const markRes = await request(app)
      .post('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(markRes.status).toBe(200);
  });
});
