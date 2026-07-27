import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class ValidationError extends Error {
  statusCode: number = 400;
  code: string = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  statusCode: number = 401;
  code: string = 'AUTHENTICATION_ERROR';

  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode: number = 403;
  code: string = 'AUTHORIZATION_ERROR';

  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  statusCode: number = 404;
  code: string = 'NOT_FOUND';

  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode: number = 409;
  code: string = 'CONFLICT';

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  logger.error('Request error', {
    error: err.message,
    code,
    statusCode,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message,
      timestamp: new Date().toISOString(),
    },
  });
};
