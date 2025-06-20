export interface UnifiedMetrics {
  track: (name: string, value?: number, tags?: Record<string, string>) => void;
  increment: (name: string, value?: number, tags?: Record<string, string>) => void;
  gauge: (name: string, value: number, tags?: Record<string, string>) => void;
  timing: (name: string, value: number, tags?: Record<string, string>) => void;
  histogram: (name: string, value: number, tags?: Record<string, string>) => void;
}
