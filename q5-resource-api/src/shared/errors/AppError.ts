import { HttpStatus } from './http-status';

export class AppError extends Error {
  public readonly statusCode: HttpStatus;

  constructor(statusCode: HttpStatus, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
