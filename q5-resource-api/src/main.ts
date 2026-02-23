import { buildApp } from './app';
import { env } from './config/env';
import { db } from './db/client';

async function bootstrap() {
  const app = await buildApp();

  const shutdown = async () => {
    app.log.info('Shutting down gracefully…');
    await app.close();
    await db.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void bootstrap();
