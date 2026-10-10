import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';
import { checkDatabaseConnection } from '../config/db.js';

export class HealthController {
  static async getHealth(req: Request, res: Response) {
    const isDbConnected = await checkDatabaseConnection();

    const healthData = {
      status: 'healthy',
      institution: 'TGPCET Nagpur',
      platform: 'Campus 360',
      phase: 'Phase 8 - Production Hardening & Judge Readiness',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      database: isDbConnected ? 'connected' : 'degraded',
      services: {
        api: 'operational',
        auth: 'operational',
        database: isDbConnected ? 'operational' : 'degraded',
      },
    };

    return sendSuccess(res, healthData, 200);
  }
}
