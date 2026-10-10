import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { sendError } from '../utils/response.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { env } from '../config/env.js';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode = 400, code: string = ERROR_CODES.BAD_REQUEST, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Check if response has already been sent
  if (res.headersSent) {
    return;
  }

  logger.error(
    {
      err: {
        message: err.message,
        name: err.name,
        stack: env.NODE_ENV !== 'production' ? err.stack : undefined,
      },
      path: req.path,
      method: req.method,
    },
    'Handled express error'
  );

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // SyntaxError from body-parser
  if ('type' in err && err.type === 'entity.parse.failed') {
    sendError(res, 400, ERROR_CODES.BAD_REQUEST, 'Malformed JSON in request body');
    return;
  }

  // Generic 500 error
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal Server Error';

  sendError(res, 500, ERROR_CODES.INTERNAL_SERVER_ERROR, message);
}
