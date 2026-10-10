import { Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class UserController {
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getProfile(req.user!.id);
      return sendSuccess(res, { user }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updatedUser = await UserService.updateProfile(req.user!.id, req.body);
      return sendSuccess(res, { user: updatedUser }, 200);
    } catch (error) {
      next(error);
    }
  }
}
