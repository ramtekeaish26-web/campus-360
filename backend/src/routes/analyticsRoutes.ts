import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All analytics routes require authenticated session
router.use(requireAuth);

// Summary & KPI metrics (auto-scoped by user role)
router.get('/summary', AnalyticsController.getSummary);

// Natural language analytical query explanation via Gemini
router.post('/explain', AnalyticsController.explain);

// Admin-only CSV export
router.get('/export', AnalyticsController.exportCsv);

export const analyticsRoutes = router;
