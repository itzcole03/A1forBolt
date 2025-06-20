import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PrizePicksService } from '../../services/prizePicksService';
import { ProcessedPrizePicksProp } from '../../types/prizePicks';

// Example types (replace with your actual types)
interface Prop {
  id: string;
  player: string;
  team: string;
  stat: string;
  line: number;
  type: 'goblin' | 'demon' | 'normal';
  percentage: number;
  fireCount: number;
  sentiment?: { score: number; direction: 'up' | 'down' | 'neutral'; tooltip?: string };
  espnLink?: string;
}
interface Entry {
  id: string;
  date: string;
  legs: number;
  entry: number;
  potentialPayout: number;
  status: 'won' | 'lost' | 'pending';
  picks: any[];
}

interface MoneyMakerResult {
  legs: number;
  lineup: Prop[];
  winProbability: number;
  payout: number;
}

interface StateContextType {
  props: Prop[];
  entries: Entry[];
  addEntry: (entry: Entry) => void;
  findOptimalLineup: (entryAmount: number) => MoneyMakerResult | null;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [props, setProps] = useState<Prop[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const service = PrizePicksService.getInstance();
    const load = () => {
      const realProps = service
        .getFilteredProps('high-confidence')
        .map((p: ProcessedPrizePicksProp) => ({
          id: p.player_name + p.stat_type + p.game_time,
          player: p.player_name,
          team: p.team_abbreviation,
          stat: p.stat_type,
          line: p.line_value,
          type: p.winningProp.type,
          percentage: p.winningProp.percentage * 100,
          fireCount: parseInt(p.pick_count) || 0,
          sentiment: undefined, // TODO: integrate real sentiment if available
          // espnLink: p.espnNews || '', // Uncomment if/when available
        }));
      setProps(realProps);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const addEntry = (entry: Entry) => setEntries(prev => [entry, ...prev]);
  const findOptimalLineup = (entryAmount: number) => null; // TODO: implement with real logic

  return (
    <StateContext.Provider value={{ props, entries, addEntry, findOptimalLineup }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useAppState must be used within StateProvider');
  return ctx;
};
