import { Request, Response, NextFunction } from 'express';
import { sendError } from './responseUtils';
import { logWarn } from './logger';

export function timeoutMiddleware(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeoutId = setTimeout(() => {
      logWarn('Request timeout', { 
        path: req.path, 
        method: req.method, 
        timeout: timeoutMs 
      });
      
      if (!res.headersSent) {
        sendError(
          res, 
          'REQUEST_TIMEOUT', 
          'Request timed out', 
          408, 
          req.path
        );
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    res.on('close', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
}
