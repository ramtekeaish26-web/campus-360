import { Router } from 'express';
import { ServicesController } from '../controllers/servicesController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createFeedbackSchema } from '../validators/servicesValidators.js';

export const feedbackRouter = Router();

feedbackRouter.use(requireAuth);

feedbackRouter.post('/', validateBody(createFeedbackSchema), ServicesController.submitFeedback);
feedbackRouter.get('/', requireRole('ADMIN'), ServicesController.getFeedback);
