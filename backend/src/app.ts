import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. CORS Configuration
  const allowedOrigins = [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:5000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, tests)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }
        return callback(new Error('CORS policy does not allow access from specified Origin'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Request Logging (skip in test mode to keep test output clean)
  if (env.NODE_ENV !== 'test') {
    app.use(requestLogger);
  }

  // 5. Mount API Routes under /api
  app.use('/api', apiRouter);

  // Root redirect/status
  app.get('/', (req, res) => {
    res.json({
      name: 'Campus 360 API',
      institution: 'TGPCET Nagpur',
      status: 'online',
      phase: 'Phase 8 - Production Hardening & Judge Readiness',
      documentation: '/docs',
      health: '/api/health',
    });
  });

  // 6. Centralized Error Handler (must be last)
  app.use(errorHandler);

  return app;
}

export const app = createApp();
