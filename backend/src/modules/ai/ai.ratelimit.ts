import { Request, Response, NextFunction } from 'express';
import { sendError } from '../../utils/response.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const RATE_LIMITS = new Map<string, RateLimitBucket>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 40; // 40 requests / minute

export function aiRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const userId = (req as any).user?.id || req.ip || 'anonymous';
  const now = Date.now();

  let bucket = RATE_LIMITS.get(userId);
  if (!bucket || now > bucket.resetAt) {
    bucket = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    RATE_LIMITS.set(userId, bucket);
    return next();
  }

  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    sendError(
      res,
      429,
      ERROR_CODES.BAD_REQUEST,
      `AI request limit exceeded. Please wait ${retryAfter} seconds before asking again.`
    );
    return;
  }

  next();
}
