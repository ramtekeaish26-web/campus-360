import { Router } from 'express';
import { healthRoutes } from './healthRoutes.js';
import { authRoutes } from './authRoutes.js';
import { userRoutes } from './userRoutes.js';
import { adminRoutes } from './adminRoutes.js';
import academicRoutes from './academicRoutes.js';
import campusRoutes from './campusRoutes.js';
import navigationRoutes from './navigationRoutes.js';
import adminSpatialRoutes from './adminSpatialRoutes.js';
import { noticesRouter } from './noticesRoutes.js';
import { eventsRouter } from './eventsRoutes.js';
import { clubsRouter } from './clubsRoutes.js';
import { servicesRouter } from './servicesRoutes.js';
import { lostFoundRouter } from './lostFoundRoutes.js';
import { emergencyRouter } from './emergencyRoutes.js';
import { feedbackRouter } from './feedbackRoutes.js';
import { notificationsRouter } from './notificationsRoutes.js';
import { adminServicesRouter } from './adminServicesRoutes.js';
import { aiRouter, adminAiRouter } from '../modules/ai/ai.routes.js';
import { analyticsRoutes } from './analyticsRoutes.js';
import { sendError } from '../utils/response.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const apiRouter = Router();

// Mount API route groups
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/admin/campus', adminSpatialRoutes);
apiRouter.use('/admin/services', adminServicesRouter);
apiRouter.use('/admin/ai', adminAiRouter);
apiRouter.use('/academic', academicRoutes);
apiRouter.use('/campus', campusRoutes);
apiRouter.use('/navigation', navigationRoutes);

// Phase 4: Campus Services & Engagement
apiRouter.use('/notices', noticesRouter);
apiRouter.use('/events', eventsRouter);
apiRouter.use('/clubs', clubsRouter);
apiRouter.use('/services', servicesRouter);
apiRouter.use('/lost-found', lostFoundRouter);
apiRouter.use('/emergency', emergencyRouter);
apiRouter.use('/feedback', feedbackRouter);
apiRouter.use('/notifications', notificationsRouter);

// Phase 5: Campus Intelligence & Gemini
apiRouter.use('/ai', aiRouter);

// Phase 6: Smart Campus Intelligence & Analytics
apiRouter.use('/analytics', analyticsRoutes);

// 404 handler for API routes
apiRouter.use('*', (req, res) => {
  sendError(
    res,
    404,
    ERROR_CODES.NOT_FOUND,
    `Cannot ${req.method} ${req.originalUrl} - Route not found on Campus 360 API`
  );
});

export { apiRouter };

