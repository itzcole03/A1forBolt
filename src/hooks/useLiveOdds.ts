import useStore from '../store/useStore';
import { OddsUpdate, PlayerProp, Sport, PropType } from '../types';
import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';



interface UseLiveOddsOptions {
  sport?: Sport;
  propType?: PropType;
  minOddsChange?: number;
}

export const useLiveOdds = ({
  sport,
  propType,
  minOddsChange = 0.1
}: UseLiveOddsOptions = {}) => {
  const [updates, setUpdates] = useState<OddsUpdate[]>([]);
  const [activeProps, setActiveProps] = useState<PlayerProp[]>([]);
  const { addToast } = useStore();

  const { send, isConnected } = useWebSocket({
    url: 'wss://api.betproai.com/ws/odds',
    onMessage: useCallback(
      (message: any) => {
        if (message.type === 'odds_update') {
          const update = message.data as OddsUpdate;
          
          // Filter by sport and prop type if specified
          if (sport && update.sport !== sport) return;
          if (propType && update.propType !== propType) return;

          // Only show significant changes
          const oddsChange = Math.abs(update.newOdds - update.oldOdds);
          if (oddsChange < minOddsChange) return;

          setUpdates(prev => {
            const newUpdates = [update, ...prev].slice(0, 50); // Keep last 50 updates
            return newUpdates;
          });

          // Notify on significant changes
          if (oddsChange >= 0.5) {
            addToast({
              id: `odds-update-${update.id}`,
              type: 'info',
              title: 'Significant Odds Movement',
              message: `${update.player} ${update.propType} line has moved from ${update.oldOdds} to ${update.newOdds}`
            });
          }
        }
      },
      [sport, propType, minOddsChange, addToast]
    )
  });

  // Subscribe to specific props
  const subscribe = useCallback(
    (props: PlayerProp[]) => {
      if (!isConnected) return;

      setActiveProps(props);
      send({
        type: 'subscribe',
        data: props.map(prop => ({
          id: prop.id,
          sport: prop.player.team.sport,
          propType: prop.type
        }))
      });
    },
    [isConnected, send]
  );

  // Unsubscribe from specific props
  const unsubscribe = useCallback(
    (propIds: string[]) => {
      if (!isConnected) return;

      setActiveProps(prev => prev.filter(prop => !propIds.includes(prop.id)));
      send({
        type: 'unsubscribe',
        data: propIds
      });
    },
    [isConnected, send]
  );

  // Resubscribe on reconnection
  useEffect(() => {
    if (isConnected && activeProps.length > 0) {
      subscribe(activeProps);
    }
  }, [isConnected, activeProps, subscribe]);

  return {
    updates,
    activeProps,
    isConnected,
    subscribe,
    unsubscribe,
    clearUpdates: () => setUpdates([])
  };
}; 