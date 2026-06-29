import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { AppError } from '@/utils/app-error';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies['access_token'] as string | undefined;

  if (!token) {
    next(new AppError('Authentication required', 401));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_PUBLIC_KEY, { algorithms: ['RS256'] }) as {
      sub: string;
      email: string;
      role: string;
    };

    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
