import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Health API - GET /api/health', () => {
  it('should return 200 OK and healthy status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.status).toBe('healthy');
    expect(response.body.data.institution).toBe('TGPCET Nagpur');
    expect(response.body.data.platform).toBe('Campus 360');
    expect(response.body.data.phase).toBe('Phase 8 - Production Hardening & Judge Readiness');
  });

  it('should return 200 OK on root status endpoint', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Campus 360 API');
    expect(response.body.institution).toBe('TGPCET Nagpur');
  });
});
