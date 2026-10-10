import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Phase 5 Campus Intelligence Core APIs', () => {
  let studentToken: string;
  let adminToken: string;
  let pendingActionId: string;
  let conversationId: string;

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

  it('1. GET /api/ai/status - should return AI status and model without exposing secret keys', async () => {
    const res = await request(app)
      .get('/api/ai/status')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.model).toBeDefined();
    expect(res.body.data.sdk).toBe('@google/genai');
    expect(res.body.data.apiKey).toBeUndefined();
    expect(res.body.data.GEMINI_API_KEY).toBeUndefined();
  });

  it('2. POST /api/ai/chat - should answer attendance query with authoritative Phase 2 data', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        message: 'What is my current attendance percentage?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBeDefined();
    expect(res.body.data.toolsUsed).toContain('getMyAttendance');
    expect(res.body.data.sources.length).toBeGreaterThan(0);
    expect(res.body.data.actions.some((a: any) => a.target === '/academic/attendance')).toBe(true);
    conversationId = res.body.data.conversationId;
  });

  it('3. POST /api/ai/chat - should answer schedule query with today timetable', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        message: 'What classes do I have today?',
        conversationId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.toolsUsed).toContain('getMySchedule');
  });

  it('4. POST /api/ai/chat - should answer spatial query using Phase 3 campus map data', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        message: 'Where is the library located?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.toolsUsed).toContain('searchCampusLocations');
    expect(res.body.data.actions.some((a: any) => a.target === '/campus/map')).toBe(true);
  });

  it('5. POST /api/ai/chat - should answer notices query using Phase 4 circulars', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        message: 'What are the latest campus notices?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.toolsUsed).toContain('searchNotices');
  });

  it('6. POST /api/ai/chat - should answer events query with upcoming fests and hackathons', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        message: 'What events are happening this week?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.toolsUsed).toContain('searchEvents');
  });

  it('7. POST /api/ai/chat - should prepare 2-step confirmation for service request creation', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        message: 'The projector is broken in Lab 3, please create a repair ticket',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pendingAction).toBeDefined();
    expect(res.body.data.pendingAction.actionType).toBe('CREATE_SERVICE_REQUEST');
    pendingActionId = res.body.data.pendingAction.actionId;
  });

  it('8. POST /api/ai/actions/confirm - should execute pending write action upon user confirmation', async () => {
    const res = await request(app)
      .post('/api/ai/actions/confirm')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        actionId: pendingActionId,
        decision: 'CONFIRM',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CONFIRMED');
  });

  it('9. GET & DELETE /api/ai/conversations - should manage conversation lifecycle', async () => {
    const listRes = await request(app)
      .get('/api/ai/conversations')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data.conversations)).toBe(true);

    if (conversationId) {
      const delRes = await request(app)
        .delete(`/api/ai/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(delRes.status);
    }
  });
});
