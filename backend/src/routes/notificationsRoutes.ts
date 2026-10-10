import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/roles.js';

export const notificationsRouter = Router();

// All notification routes require authenticated session
notificationsRouter.use(requireAuth);

// 1. Notification Center CRUD
notificationsRouter.get('/', NotificationController.getNotifications);
notificationsRouter.get('/unread-count', NotificationController.getUnreadCount);
notificationsRouter.patch('/:id/read', NotificationController.markAsRead);
notificationsRouter.post('/mark-all-read', NotificationController.markAllAsRead);

// 2. Preferences & Quiet Hours
notificationsRouter.get('/preferences', NotificationController.getPreferences);
notificationsRouter.put('/preferences', NotificationController.updatePreferences);

// 3. Proactive Daily Summary & Context Recommendations
notificationsRouter.get('/daily-summary', NotificationController.getDailySummary);
notificationsRouter.get('/recommendations', NotificationController.getRecommendations);

// 4. AI Notification Reasoning & Explanation
notificationsRouter.post('/explain', NotificationController.explain);

// 5. Admin Institutional Broadcast & Audit Log
notificationsRouter.post(
  '/admin/preview',
  requireRole(ROLES.ADMIN),
  NotificationController.adminPreview
);
notificationsRouter.post(
  '/admin/publish',
  requireRole(ROLES.ADMIN),
  NotificationController.adminPublish
);
notificationsRouter.get(
  '/admin/audit',
  requireRole(ROLES.ADMIN),
  NotificationController.adminGetAuditLogs
);
