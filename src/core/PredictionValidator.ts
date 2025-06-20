import { EventBus } from './EventBus';
import { unifiedMonitor } from './UnifiedMonitor';
import { SystemError, ErrorCategory, ErrorSeverity, ErrorContext } from './UnifiedError';
import { EventMap } from '../types/core';

export interface PredictionInput {
  features: Record<string, number>;
  timestamp: number;
  source: string;
  context?: Record<string, any>;
}

export interface PredictionOutput {
  predictionId: string;
  propId: string;
  predictedValue: number;
  confidence: number;
  timestamp: number;
  factors: Array<{
    name: string;
    weight: number;
    impact: number;
  }>;
  uncertaintyBounds?: {
    lower: number;
    upper: number;
  };
  metadata?: {
    processingTime?: number;
    dataFreshness?: number;
    signalQuality?: number;
    modelVersion?: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    confidence: number;
    dataFreshness: number;
    signalQuality: number;
  };
  context?: Record<string, any>;
}

export interface ValidationRule {
  name: string;
  priority: number;
  validate: (input: PredictionInput, output: PredictionOutput) => ValidationRuleResult;
  cacheKey?: (input: PredictionInput, output: PredictionOutput) => string;
}

export interface ValidationRuleResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  context?: Record<string, any>;
}

export class PredictionValidator {
  private static instance: PredictionValidator;
  private readonly eventBus: EventBus;
  private validationHistory: Array<{
    timestamp: number;
    input: PredictionInput;
    output: PredictionOutput;
    result: ValidationResult;
  }> = [];
  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly MIN_CONFIDENCE = 0.7;
  private readonly MIN_DATA_FRESHNESS = 0.8;
  private readonly MIN_SIGNAL_QUALITY = 0.6;
  private validationRules: ValidationRule[] = [];
  private validationCache: Map<string, ValidationRuleResult> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.initializeDefaultRules();
  }

  public static getInstance(): PredictionValidator {
    if (!PredictionValidator.instance) {
      PredictionValidator.instance = new PredictionValidator();
    }
    return PredictionValidator.instance;
  }

  private initializeDefaultRules(): void {
    this.addValidationRule({
      name: 'featureValidation',
      priority: 1,
      validate: (input, output) => {
        const errors: string[] = [];
        if (!input.features || Object.keys(input.features).length === 0) {
          errors.push('Features cannot be empty');
        } else {
          for (const [name, value] of Object.entries(input.features)) {
            if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
              errors.push(`Feature ${name} must be a valid number`);
            }
          }
        }
        return { isValid: errors.length === 0, errors, warnings: [] };
      },
    });

    this.addValidationRule({
      name: 'predictionRangeValidation',
      priority: 2,
      validate: (input, output) => {
        const errors: string[] = [];
        if (
          typeof output.predictedValue !== 'number' ||
          isNaN(output.predictedValue) ||
          !isFinite(output.predictedValue)
        ) {
          errors.push('Prediction must be a valid number');
        } else if (output.predictedValue < 0 || output.predictedValue > 1) {
          errors.push('Prediction must be between 0 and 1');
        }
        return { isValid: errors.length === 0, errors, warnings: [] };
      },
    });

    this.addValidationRule({
      name: 'confidenceValidation',
      priority: 3,
      validate: (input, output) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        if (
          typeof output.confidence !== 'number' ||
          isNaN(output.confidence) ||
          !isFinite(output.confidence)
        ) {
          errors.push('Confidence must be a valid number');
        } else if (output.confidence < 0 || output.confidence > 1) {
          errors.push('Confidence must be between 0 and 1');
        } else if (output.confidence < this.MIN_CONFIDENCE) {
          warnings.push(
            `Confidence (${output.confidence}) is below minimum threshold (${this.MIN_CONFIDENCE})`
          );
        }
        return { isValid: errors.length === 0, errors, warnings };
      },
    });

    this.addValidationRule({
      name: 'metadataValidation',
      priority: 4,
      validate: (input, output) => {
        const warnings: string[] = [];
        if (output.metadata) {
          if (
            output.metadata.dataFreshness !== undefined &&
            output.metadata.dataFreshness < this.MIN_DATA_FRESHNESS
          ) {
            warnings.push(
              `Data freshness (${output.metadata.dataFreshness}) is below minimum threshold (${this.MIN_DATA_FRESHNESS})`
            );
          }
          if (
            output.metadata.signalQuality !== undefined &&
            output.metadata.signalQuality < this.MIN_SIGNAL_QUALITY
          ) {
            warnings.push(
              `Signal quality (${output.metadata.signalQuality}) is below minimum threshold (${this.MIN_SIGNAL_QUALITY})`
            );
          }
        }
        return { isValid: true, errors: [], warnings };
      },
    });
  }

  public addValidationRule(rule: ValidationRule): void {
    this.validationRules.push(rule);
    this.validationRules.sort((a, b) => a.priority - b.priority);
  }

  public removeValidationRule(ruleName: string): void {
    this.validationRules = this.validationRules.filter(rule => rule.name !== ruleName);
  }

  public validatePrediction(input: PredictionInput, output: PredictionOutput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validationContext: Record<string, any> = {};

    try {
      for (const rule of this.validationRules) {
        let ruleResult: ValidationRuleResult;

        // Check cache if rule has cacheKey
        if (rule.cacheKey) {
          const cacheKey = rule.cacheKey(input, output);
          const cachedResult = this.validationCache.get(cacheKey);
          if (cachedResult) {
            ruleResult = cachedResult;
          } else {
            ruleResult = rule.validate(input, output);
            this.validationCache.set(cacheKey, ruleResult);
            setTimeout(() => this.validationCache.delete(cacheKey), this.CACHE_TTL);
          }
        } else {
          ruleResult = rule.validate(input, output);
        }

        errors.push(...ruleResult.errors);
        warnings.push(...ruleResult.warnings);
        if (ruleResult.context) {
          validationContext[rule.name] = ruleResult.context;
        }

        // Stop validation chain if critical error found
        if (!ruleResult.isValid && rule.priority >= 3) {
          break;
        }
      }

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        metrics: {
          confidence: output.confidence,
          dataFreshness: output.metadata?.dataFreshness || 1,
          signalQuality: output.metadata?.signalQuality || 1,
        },
        context: validationContext,
      };

      // Record validation result
      this.recordValidation(input, output, result);

      // Emit validation event with enhanced context
      this.eventBus.emit('prediction:validated', {
        predictionId: output.predictionId,
        isValid: result.isValid,
        errors,
        warnings,
        metrics: result.metrics,
        context: validationContext,
      });

      return result;
    } catch (error) {
      const errorContext: Partial<ErrorContext> = {
        code: 'PREDICTION_VALIDATION_FAILED',
        message: 'Failed to validate prediction',
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.HIGH,
        timestamp: Date.now(),
        component: 'PredictionValidator',
        details: { input, output, validationContext },
      };
      unifiedMonitor.reportError(error as Error, errorContext);
      throw error;
    }
  }

  private validateTimestamp(timestamp: number, errors: string[]): void {
    if (typeof timestamp !== 'number' || isNaN(timestamp) || !isFinite(timestamp)) {
      errors.push('Timestamp must be a valid number');
    } else if (timestamp > Date.now()) {
      errors.push('Timestamp cannot be in the future');
    }
  }

  private validateFactors(
    factors: Array<{ name: string; weight: number; impact: number }>,
    errors: string[]
  ): void {
    if (!Array.isArray(factors)) {
      errors.push('Factors must be an array');
      return;
    }

    for (const factor of factors) {
      if (!factor.name) {
        errors.push('Factor name is required');
      }
      if (typeof factor.weight !== 'number' || isNaN(factor.weight) || !isFinite(factor.weight)) {
        errors.push(`Factor ${factor.name} weight must be a valid number`);
      }
      if (typeof factor.impact !== 'number' || isNaN(factor.impact) || !isFinite(factor.impact)) {
        errors.push(`Factor ${factor.name} impact must be a valid number`);
      }
    }
  }

  private validateUncertaintyBounds(
    bounds: { lower: number; upper: number },
    prediction: number,
    errors: string[]
  ): void {
    if (typeof bounds.lower !== 'number' || isNaN(bounds.lower) || !isFinite(bounds.lower)) {
      errors.push('Lower uncertainty bound must be a valid number');
    }
    if (typeof bounds.upper !== 'number' || isNaN(bounds.upper) || !isFinite(bounds.upper)) {
      errors.push('Upper uncertainty bound must be a valid number');
    }
    if (bounds.lower > bounds.upper) {
      errors.push('Lower uncertainty bound cannot be greater than upper bound');
    }
    if (prediction < bounds.lower || prediction > bounds.upper) {
      errors.push('Prediction must be within uncertainty bounds');
    }
  }

  private recordValidation(
    input: PredictionInput,
    output: PredictionOutput,
    result: ValidationResult
  ): void {
    this.validationHistory.push({
      timestamp: Date.now(),
      input,
      output,
      result,
    });

    // Trim history if needed
    if (this.validationHistory.length > this.MAX_HISTORY_SIZE) {
      this.validationHistory = this.validationHistory.slice(-this.MAX_HISTORY_SIZE);
    }
  }

  public getValidationStats(): {
    totalValidations: number;
    validPredictions: number;
    invalidPredictions: number;
    validationRate: number;
    averageConfidence: number;
    averageDataFreshness: number;
    averageSignalQuality: number;
    ruleStats: Record<string, { total: number; passed: number; failed: number }>;
  } {
    const total = this.validationHistory.length;
    const valid = this.validationHistory.filter(v => v.result.isValid).length;
    const validResults = this.validationHistory.filter(v => v.result.isValid);

    // Calculate rule statistics
    const ruleStats: Record<string, { total: number; passed: number; failed: number }> = {};
    for (const rule of this.validationRules) {
      ruleStats[rule.name] = {
        total: total,
        passed: validResults.filter(v => !v.result.errors.some(e => e.includes(rule.name))).length,
        failed:
          total -
          validResults.filter(v => !v.result.errors.some(e => e.includes(rule.name))).length,
      };
    }

    return {
      totalValidations: total,
      validPredictions: valid,
      invalidPredictions: total - valid,
      validationRate: total > 0 ? valid / total : 0,
      averageConfidence:
        validResults.length > 0
          ? validResults.reduce((sum, v) => sum + v.result.metrics.confidence, 0) /
            validResults.length
          : 0,
      averageDataFreshness:
        validResults.length > 0
          ? validResults.reduce((sum, v) => sum + v.result.metrics.dataFreshness, 0) /
            validResults.length
          : 0,
      averageSignalQuality:
        validResults.length > 0
          ? validResults.reduce((sum, v) => sum + v.result.metrics.signalQuality, 0) /
            validResults.length
          : 0,
      ruleStats,
    };
  }
}

export const predictionValidator = PredictionValidator.getInstance();
