import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '@/utils/app-error';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      next(
        new AppError('Validation failed', 422, {
          errors: Object.entries(errors).map(([field, messages]) => ({
            field,
            message: messages?.[0] ?? 'Invalid value',
          })),
        }),
      );
      return;
    }

    req[source] = result.data;
    next();
  };
}
