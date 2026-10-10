import { Router } from 'express';
import { AIController } from './ai.controller.js';
import { aiRateLimiter } from './ai.ratelimit.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { chatRequestSchema, confirmActionSchema } from './ai.schemas.js';

export const aiRouter = Router();

// Public / Authenticated AI routes
aiRouter.use(requireAuth);

aiRouter.get('/status', AIController.getStatus);
aiRouter.post('/chat', aiRateLimiter, validateBody(chatRequestSchema), AIController.chat);
aiRouter.post('/actions/confirm', validateBody(confirmActionSchema), AIController.confirmAction);
aiRouter.get('/conversations', AIController.getConversations);
aiRouter.delete('/conversations/:id', AIController.deleteConversation);

// Admin AI routes
export const adminAiRouter = Router();
adminAiRouter.use(requireAuth);
adminAiRouter.use(requireRole('ADMIN'));

adminAiRouter.get('/metrics', AIController.getAdminMetrics);
