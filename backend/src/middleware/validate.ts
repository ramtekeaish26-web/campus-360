import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Assign parsed data back
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => ({
          field: err.path.join('.').replace(/^(body|query|params)\./, ''),
          message: err.message,
        }));
        sendError(
          res,
          400,
          ERROR_CODES.VALIDATION_ERROR,
          issues[0]?.message || 'Validation failed',
          issues
        );
        return;
      }
      sendError(res, 400, ERROR_CODES.BAD_REQUEST, 'Invalid request input');
    }
  };
};

export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        sendError(
          res,
          400,
          ERROR_CODES.VALIDATION_ERROR,
          issues[0]?.message || 'Validation failed',
          issues
        );
        return;
      }
      sendError(res, 400, ERROR_CODES.BAD_REQUEST, 'Invalid request input');
    }
  };
};

export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.query);
      req.query = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        sendError(
          res,
          400,
          ERROR_CODES.VALIDATION_ERROR,
          issues[0]?.message || 'Validation failed',
          issues
        );
        return;
      }
      sendError(res, 400, ERROR_CODES.BAD_REQUEST, 'Invalid query parameters');
    }
  };
};
