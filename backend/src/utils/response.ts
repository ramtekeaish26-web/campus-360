import { Response } from 'express';
import { ApiResponseSuccess, ApiResponseError, ApiErrorDetail } from '../types/index.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): Response {
  const response: ApiResponseSuccess<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): Response {
  const errorObj: ApiErrorDetail = {
    code,
    message,
    ...(details ? { details } : {}),
  };
  const response: ApiResponseError = {
    success: false,
    error: errorObj,
  };
  return res.status(statusCode).json(response);
}
