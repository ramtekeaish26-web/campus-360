import { Router } from 'express';
import { ServicesController } from '../controllers/servicesController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createLostFoundItemSchema,
  createLostFoundClaimSchema,
  moderateLostFoundClaimSchema,
} from '../validators/servicesValidators.js';

export const lostFoundRouter = Router();

lostFoundRouter.use(requireAuth);

lostFoundRouter.get('/', ServicesController.getLostFoundItems);
lostFoundRouter.post('/', validateBody(createLostFoundItemSchema), ServicesController.reportLostFoundItem);
lostFoundRouter.get('/:id', ServicesController.getLostFoundItemById);
lostFoundRouter.post(
  '/:id/claim',
  validateBody(createLostFoundClaimSchema),
  ServicesController.submitLostFoundClaim
);
lostFoundRouter.patch(
  '/claims/:claimId',
  requireRole('ADMIN'),
  validateBody(moderateLostFoundClaimSchema),
  ServicesController.moderateLostFoundClaim
);
