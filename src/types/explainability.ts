export interface ShapValue {
  feature: string;
  value: number;
  impact: number;
  description?: string;
  weight?: number;
  details?: string;
}

export interface ShapSummaryValue extends ShapValue {
  category?: string;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

export interface ShapDetailedValue extends ShapValue {
  breakdown?: {
    label: string;
    value: number;
  }[];
  confidence?: number;
  historicalImpact?: number;
}

export interface ShapVisualizationProps {
  features: ShapValue[];
  title?: string;
  maxFeatures?: number;
  isLoading?: boolean;
  error?: Error | null;
}

export interface ShapBreakdownProps {
  feature: ShapValue;
  isOpen: boolean;
  onClose: () => void;
}
