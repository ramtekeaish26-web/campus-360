import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/authValidators.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', requireAuth, AuthController.me);
router.post('/logout', requireAuth, AuthController.logout);

export const authRoutes = router;
