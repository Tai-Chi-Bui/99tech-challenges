import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import animalRoutes from './routes/animalRoutes';
import { sendSuccess, sendNotFound, sendInternalError } from './utils/responseUtils';
import { config } from './config';
import { logInfo, logError, logWarn } from './utils/logger';
import { timeoutMiddleware } from './utils/timeoutMiddleware';

const app = express();

app.use(helmet(config.security.helmet));
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(timeoutMiddleware(30000));

app.use((req: Request, res: Response, next: NextFunction) => {
  logInfo(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

app.use('/api/animals', animalRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, {
  swaggerOptions: {
    url: '/swagger-output.json'
  }
}));

app.get('/swagger-output.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../swagger-output.json'));
});

app.get('/health', (req, res) => {
  sendSuccess(res, { status: 'OK' }, 'Server is healthy');
});

app.get('/', (req, res) => {
  sendSuccess(res, {
    message: 'Animal CRUD API Server',
    version: '1.0.0',
    endpoints: {
      animals: '/api/animals',
      health: '/health',
      docs: '/api-docs'
    }
  }, 'Welcome to Animal CRUD API Server');
});

app.use('*', (req, res) => {
  sendNotFound(res, 'Endpoint not found', req.path);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logError('Unhandled error', err, { path: req.path, method: req.method });
  sendInternalError(res, 'Internal server error', req.path);
});

const server = app.listen(config.server.port, () => {
  logInfo(`Server running on port ${config.server.port}`);
  logInfo(`Health check: http://localhost:${config.server.port}/health`);
  logInfo(`API base: http://localhost:${config.server.port}/api/animals`);
  logInfo(`Swagger docs: http://localhost:${config.server.port}/api-docs`);
});

const gracefulShutdown = (signal: string) => {
  logInfo(`${signal} received, shutting down gracefully`);
  
  server.close(() => {
    logInfo('Process terminated');
    process.exit(0);
  });
  
  setTimeout(() => {
    logWarn('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
