import { Router } from 'express';
import { ServicesController } from '../controllers/servicesController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createNoticeSchema,
  updateNoticeSchema,
  createEventSchema,
  updateEventSchema,
  createClubSchema,
  updateClubSchema,
  createEmergencyContactSchema,
  updateEmergencyContactSchema,
} from '../validators/servicesValidators.js';

export const adminServicesRouter = Router();

adminServicesRouter.use(requireAuth);
adminServicesRouter.use(requireRole('ADMIN'));

// Notices
adminServicesRouter.post('/notices', validateBody(createNoticeSchema), ServicesController.adminCreateNotice);
adminServicesRouter.patch('/notices/:id', validateBody(updateNoticeSchema), ServicesController.adminUpdateNotice);
adminServicesRouter.delete('/notices/:id', ServicesController.adminDeleteNotice);

// Events
adminServicesRouter.post('/events', validateBody(createEventSchema), ServicesController.adminCreateEvent);
adminServicesRouter.patch('/events/:id', validateBody(updateEventSchema), ServicesController.adminUpdateEvent);
adminServicesRouter.delete('/events/:id', ServicesController.adminDeleteEvent);

// Clubs
adminServicesRouter.post('/clubs', validateBody(createClubSchema), ServicesController.adminCreateClub);
adminServicesRouter.patch('/clubs/:id', validateBody(updateClubSchema), ServicesController.adminUpdateClub);

// Emergency Contacts
adminServicesRouter.post('/emergency', validateBody(createEmergencyContactSchema), ServicesController.adminCreateEmergencyContact);
adminServicesRouter.patch('/emergency/:id', validateBody(updateEmergencyContactSchema), ServicesController.adminUpdateEmergencyContact);
adminServicesRouter.delete('/emergency/:id', ServicesController.adminDeleteEmergencyContact);
