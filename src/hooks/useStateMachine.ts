import { useState, useCallback, useRef, useEffect } from 'react';



type StateConfig<TState extends string, TEvent extends string> = {
  [K in TState]: {
    on?: {
      [E in TEvent]?: {
        target: TState;
        action?: (context: unknown) => void;
        guard?: (context: unknown) => boolean;
      };
    };
    onEnter?: (context: unknown) => void;
    onExit?: (context: unknown) => void;
  };
};

interface StateMachineOptions<TState extends string, TEvent extends string> {
  initial: TState;
  states: StateConfig<TState, TEvent>;
  context?: unknown;
  onTransition?: (from: TState, to: TState, event: TEvent) => void;
}

interface StateMachineResult<TState extends string, TEvent extends string> {
  state: TState;
  context: unknown;
  send: (event: TEvent) => void;
  can: (event: TEvent) => boolean;
  matches: (state: TState) => boolean;
  history: Array<{ state: TState; event: TEvent | null }>;
}

export function useStateMachine<TState extends string, TEvent extends string>({
  initial,
  states,
  context: initialContext = {},
  onTransition
}: StateMachineOptions<TState, TEvent>): StateMachineResult<TState, TEvent> {
  const [currentState, setCurrentState] = useState<TState>(initial);
  const [context, setContext] = useState(initialContext);
  const historyRef = useRef<Array<{ state: TState; event: TEvent | null }>>([
    { state: initial, event: null }
  ]);

  const transition = useCallback(
    (event: TEvent) => {
      const stateConfig = states[currentState];
      const eventConfig = stateConfig.on?.[event];

      if (!eventConfig) {
        console.warn(
          `No transition defined for event "${event}" in state "${currentState}"`
        );
        return false;
      }

      if (eventConfig.guard && !eventConfig.guard(context)) {
        console.warn(
          `Transition guard prevented event "${event}" in state "${currentState}"`
        );
        return false;
      }

      // Execute exit action of current state
      stateConfig.onExit?.(context);

      // Execute transition action
      if (eventConfig.action) {
        eventConfig.action(context);
      }

      const nextState = eventConfig.target;

      // Execute enter action of next state
      states[nextState].onEnter?.(context);

      // Update state
      setCurrentState(nextState);
      historyRef.current.push({ state: nextState, event });

      // Notify transition listeners
      onTransition?.(currentState, nextState, event);

      return true;
    },
    [currentState, states, context, onTransition]
  );

  const can = useCallback(
    (event: TEvent): boolean => {
      const stateConfig = states[currentState];
      const eventConfig = stateConfig.on?.[event];

      if (!eventConfig) {
        return false;
      }

      if (eventConfig.guard && !eventConfig.guard(context)) {
        return false;
      }

      return true;
    },
    [currentState, states, context]
  );

  const matches = useCallback(
    (state: TState): boolean => currentState === state,
    [currentState]
  );

  useEffect(() => {
    // Execute initial state's enter action
    states[initial].onEnter?.(context);
  }, [initial, states]);

  return {
    state: currentState,
    context,
    send: transition,
    can,
    matches,
    history: historyRef.current
  };
}

// Example usage:
/*
// Define your states and events as string literals
type BetState = 'idle' | 'selecting' | 'reviewing' | 'confirming' | 'submitted';
type BetEvent = 'SELECT' | 'REVIEW' | 'CONFIRM' | 'SUBMIT' | 'RESET';

function BettingForm() {
  const machine = useStateMachine<BetState, BetEvent>({
    initial: 'idle',
    states: {
      idle: {
        on: {
          SELECT: { target: 'selecting' }
        },
        onEnter: (context) => {
          // Reset form data
          context.selectedBets = [];
        }
      },
      selecting: {
        on: {
          REVIEW: {
            target: 'reviewing',
            guard: (context) => context.selectedBets.length > 0
          },
          RESET: { target: 'idle' }
        }
      },
      reviewing: {
        on: {
          CONFIRM: { target: 'confirming' },
          SELECT: { target: 'selecting' }
        }
      },
      confirming: {
        on: {
          SUBMIT: {
            target: 'submitted',
            action: (context) => {
              // Submit bets to API
              submitBets(context.selectedBets);
            }
          },
          REVIEW: { target: 'reviewing' }
        }
      },
      submitted: {
        on: {
          RESET: { target: 'idle' }
        },
        onEnter: (context) => {
          // Show success message
          toast.success('Bets submitted successfully!');
        }
      }
    },
    context: {
      selectedBets: [],
      totalStake: 0
    },
    onTransition: (from, to, event) => {
      
    }
  });

  return (
    <div>
      <div>Current State: {machine.state}</div>
      {machine.matches('idle') && (
        <button
          onClick={() => machine.send('SELECT')}
          disabled={!machine.can('SELECT')}
        >
          Start Betting
        </button>
      )}
      {machine.matches('selecting') && (
        <>
          {/* Bet selection form *//*}
          <button
            onClick={() => machine.send('REVIEW')}
            disabled={!machine.can('REVIEW')}
          >
            Review Bets
          </button>
        </>
      )}
      {/* ... other state-specific UI *//*}
    </div>
  );
}
*/ 