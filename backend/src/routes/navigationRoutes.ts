import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { routeRequestSchema } from '../validators/spatialValidators.js';
import { calculateRoute } from '../controllers/navigationController.js';

const router = Router();

router.use(requireAuth);

router.post('/route', validateBody(routeRequestSchema), calculateRoute);

export default router;
