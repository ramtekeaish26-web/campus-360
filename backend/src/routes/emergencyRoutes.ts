import { Router } from 'express';
import { ServicesController } from '../controllers/servicesController.js';
import { requireAuth } from '../middleware/auth.js';

export const emergencyRouter = Router();

emergencyRouter.use(requireAuth);

emergencyRouter.get('/', ServicesController.getEmergencyContacts);
