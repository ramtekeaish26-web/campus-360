import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { AuthenticatedRequest } from '../types/index.js';

function getUserRole(req: AuthenticatedRequest): string {
  const roles = req.user?.roles || [];
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('FACULTY')) return 'FACULTY';
  return 'STUDENT';
}

export class NotificationController {
  /**
   * GET /api/notifications
   * List personalized notifications for authenticated user
   */
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const role = getUserRole(req);
      const unreadOnly = req.query.unreadOnly === 'true';
      const type = req.query.type as any;
      const priority = req.query.priority as any;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const result = await NotificationService.getUserNotifications({
        userId: req.user.id,
        role,
        unreadOnly,
        type,
        priority,
        page,
        limit,
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   */
  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const role = getUserRole(req);
      const unreadCount = await NotificationService.getUnreadCount(req.user.id, role);
      return sendSuccess(res, { unreadCount }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   */
  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const success = await NotificationService.markAsRead(id, req.user.id);
      if (!success) {
        return sendError(res, 404, ERROR_CODES.NOT_FOUND, 'Notification not found or access denied');
      }

      return sendSuccess(res, { success: true, id }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/mark-all-read
   */
  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const count = await NotificationService.markAllAsRead(req.user.id);
      return sendSuccess(res, { success: true, count }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/preferences
   */
  static async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const preferences = await NotificationService.getPreferences(req.user.id);
      return sendSuccess(res, { preferences }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/notifications/preferences
   */
  static async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const preferences = await NotificationService.updatePreferences(req.user.id, req.body);
      return sendSuccess(res, { preferences }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/daily-summary
   */
  static async getDailySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const role = getUserRole(req);
      const summary = await NotificationService.getDailySummary(req.user.id, role);
      return sendSuccess(res, summary, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/recommendations
   */
  static async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const role = getUserRole(req);
      const recommendations = await NotificationService.getSmartRecommendations(req.user.id, role);
      return sendSuccess(res, { recommendations }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/explain
   * Natural language reasoning over active notifications & daily schedule
   */
  static async explain(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const { question } = req.body;
      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return sendError(res, 400, ERROR_CODES.VALIDATION_ERROR, 'Question is required');
      }

      const role = getUserRole(req);
      const result = await NotificationService.explainNotificationsWithAI({
        question: question.trim(),
        userId: req.user.id,
        role,
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/admin/preview (Admin only)
   */
  static async adminPreview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !(req.user.roles || []).includes('ADMIN')) {
        return sendError(res, 403, ERROR_CODES.FORBIDDEN, 'Admin authorization required');
      }

      const { title, message, type, priority, targetAudience, actionUrl, actionLabel } = req.body;
      if (!title || !message || !type || !priority || !targetAudience) {
        return sendError(res, 400, ERROR_CODES.VALIDATION_ERROR, 'Missing required broadcast parameters');
      }

      const previewResult = await NotificationService.previewAdminBroadcast({
        title,
        message,
        type,
        priority,
        targetAudience,
        actionUrl,
        actionLabel,
      });

      return sendSuccess(res, previewResult, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/admin/publish (Admin only)
   */
  static async adminPublish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !(req.user.roles || []).includes('ADMIN')) {
        return sendError(res, 403, ERROR_CODES.FORBIDDEN, 'Admin authorization required');
      }

      const { title, message, type, priority, targetAudience, confirmed, actionUrl, actionLabel, expiresAt } = req.body;
      if (!title || !message || !type || !priority || !targetAudience) {
        return sendError(res, 400, ERROR_CODES.VALIDATION_ERROR, 'Missing required broadcast parameters');
      }

      if (!confirmed) {
        return sendError(res, 400, ERROR_CODES.VALIDATION_ERROR, 'Explicit admin confirmation is required');
      }

      const publishResult = await NotificationService.publishAdminBroadcast({
        adminId: req.user.id,
        adminEmail: req.user.email,
        title,
        message,
        type,
        priority,
        targetAudience,
        confirmed: true,
        actionUrl,
        actionLabel,
        expiresAt,
      });

      return sendSuccess(res, publishResult, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/admin/audit (Admin only)
   */
  static async adminGetAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !(req.user.roles || []).includes('ADMIN')) {
        return sendError(res, 403, ERROR_CODES.FORBIDDEN, 'Admin authorization required');
      }

      const auditLogs = await NotificationService.getAdminAuditLogs();
      return sendSuccess(res, { auditLogs }, 200);
    } catch (error) {
      next(error);
    }
  }
}
