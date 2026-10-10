import { Router } from 'express';
import { ServicesController } from '../controllers/servicesController.js';
import { requireAuth } from '../middleware/auth.js';

export const eventsRouter = Router();

eventsRouter.use(requireAuth);

eventsRouter.get('/', ServicesController.getEvents);
eventsRouter.get('/:id', ServicesController.getEventById);
eventsRouter.post('/:id/register', ServicesController.registerForEvent);
eventsRouter.delete('/:id/register', ServicesController.cancelEventRegistration);
