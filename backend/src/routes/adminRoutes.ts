import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Admin routes require authentication and strictly ADMIN role
router.use(requireAuth);
router.use(requireRole(ROLES.ADMIN));

router.get('/users', AdminController.getUsers);

export const adminRoutes = router;
