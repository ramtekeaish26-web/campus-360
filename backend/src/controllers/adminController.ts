import { Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AdminController {
  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await AdminService.listUsers();
      return sendSuccess(res, { users, total: users.length }, 200);
    } catch (error) {
      next(error);
    }
  }
}
