import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  details?: object;
}

const ERROR_STATUS_MAP: Record<string, number> = {
  NotFoundError: 404,
  ConflictError: 409,
  ValidationError: 400,
};

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode || ERROR_STATUS_MAP[err.name] || 500;
  const message = err.message || 'Error interno del servidor';

  if (statusCode >= 500) {
    logger.error(
      {
        statusCode,
        message,
        details: err.details,
        stack: err.stack,
      },
      'Error no controlado',
    );
  }

  res.status(statusCode).json({
    error: message,
    ...(err.details && { detalles: err.details }),
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Ruta no encontrada' });
}
