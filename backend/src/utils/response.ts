import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(responseBody);
}

export function sendPaginatedSuccess<T>(
  res: Response,
  message: string,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  },
  statusCode = 200
): Response {
  const responseBody: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    pagination,
  };
  return res.status(statusCode).json(responseBody);
}
