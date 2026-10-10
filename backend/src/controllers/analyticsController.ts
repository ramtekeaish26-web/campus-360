import { Response, NextFunction } from 'express';
import { AnalyticsService, TimeRangeFilter } from '../services/analyticsService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AnalyticsController {
  /**
   * GET /api/analytics/summary
   * Returns role-authorized smart campus analytics summary.
   */
  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const roles = req.user.roles || [];
      const period = (req.query.period as any) || '30d';
      const filter: TimeRangeFilter = {
        period,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      if (roles.includes('ADMIN')) {
        const data = await AnalyticsService.getAdminAnalytics(filter);
        return sendSuccess(res, data, 200);
      } else if (roles.includes('FACULTY')) {
        const data = await AnalyticsService.getFacultyAnalytics(req.user.id, filter);
        return sendSuccess(res, data, 200);
      } else {
        const data = await AnalyticsService.getStudentAnalytics(req.user.id, filter);
        return sendSuccess(res, data, 200);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/analytics/explain
   * Uses Gemini with pre-calculated metrics to explain trends in natural language.
   */
  static async explain(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required');
      }

      const { question } = req.body;
      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return sendError(res, 400, ERROR_CODES.VALIDATION_ERROR, 'Analytical question is required');
      }

      const roles = req.user.roles || [];
      let role: 'STUDENT' | 'FACULTY' | 'ADMIN' = 'STUDENT';
      if (roles.includes('ADMIN')) role = 'ADMIN';
      else if (roles.includes('FACULTY')) role = 'FACULTY';

      const result = await AnalyticsService.explainAnalyticsWithAI({
        question: question.trim(),
        role,
        userId: req.user.id,
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/export
   * Exports smart campus metrics as CSV (Admin only).
   */
  static async exportCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !(req.user.roles || []).includes('ADMIN')) {
        return sendError(res, 403, ERROR_CODES.FORBIDDEN, 'Admin authorization required for data exports');
      }

      const period = (req.query.period as any) || '30d';
      const filter: TimeRangeFilter = {
        period,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const csvData = await AnalyticsService.generateCsvExport(filter);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="campus360_analytics_${period}_${Date.now()}.csv"`);
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}
