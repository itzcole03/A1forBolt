import React, { createContext, useContext, useState, useCallback } from 'react';
import { Sport, PropType } from '../types';

interface StrategyInput {
  stake: number;
  minConfidence: number;
  selectedStrategies: string[];
  maxPayout: number;
  minPayout: number;
  selectedSports: Sport[];
  selectedPropTypes: PropType[];
}

interface StrategyInputContextType {
  strategyInput: StrategyInput;
  updateStrategyInput: (input: Partial<StrategyInput>) => void;
  resetStrategyInput: () => void;
}

const defaultStrategyInput: StrategyInput = {
  stake: 100,
  minConfidence: 0.55,
  selectedStrategies: [],
  maxPayout: 5,
  minPayout: 1.5,
  selectedSports: [],
  selectedPropTypes: [],
};

const StrategyInputContext = createContext<StrategyInputContextType | undefined>(undefined);

export const StrategyInputProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [strategyInput, setStrategyInput] = useState<StrategyInput>(defaultStrategyInput);

  const updateStrategyInput = useCallback((input: Partial<StrategyInput>) => {
    setStrategyInput(prev => ({ ...prev, ...input }));
  }, []);

  const resetStrategyInput = useCallback(() => {
    setStrategyInput(defaultStrategyInput);
  }, []);

  return (
    <StrategyInputContext.Provider
      value={{ strategyInput, updateStrategyInput, resetStrategyInput }}
    >
      {children}
    </StrategyInputContext.Provider>
  );
};

export const useStrategyInput = () => {
  const context = useContext(StrategyInputContext);
  if (!context) {
    throw new Error('useStrategyInput must be used within a StrategyInputProvider');
  }
  return context;
};
