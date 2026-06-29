import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}
