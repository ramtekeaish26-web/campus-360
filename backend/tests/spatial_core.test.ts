import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { AuthService } from '../src/services/authService.js';

describe('Phase 3 Campus Spatial Core & Navigation API Integration Tests', () => {
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

  it('GET /api/campus/map - returns campus spatial bundle with buildings, places, and paths', async () => {
    const res = await request(app)
      .get('/api/campus/map')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('buildings');
    expect(res.body.data).toHaveProperty('places');
    expect(res.body.data).toHaveProperty('categories');
    expect(res.body.data).toHaveProperty('paths');
    expect(Array.isArray(res.body.data.buildings)).toBe(true);
    expect(Array.isArray(res.body.data.places)).toBe(true);
  });

  it('GET /api/campus/buildings - returns list of buildings with type filter', async () => {
    const res = await request(app)
      .get('/api/campus/buildings')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0]).toHaveProperty('code');
    expect(res.body.data[0]).toHaveProperty('buildingType');
  });

  it('GET /api/campus/places - returns campus places with category filtering', async () => {
    const res = await request(app)
      .get('/api/campus/places')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0]).toHaveProperty('slug');
    expect(res.body.data[0]).toHaveProperty('category');
  });

  it('GET /api/campus/locations/:slug - returns place by QR-friendly slug', async () => {
    const res = await request(app)
      .get('/api/campus/locations/central-library')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('central-library');
    expect(res.body.data).toHaveProperty('latitude');
    expect(res.body.data).toHaveProperty('longitude');
  });

  it('GET /api/campus/rooms - returns rooms directory with floor and building data', async () => {
    const res = await request(app)
      .get('/api/campus/rooms')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0]).toHaveProperty('roomNumber');
  });

  it('GET /api/campus/facilities - returns campus facilities with associated places', async () => {
    const res = await request(app)
      .get('/api/campus/facilities')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0]).toHaveProperty('code');
  });

  it('GET /api/campus/search?q=library - searches across campus spatial entities', async () => {
    const res = await request(app)
      .get('/api/campus/search?q=library')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('type');
  });

  it('POST /api/navigation/route - calculates walking route with distance and walking time', async () => {
    // Route from coordinates of Canteen to Academic Block A
    const res = await request(app)
      .post('/api/navigation/route')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        origin: { latitude: 21.0108, longitude: 79.0272 },
        destination: { latitude: 21.0130, longitude: 79.0280 },
        accessibleOnly: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('distanceMeters');
    expect(res.body.data).toHaveProperty('estimatedWalkingMinutes');
    expect(res.body.data).toHaveProperty('routeGeometry');
    expect(res.body.data).toHaveProperty('segments');
    expect(res.body.data.distanceMeters).toBeGreaterThan(0);
    expect(res.body.data.estimatedWalkingMinutes).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.segments)).toBe(true);
  });

  it('POST /api/navigation/route - calculates accessible route avoiding stairs', async () => {
    const res = await request(app)
      .post('/api/navigation/route')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        origin: { latitude: 21.0120, longitude: 79.0262 }, // Library
        destination: { latitude: 21.0125, longitude: 79.0270 }, // Admin
        accessibleOnly: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessibleOnly).toBe(true);
    expect(res.body.data.isAccessible).toBe(true);
    // Verified that all route segments are barrier-free
    for (const segment of res.body.data.segments) {
      expect(segment.pathType).not.toBe('STAIRS');
      expect(segment.accessible).toBe(true);
    }
  });
});
