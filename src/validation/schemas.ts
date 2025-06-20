// Real zod-based validation schemas for production
import { z } from '../zod';

// Bet Validation Schema
export const betSchema = z.object({
  id: z.string(),
  userId: z.string(),
  eventId: z.string(),
  amount: z.number().min(0.01),
  odds: z.number(),
  type: z.enum(['single', 'parlay', 'system']),
  placedAt: z.string().datetime(),
  status: z.enum(['pending', 'won', 'lost', 'void']),
});

// User Validation Schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  isActive: z.boolean(),
});

// Prediction Validation Schema
export const predictionSchema = z.object({
  id: z.string(),
  betId: z.string(),
  model: z.string(),
  prediction: z.number(),
  confidence: z.number().min(0).max(1),
  createdAt: z.string().datetime(),
});

// Market Validation Schema
export const marketSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  isActive: z.boolean(),
});

// Event Validation Schema
export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  startTime: z.string().datetime(),
  league: z.string(),
  venueId: z.string(),
});

// Validation Middleware
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodTypeAny } from 'zod';
export const validateRequest = (schema: ZodSchema<unknown> | ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.message,
        });
      }
      next(error);
    }
  };
};
