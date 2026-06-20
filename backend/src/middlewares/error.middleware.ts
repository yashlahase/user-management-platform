import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // If operational custom AppError
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      message: err.message,
    };

    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }

    logger.warn(`Operational Error [${err.statusCode}]: ${err.message}`);
    res.status(err.statusCode).json(response);
    return;
  }

  // Database or system level failures
  logger.error(`Unhandled Error: ${err.message}\nStack: ${err.stack}`);

  const systemErrorResponse: any = {
    success: false,
    message: 'An unexpected internal server error occurred.',
  };

  if (env.NODE_ENV === 'development') {
    systemErrorResponse.error = err.message;
    systemErrorResponse.stack = err.stack;
  }

  res.status(500).json(systemErrorResponse);
};
