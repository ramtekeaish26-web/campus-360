import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getUserWithDetails(req.user?.id, req.user?.email);
      return sendSuccess(res, { user }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response) {
    return sendSuccess(
      res,
      {
        message: 'Successfully logged out.',
        sessionCleared: true,
      },
      200
    );
  }
}
