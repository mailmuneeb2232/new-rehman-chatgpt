import type { Response } from 'express';
import type { ApiResponse, PaginationMeta } from '@/types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { message?: string; statusCode?: number; meta?: PaginationMeta } = {},
): void {
  const { message, statusCode = 200, meta } = options;
  const body: ApiResponse<T> = { success: true, data, ...(message && { message }), ...(meta && { meta }) };
  res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, { statusCode: 201, message });
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
