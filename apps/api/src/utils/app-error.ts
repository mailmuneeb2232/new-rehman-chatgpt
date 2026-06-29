interface AppErrorOptions {
  errors?: Array<{ field: string; message: string }>;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Array<{ field: string; message: string }>;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, options: AppErrorOptions = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = options.errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
