import { Router } from 'express';
import { ServicesController } from '../controllers/servicesController.js';
import { requireAuth } from '../middleware/auth.js';

export const clubsRouter = Router();

clubsRouter.use(requireAuth);

clubsRouter.get('/', ServicesController.getClubs);
clubsRouter.get('/:slug', ServicesController.getClubBySlug);
clubsRouter.post('/:id/join', ServicesController.joinClub);
clubsRouter.delete('/:id/join', ServicesController.leaveClub);
clubsRouter.delete('/:id/leave', ServicesController.leaveClub);
