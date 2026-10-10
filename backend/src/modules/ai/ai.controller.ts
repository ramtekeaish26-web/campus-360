import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service.js';
import { AIAuditService } from './ai.audit.js';
import { geminiClient } from './gemini.client.js';
import { sendSuccess } from '../../utils/response.js';

function getUserRole(req: Request): string {
  const user = (req as any).user;
  if (!user || !user.roles) return 'STUDENT';
  if (Array.isArray(user.roles)) {
    if (user.roles.includes('ADMIN')) return 'ADMIN';
    if (user.roles.includes('FACULTY')) return 'FACULTY';
    const first = user.roles[0];
    return typeof first === 'string' ? first : (first as any)?.code || 'STUDENT';
  }
  return 'STUDENT';
}

export class AIController {
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const role = getUserRole(req);
      const { message, conversationId } = req.body;

      const result = await AIService.processChat(message, userId, role, conversationId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async confirmAction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { actionId, decision } = req.body;

      const result = await AIService.confirmPendingAction(actionId, decision, userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = geminiClient.getStatus();
      return sendSuccess(res, status);
    } catch (err) {
      next(err);
    }
  }

  static async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const conversations = await AIService.getUserConversations(userId);
      return sendSuccess(res, { conversations });
    } catch (err) {
      next(err);
    }
  }

  static async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await AIService.deleteConversation(userId, req.params.id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getAdminMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AIAuditService.getMetrics();
      const status = geminiClient.getStatus();
      return sendSuccess(res, {
        status,
        metrics,
      });
    } catch (err) {
      next(err);
    }
  }
}
