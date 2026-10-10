import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    logger.info(
      {
        method,
        url,
        statusCode,
        durationMs: duration,
        ip,
      },
      `${method} ${url} ${statusCode} - ${duration}ms`
    );
  });

  next();
}
