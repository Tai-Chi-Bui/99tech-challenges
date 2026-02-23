import type { FastifyRequest, FastifyReply } from 'fastify';
import * as v from 'valibot';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { HttpStatus } from '../errors/http-status';

export function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof AppError) {
    void reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
    });
    return;
  }

  if (error instanceof v.ValiError) {
    void reply.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      error: 'ValidationError',
      message: 'Request validation failed',
      issues: error.issues.map((issue) => ({
        path: issue.path?.map((p: { key: PropertyKey }) => p.key).join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      void reply.status(HttpStatus.NOT_FOUND).send({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'NotFound',
        message: 'The requested resource does not exist',
      });
      return;
    }
    if (error.code === 'P2002') {
      void reply.status(HttpStatus.CONFLICT).send({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: 'A resource with these unique fields already exists',
      });
      return;
    }
  }

  request.log.error({ err: error }, 'Unhandled error');
  void reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
  });
}
