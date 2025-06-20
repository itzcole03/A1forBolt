import { EventEmitter } from "events";
import { UnifiedConfig } from "../unified/UnifiedConfig";
import { UnifiedLogger } from "../unified/UnifiedLogger";
import { UnifiedCache } from "../unified/UnifiedCache";
import { BaseService } from "./BaseService";
import { UnifiedServiceRegistry } from "./UnifiedServiceRegistry";

export interface ErrorContext {
  code: string;
  message: string;
  severity: "error" | "warning" | "info";
  timestamp: number;
  source: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface ErrorDetails {
  code: string;
  source: string;
  details?: Record<string, any>;
  timestamp?: number;
}

export class UnifiedErrorService extends BaseService {
  private static instance: UnifiedErrorService;
  private readonly config: UnifiedConfig;
  private readonly logger: UnifiedLogger;
  private readonly cache: UnifiedCache;
  private readonly errorHistory: ErrorContext[] = [];
  private readonly maxErrorHistory = 100;
  private errors: ErrorDetails[] = [];
  private readonly maxErrors: number = 1000;

  private constructor(registry: UnifiedServiceRegistry) {
    super("error", registry);
    this.config = UnifiedConfig.getInstance();
    this.logger = UnifiedLogger.getInstance();
    this.cache = UnifiedCache.getInstance();
  }

  public static getInstance(
    registry: UnifiedServiceRegistry,
  ): UnifiedErrorService {
    if (!UnifiedErrorService.instance) {
      UnifiedErrorService.instance = new UnifiedErrorService(registry);
    }
    return UnifiedErrorService.instance;
  }

  public handleError(error: unknown, details: ErrorDetails): void {
    const errorDetails: ErrorDetails = {
      ...details,
      timestamp: Date.now(),
    };

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error:", error);
      console.error("Details:", errorDetails);
    }

    // Store error
    this.errors.unshift(errorDetails);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    // Emit error event
    this.emit("error", { error, details: errorDetails });
  }

  public getErrors(limit: number = 100): ErrorDetails[] {
    return this.errors.slice(0, limit);
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public getErrorCount(): number {
    return this.errors.length;
  }

  public getErrorsByCode(code: string): ErrorDetails[] {
    return this.errors.filter((error) => error.code === code);
  }

  public getErrorsBySource(source: string): ErrorDetails[] {
    return this.errors.filter((error) => error.source === source);
  }

  public getRecentErrors(
    timeRange: "day" | "week" | "month" = "day",
  ): ErrorDetails[] {
    const now = Date.now();
    const rangeInMs = this.getTimeRangeInMs(timeRange);
    const cutoff = now - rangeInMs;

    return this.errors.filter((error) => (error.timestamp || 0) >= cutoff);
  }

  // Renamed to avoid duplicate member error
  public getRecentErrorHistory(): ErrorContext[] {
    return this.errorHistory.slice(0, 10);
  }

  public clearErrorHistory(): void {
    this.errorHistory.length = 0;
    this.cache.delete("recent_errors");
    this.emit("error:history:cleared");
  }

  public subscribe(callback: (error: ErrorContext) => void): () => void {
    this.on("error:occurred", callback);
    return () => this.off("error:occurred", callback);
  }

  private handleErrorBySeverity(error: ErrorContext): void {
    switch (error.severity) {
      case "error":
        this.handleCriticalError(error);
        break;
      case "warning":
        this.handleWarning(error);
        break;
      case "info":
        this.handleInfo(error);
        break;
    }
  }

  private handleCriticalError(error: ErrorContext): void {
    // Implement critical error handling logic
    // For example, notify administrators, trigger fallback mechanisms, etc.
    this.emit("error:critical", error);
  }

  private handleWarning(error: ErrorContext): void {
    // Implement warning handling logic
    // For example, log to monitoring system, notify developers, etc.
    this.emit("error:warning", error);
  }

  private handleInfo(error: ErrorContext): void {
    // Implement info handling logic
    // For example, log to analytics, track patterns, etc.
    this.emit("error:info", error);
  }

  public isErrorRecoverable(error: ErrorContext): boolean {
    // Implement logic to determine if an error is recoverable
    const recoverableCodes = this.config.get("recoverableErrorCodes") || [];
    return recoverableCodes.includes(error.code);
  }

  public getErrorMetrics(): {
    totalErrors: number;
    criticalErrors: number;
    warnings: number;
    info: number;
    lastErrorTime: number;
  } {
    return {
      totalErrors: this.errorHistory.length,
      criticalErrors: this.errorHistory.filter((e) => e.severity === "error")
        .length,
      warnings: this.errorHistory.filter((e) => e.severity === "warning")
        .length,
      info: this.errorHistory.filter((e) => e.severity === "info").length,
      lastErrorTime: this.errorHistory[0]?.timestamp || 0,
    };
  }
}
