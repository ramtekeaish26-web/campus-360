import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { CampusRoutingService } from '../services/campusRoutingService.js';
import { sendSuccess } from '../utils/response.js';

export async function calculateRoute(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { origin, destination, accessibleOnly } = req.body;
    const route = await CampusRoutingService.findRoute(origin, destination, { accessibleOnly });
    return sendSuccess(res, route);
  } catch (error) {
    return next(error);
  }
}
