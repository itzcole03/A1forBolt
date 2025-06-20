import { useApiRequest } from './useApiRequest';
import { useState, useCallback, useRef, useEffect } from 'react';



interface QueryConfig<T> {
  url: string;
  params?: Record<string, any>;
  transform?: (data: any) => T;
  dependencies?: any[];
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface QueryState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  timestamp: number | null;
}

interface QueryResult<T> extends QueryState<T> {
  refetch: () => Promise<void>;
  setData: (data: T) => void;
  updateData: (updater: (prev: T | null) => T) => void;
  reset: () => void;
}

interface QueryBuilderOptions {
  cacheTime?: number;
  retries?: number;
  retryDelay?: number;
  suspense?: boolean;
}

export function useQueryBuilder<T>(
  config: QueryConfig<T>,
  options: QueryBuilderOptions = {}
): QueryResult<T> {
  const {
    url,
    params,
    transform,
    dependencies = [],
    enabled = true,
    refetchInterval,
    onSuccess,
    onError
  } = config;

  const queryUrl = useCallback(() => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value != null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }, [url, params]);

  const {
    data: rawData,
    error,
    isLoading,
    isValidating,
    mutate
  } = useApiRequest<any>(queryUrl(), {
    cacheTime: options.cacheTime,
    retries: options.retries,
    retryDelay: options.retryDelay,
    enabled: enabled,
    onError
  });

  const [state, setState] = useState<QueryState<T>>({
    data: null,
    error: null,
    isLoading: true,
    isValidating: false,
    timestamp: null
  });

  const transformData = useCallback(
    (data: any): T => {
      if (transform) {
        try {
          return transform(data);
        } catch (error) {
          console.error('Error transforming data:', error);
          throw error;
        }
      }
      return data;
    },
    [transform]
  );

  // Update state when raw data changes
  useEffect(() => {
    if (rawData) {
      try {
        const transformedData = transformData(rawData);
        setState(prev => ({
          ...prev,
          data: transformedData,
          error: null,
          isLoading: false,
          isValidating: false,
          timestamp: Date.now()
        }));
        onSuccess?.(transformedData);
      } catch (error) {
        if (error instanceof Error) {
          setState(prev => ({
            ...prev,
            error,
            isLoading: false,
            isValidating: false
          }));
          onError?.(error);
        }
      }
    }
  }, [rawData, transformData, onSuccess, onError]);

  // Handle error state
  useEffect(() => {
    if (error) {
      setState(prev => ({
        ...prev,
        error,
        isLoading: false,
        isValidating: false
      }));
    }
  }, [error]);

  // Setup refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const intervalId = setInterval(() => {
      mutate();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [refetchInterval, enabled, mutate]);

  // Refetch when dependencies change
  useEffect(() => {
    if (enabled) {
      mutate();
    }
  }, [...dependencies, enabled]);

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      error: null,
      timestamp: Date.now()
    }));
  }, []);

  const updateData = useCallback((updater: (prev: T | null) => T) => {
    setState(prev => ({
      ...prev,
      data: updater(prev.data),
      timestamp: Date.now()
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: true,
      isValidating: false,
      timestamp: null
    });
  }, []);

  return {
    ...state,
    refetch: mutate,
    setData,
    updateData,
    reset
  };
}

// Example usage:
/*
interface BetData {
  id: string;
  odds: number;
  line: number;
  timestamp: string;
}

function BetsList() {
  const {
    data: bets,
    isLoading,
    error,
    refetch,
    updateData
  } = useQueryBuilder<BetData[]>({
    url: '/api/bets',
    params: {
      sport: 'NFL',
      status: 'active'
    },
    transform: (data) => data.map((bet: any) => ({
      ...bet,
      timestamp: new Date(bet.timestamp).toISOString()
    })),
    dependencies: [], // Empty array means only fetch once
    refetchInterval: 30000, // Refetch every 30 seconds
    onSuccess: (data) => {
      
    },
    onError: (error) => {
      console.error('Failed to load bets:', error);
    }
  }, {
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    retries: 3
  });

  const updateBet = (id: string, updates: Partial<BetData>) => {
    updateData((prev) => {
      if (!prev) return prev;
      return prev.map(bet => 
        bet.id === id ? { ...bet, ...updates } : bet
      );
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!bets) return null;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {bets.map(bet => (
        <BetCard
          key={bet.id}
          bet={bet}
          onUpdate={(updates) => updateBet(bet.id, updates)}
        />
      ))}
    </div>
  );
}
*/ 