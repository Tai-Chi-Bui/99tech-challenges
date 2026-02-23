import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { env } from './config/env';
import { memberPlugin } from './features/members/member.plugin';
import { errorHandler } from './shared/middleware/error-handler';

export async function buildApp() {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'production'
        ? true
        : {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true },
            },
          },
  });

  await app.register(cors);
  await app.register(sensible);
  await app.register(memberPlugin, { prefix: '/api/v1/members' });

  app.setErrorHandler(errorHandler);

  return app;
}
