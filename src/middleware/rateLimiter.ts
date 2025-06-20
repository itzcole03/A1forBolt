import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { UnifiedLogger } from '../services/core/UnifiedLogger';

const logger = UnifiedLogger.getInstance();

// Create different limiters for different endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', `IP: ${req.ip}, Path: ${req.path}, Method: ${req.method}`);
    res.status(429).json({
      error: 'Too many requests, please try again later',
    });
  },
});

// Stricter limits for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  handler: (req: Request, res: Response) => {
    logger.warn(
      'Auth rate limit exceeded',
      `IP: ${req.ip}, Path: ${req.path}, Method: ${req.method}`
    );
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later',
    });
  },
});

// Stricter limits for betting endpoints
export const bettingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many betting requests, please try again later',
  handler: (req: Request, res: Response) => {
    logger.warn(
      'Betting rate limit exceeded',
      `IP: ${req.ip}, Path: ${req.path}, Method: ${req.method}`
    );
    res.status(429).json({
      error: 'Too many betting requests, please try again later',
    });
  },
});
