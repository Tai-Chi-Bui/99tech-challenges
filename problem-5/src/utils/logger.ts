import { isDevelopment } from '../config';

export function logInfo(message: string, meta?: Record<string, unknown>): void {
  const logEntry = `[INFO] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    console.log(logEntry, JSON.stringify(meta, null, 2));
  } else {
    console.log(logEntry);
  }
}

export function logError(message: string, error?: unknown, meta?: Record<string, unknown>): void {
  const logData: Record<string, unknown> = {
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };

  if (error) {
    if (error instanceof Error) {
      logData.error = error.message;
      logData.stack = error.stack;
    } else {
      logData.error = String(error);
    }
  }

  const logEntry = `[ERROR] ${message}`;
  if (isDevelopment) {
    console.error(logEntry, logData);
  } else {
    console.error(logEntry, JSON.stringify(logData));
  }
}

export function logWarn(message: string, meta?: Record<string, unknown>): void {
  const logEntry = `[WARN] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    console.warn(logEntry, JSON.stringify(meta, null, 2));
  } else {
    console.warn(logEntry);
  }
}

export function logDebug(message: string, meta?: Record<string, unknown>): void {
  if (isDevelopment) {
    const logEntry = `[DEBUG] ${message}`;
    if (meta && Object.keys(meta).length > 0) {
      console.log(logEntry, JSON.stringify(meta, null, 2));
    } else {
      console.log(logEntry);
    }
  }
}
