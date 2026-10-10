import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/userValidators.js';

const router = Router();

// User endpoints require authentication
router.use(requireAuth);

router.get('/me', UserController.getMe);
router.patch('/me', validate(updateProfileSchema), UserController.updateMe);

export const userRoutes = router;
