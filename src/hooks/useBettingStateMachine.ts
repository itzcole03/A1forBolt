import useStore from '../store/useStore';
import { BettingDecision, PlayerProp } from '../types';
import { useCallback } from 'react';
import { useStateMachine } from './useStateMachine';



type BettingState = 
  | 'idle'
  | 'selecting'
  | 'analyzing'
  | 'reviewing'
  | 'confirming'
  | 'submitting'
  | 'completed'
  | 'error';

type BettingEvent =
  | 'SELECT'
  | 'ANALYZE'
  | 'REVIEW'
  | 'CONFIRM'
  | 'SUBMIT'
  | 'RETRY'
  | 'RESET';

interface BettingContext {
  selectedProps: PlayerProp[];
  analysis: BettingDecision | null;
  stake: number;
  error: Error | null;
}

interface UseBettingStateMachineOptions {
  onStateChange?: (from: BettingState, to: BettingState) => void;
  onSubmit?: (context: BettingContext) => Promise<void>;
}

export function useBettingStateMachine({
  onStateChange,
  onSubmit
}: UseBettingStateMachineOptions = {}) {
  const { addToast } = useStore();

  const machine = useStateMachine<BettingState, BettingEvent, BettingContext>({
    initial: 'idle',
    context: {
      selectedProps: [],
      analysis: null,
      stake: 0,
      error: null
    },
    states: {
      idle: {
        on: {
          SELECT: { target: 'selecting' }
        },
        onEnter: (context) => {
          // Reset context when entering idle state
          context.selectedProps = [];
          context.analysis = null;
          context.stake = 0;
          context.error = null;
        }
      },
      selecting: {
        on: {
          ANALYZE: {
            target: 'analyzing',
            guard: (context) => context.selectedProps.length > 0
          },
          RESET: { target: 'idle' }
        }
      },
      analyzing: {
        on: {
          REVIEW: { target: 'reviewing' },
          RESET: { target: 'idle' }
        },
        onEnter: async (context) => {
          try {
            // Analysis will be handled by useAnalytics hook
            // This is just state management
            context.error = null;
          } catch (err) {
            context.error = err instanceof Error ? err : new Error('Analysis failed');
            machine.send('RESET');
          }
        }
      },
      reviewing: {
        on: {
          CONFIRM: {
            target: 'confirming',
            guard: (context) => context.analysis !== null && context.stake > 0
          },
          SELECT: { target: 'selecting' },
          RESET: { target: 'idle' }
        }
      },
      confirming: {
        on: {
          SUBMIT: { target: 'submitting' },
          REVIEW: { target: 'reviewing' },
          RESET: { target: 'idle' }
        }
      },
      submitting: {
        on: {
          RESET: { target: 'idle' }
        },
        onEnter: async (context) => {
          try {
            await onSubmit?.(context);
            machine.send('RESET');
            addToast({
              id: 'bet-submitted',
              type: 'success',
              title: 'Success',
              message: 'Bet submitted successfully'
            });
          } catch (err) {
            context.error = err instanceof Error ? err : new Error('Submission failed');
            machine.send('RESET');
            addToast({
              id: 'bet-error',
              type: 'error',
              title: 'Error',
              message: 'Failed to submit bet'
            });
          }
        }
      },
      completed: {
        on: {
          RESET: { target: 'idle' }
        }
      },
      error: {
        on: {
          RETRY: { target: 'analyzing' },
          RESET: { target: 'idle' }
        }
      }
    },
    onTransition: (from, to) => {
      onStateChange?.(from, to);
    }
  });

  const selectProps = useCallback((props: PlayerProp[]) => {
    machine.context.selectedProps = props;
    machine.send('ANALYZE');
  }, [machine]);

  const setStake = useCallback((stake: number) => {
    machine.context.stake = stake;
  }, [machine]);

  const setAnalysis = useCallback((analysis: BettingDecision) => {
    machine.context.analysis = analysis;
    machine.send('REVIEW');
  }, [machine]);

  return {
    state: machine.state,
    context: machine.context,
    can: machine.can,
    send: machine.send,
    selectProps,
    setStake,
    setAnalysis
  };
} 