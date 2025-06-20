// src/services/ml_service.ts
import axios from 'axios';
import type { ModelVersionMetrics, RiskMetrics } from '@/types';
import { mlService } from './analytics/mlService';

export const useMLService = () => {
  return {
    getModelMetrics: mlService.getModelMetrics?.bind(mlService),
  };
};
