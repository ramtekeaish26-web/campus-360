import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthenticatedUser, JwtPayload } from '../types/index.js';
import { RoleCode } from '../constants/roles.js';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { prisma, isDbConnected } from '../config/db.js';
import { DEMO_FALLBACK_USERS } from '../services/authService.js';

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(
      res,
      401,
      ERROR_CODES.UNAUTHORIZED,
      'Authentication token required. Please sign in.'
    );
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = env.SUPABASE_JWT_SECRET || env.JWT_SECRET;
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded || (!decoded.sub && !decoded.email)) {
      sendError(res, 401, ERROR_CODES.INVALID_TOKEN, 'Invalid authentication token.');
      return;
    }

    const userIdOrEmail = decoded.sub || decoded.email;

    let userRecord = null;
    if (isDbConnected()) {
      try {
        userRecord = await prisma.user.findFirst({
          where: {
            OR: [{ id: userIdOrEmail }, { email: decoded.email || userIdOrEmail }],
          },
          include: {
            profile: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });
      } catch {
        // DB error
      }
    }

    if (userRecord) {
      if (!userRecord.isActive) {
        sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'User account is inactive. Please contact administrator.');
        return;
      }

      const roles = userRecord.userRoles.map((ur) => ur.role.code as RoleCode);

      req.user = {
        id: userRecord.id,
        email: userRecord.email,
        roles,
        profile: userRecord.profile
          ? {
              id: userRecord.profile.id,
              firstName: userRecord.profile.firstName,
              lastName: userRecord.profile.lastName,
              prn: userRecord.profile.prn,
              avatarUrl: userRecord.profile.avatarUrl,
              departmentId: userRecord.profile.departmentId,
              programId: userRecord.profile.programId,
            }
          : null,
      };
    } else {
      if (!decoded.roles || decoded.roles.length === 0) {
        sendError(res, 401, ERROR_CODES.USER_NOT_FOUND, 'User does not exist or has no assigned roles.');
        return;
      }

      const fallback = Object.values(DEMO_FALLBACK_USERS).find(
        (u) => (decoded.sub && u.id === decoded.sub) || (decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase())
      );

      req.user = {
        id: decoded.sub,
        email: decoded.email,
        roles: decoded.roles,
        profile: fallback?.profile
          ? {
              id: fallback.profile.id,
              firstName: fallback.profile.firstName,
              lastName: fallback.profile.lastName,
              prn: fallback.profile.prn,
              avatarUrl: fallback.profile.avatarUrl,
              departmentId: fallback.profile.department?.id || null,
              programId: fallback.profile.program?.id || null,
            }
          : null,
      };
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 401, ERROR_CODES.TOKEN_EXPIRED, 'Authentication token has expired. Please sign in again.');
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 401, ERROR_CODES.INVALID_TOKEN, 'Invalid authentication token.');
      return;
    }

    sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication failed.');
  }
}

export function requireRole(requiredRole: RoleCode) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required.');
      return;
    }

    const hasRole = req.user.roles.includes(requiredRole);

    if (!hasRole) {
      sendError(
        res,
        403,
        ERROR_CODES.FORBIDDEN,
        'You do not have permission to perform this action.'
      );
      return;
    }

    next();
  };
}

export function requireAnyRole(allowedRoles: RoleCode[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, ERROR_CODES.UNAUTHORIZED, 'Authentication required.');
      return;
    }

    const hasAnyRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasAnyRole) {
      sendError(
        res,
        403,
        ERROR_CODES.FORBIDDEN,
        'You do not have permission to perform this action.'
      );
      return;
    }

    next();
  };
}
