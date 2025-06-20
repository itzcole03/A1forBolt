// Advanced filtering and contextual input types for betting and prediction

export type FilterOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'contains' | 'range';

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface PredictionFilter {
  key: string;
  label: string;
  operator: FilterOperator;
  value: string | number | [number, number] | string[] | number[];
  options?: FilterOption[];
  context?: string;
}

export interface AdvancedFilterSet {
  filters: PredictionFilter[];
  appliedAt: string; // ISO timestamp
  description?: string;
}

export interface ContextualInput {
  team?: string;
  player?: string;
  league?: string;
  market?: string;
  oddsRange?: [number, number];
  timeFrame?: [string, string]; // ISO date range
  customContext?: Record<string, string | number | boolean>;
}
