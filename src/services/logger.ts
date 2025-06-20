import { Logger } from '../types';

class LoggerService implements Logger {
  private static instance: LoggerService;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public info(message: string, meta?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, meta || '');
    }
    // In production, you would send this to your logging service
  }

  public error(message: string, meta?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, meta || '');
    }
    // In production, you would send this to your logging service
  }

  public warn(message: string, meta?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, meta || '');
    }
    // In production, you would send this to your logging service
  }

  public debug(message: string, meta?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
    // In production, you would send this to your logging service
  }
}

export const logger = LoggerService.getInstance();
export default logger;
