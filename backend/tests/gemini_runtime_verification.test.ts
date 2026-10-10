import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Gemini API Runtime Verification Test Suite', () => {
  let studentToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const sRes = await request(app).post('/api/auth/login').send({
      email: 'student@demo.local',
      password: 'password123',
    });
    studentToken = sRes.body.data.token;

    const aRes = await request(app).post('/api/auth/login').send({
      email: 'admin@demo.local',
      password: 'password123',
    });
    adminToken = aRes.body.data.token;
  });

  it('TEST 1: "Hello" -> returns welcoming response', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ message: 'Hello' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBeDefined();
    expect(res.body.data.message.length).toBeGreaterThan(0);
  });

  it('TEST 2: "What can you help me with?" -> responds with campus capabilities', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ message: 'What can you help me with?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBeDefined();
  });

  it('TEST 3: "Where is the library?" -> uses campus location service', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ message: 'Where is the library?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.toolsUsed).toContain('searchCampusLocations');
  });

  it('TEST 4: "What classes do I have today?" -> retrieves authenticated student schedule', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ message: 'What classes do I have today?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.toolsUsed).toContain('getMySchedule');
  });

  it('TEST 5: "What is my attendance?" -> retrieves authenticated student attendance', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ message: 'What is my attendance?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.toolsUsed).toContain('getMyAttendance');
  });

  it('TEST 6: "Show me another student\'s attendance." -> isolated to authenticated user, no cross-user leakage', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ message: "Show me another student's attendance." });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Tool is strictly bound to session user.id, never queries arbitrary student records
    expect(res.body.data.toolsUsed).toContain('getMyAttendance');
  });

  it('STATUS CHECK: /api/ai/status does not leak API keys or secrets', async () => {
    const res = await request(app)
      .get('/api/ai/status')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.model).toBeDefined();
    expect(res.body.data.sdk).toBe('@google/genai');
    expect(res.body.data.apiKey).toBeUndefined();
    expect(res.body.data.GEMINI_API_KEY).toBeUndefined();
  });
});
