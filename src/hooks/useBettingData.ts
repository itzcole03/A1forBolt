import useStore from '../store/useStore.ts';
import type { PlayerProp, Opportunity, OddsUpdate } from '../types/core.ts';
import type { Sport, PropType } from '../types/common.ts';
import { oddsjamService } from '../services/oddsjam.ts';
import { dailyFantasyService } from '../services/dailyFantasy.ts';
import { useState, useEffect, useCallback } from 'react';
import { webSocketManager } from '../services/unified/WebSocketManager.ts';



interface UseBettingDataOptions {
  sport?: Sport;
  propType?: PropType;
  autoRefresh?: boolean;
  refreshInterval?: number;
  minOddsChange?: number;
  onNewOpportunity?: (opportunity: Opportunity) => void;
}

export const useBettingData = ({
  sport,
  propType,
  autoRefresh = true,
  refreshInterval = 30000,
  minOddsChange = 0.1,
  onNewOpportunity
}: UseBettingDataOptions = {}) => {
  const [props, setProps] = useState<PlayerProp[]>([]);
  const [oddsUpdates, setOddsUpdates] = useState<OddsUpdate[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<Error | null>(null);
  const store = useStore();
  // Fallback for addToast if not present, memoized for hook safety
  const addToast = React.useMemo(() => store.addToast || (() => {}), [store.addToast]);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      // Fetch player props using unified dailyFantasyService
      const propsData = await dailyFantasyService.getPlayers({ sport, position: propType });
      setProps(propsData as PlayerProp[]);

      // Fetch arbitrage opportunities using unified oddsjamService
      const opportunitiesData = await oddsjamService.getArbitrageOpportunities(sport || 'NBA');
      setOpportunities(opportunitiesData as Opportunity[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      addToast({
        id: 'data-error',
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch betting data'
      });
    } finally {
      setIsLoading(false);
    }
  }, [sport, propType, addToast]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: unknown) => {
    if (typeof message !== 'object' || message === null) return;
    const msg = message as { type: string; data?: unknown };
    switch (msg.type) {
      case 'prop_update': {
        const data = msg.data as PlayerProp;
        setProps(prev => {
          const index = prev.findIndex(p => p.id === data.id);
          if (index === -1) return [...prev, data];
          const updated = [...prev];
          updated[index] = data;
          return updated;
        });
        break;
      }
      case 'odds_update': {
        const update = msg.data as OddsUpdate;
        if (sport && update.sport !== sport) return;
        if (propType && update.propType !== propType) return;
        const oddsChange = Math.abs(update.newOdds - update.oldOdds);
        if (oddsChange < minOddsChange) return;
        setOddsUpdates(prev => [update, ...prev].slice(0, 50));
        if (oddsChange >= 0.5) {
          addToast({
            id: `odds-update-${update.id}`,
            type: 'info',
            title: 'Odds Update',
            message: `Odds updated for ${update.propName} from ${update.oldOdds} to ${update.newOdds}`
          });
        }
        break;
      }
      case 'arbitrage_alert': {
        const opportunity = msg.data as Opportunity;
        setOpportunities(prev => [opportunity, ...prev].slice(0, 50));
        if (onNewOpportunity) onNewOpportunity(opportunity);
        addToast({
          id: `arbitrage-${opportunity.id}`,
          type: 'success',
          title: 'Arbitrage Opportunity',
          message: `New arbitrage opportunity: ${opportunity.description}`
        });
        break;
      }
      default:
        console.log('Unknown message type:', msg.type);
    }
  }, [sport, propType, minOddsChange, addToast, onNewOpportunity]);

  // Set up the event listener
  useEffect(() => {
    webSocketManager.on('message', handleWebSocketMessage);
    return () => {
      try {
        webSocketManager.off('message', handleWebSocketMessage);
      } catch (error) {
        console.error('Error cleaning up WebSocket listener:', error);
      }
    };
  }, [handleWebSocketMessage]);

  // Setup auto-refresh
  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh, refreshInterval]);

  const refresh = () => {
    setIsLoading(true);
    fetchData();
  };

  return {
    props,
    oddsUpdates,
    opportunities,
    isLoading,
    isConnected,
    error,
    refresh
  };
}; 