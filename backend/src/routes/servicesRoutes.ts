import { Router } from 'express';
import { ServicesController } from '../controllers/servicesController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createServiceRequestSchema,
  createServiceRequestCommentSchema,
  updateServiceRequestStatusSchema,
} from '../validators/servicesValidators.js';

export const servicesRouter = Router();

servicesRouter.use(requireAuth);

servicesRouter.get('/categories', ServicesController.getServiceCategories);
servicesRouter.get('/directory', ServicesController.getServiceDirectory);
servicesRouter.get('/requests', ServicesController.getServiceRequests);
servicesRouter.post('/requests', validateBody(createServiceRequestSchema), ServicesController.createServiceRequest);
servicesRouter.get('/requests/:id', ServicesController.getServiceRequestById);
servicesRouter.patch(
  '/requests/:id/status',
  validateBody(updateServiceRequestStatusSchema),
  ServicesController.updateServiceRequestStatus
);
servicesRouter.post(
  '/requests/:id/comments',
  validateBody(createServiceRequestCommentSchema),
  ServicesController.addServiceRequestComment
);
servicesRouter.post('/requests/:id/close', ServicesController.closeServiceRequest);
