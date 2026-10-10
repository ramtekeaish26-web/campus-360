import { Router } from 'express';
import { ServicesController } from '../controllers/servicesController.js';
import { requireAuth } from '../middleware/auth.js';

export const noticesRouter = Router();

noticesRouter.use(requireAuth);

noticesRouter.get('/', ServicesController.getNotices);
noticesRouter.get('/:id', ServicesController.getNoticeById);
noticesRouter.post('/:id/read', ServicesController.markNoticeAsRead);
