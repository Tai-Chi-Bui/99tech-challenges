import { Response } from 'express';
import { ApiResponse, PaginatedResponse, ErrorResponse } from '../types';

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  if (message) {
    response.message = message;
  }
  
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, message, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function sendPaginated<T>(
  res: Response, 
  data: T[], 
  total: number, 
  limit: number, 
  offset: number
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    },
    timestamp: new Date().toISOString()
  };
  res.status(200).json(response);
}

export function sendError(
  res: Response, 
  error: string, 
  message: string, 
  statusCode: number = 400,
  path?: string
): void {
  const response: ErrorResponse = {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (path) {
    response.path = path;
  }
  
  res.status(statusCode).json(response);
}

export function sendBadRequest(res: Response, message: string, path?: string): void {
  sendError(res, 'BAD_REQUEST', message, 400, path);
}

export function sendNotFound(res: Response, message: string, path?: string): void {
  sendError(res, 'NOT_FOUND', message, 404, path);
}

export function sendInternalError(res: Response, message: string = 'Internal server error', path?: string): void {
  sendError(res, 'INTERNAL_ERROR', message, 500, path);
}

export function sendValidationError(res: Response, message: string, path?: string): void {
  sendError(res, 'VALIDATION_ERROR', message, 400, path);
}

export function sendConflict(res: Response, message: string, path?: string): void {
  sendError(res, 'CONFLICT', message, 409, path);
}

export function sendUnauthorized(res: Response, message: string = 'Unauthorized', path?: string): void {
  sendError(res, 'UNAUTHORIZED', message, 401, path);
}

export function sendForbidden(res: Response, message: string = 'Forbidden', path?: string): void {
  sendError(res, 'FORBIDDEN', message, 403, path);
}
