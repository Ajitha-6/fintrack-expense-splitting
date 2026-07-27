import { logger as winstonLogger } from '../config/logger';
import { Request, Response, NextFunction } from 'express';

export const logger = winstonLogger;

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).userId,
    });
  });
  next();
};
