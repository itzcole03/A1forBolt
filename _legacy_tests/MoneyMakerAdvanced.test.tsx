import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MoneyMakerAdvanced, BettingOpportunity } from './MoneyMakerAdvanced';
import { webSocketManager } from '../../services/unified/WebSocketManager';

jest.mock('../../services/unified/WebSocketManager', () => {
  const listeners: Record<string, Function[]> = {};
  return {
    webSocketManager: {
      on: (event: string, cb: Function) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(cb);
      },
      off: (event: string, cb: Function) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter(fn => fn !== cb);
        }
      },
      emit: (event: string, data: any) => {
        (listeners[event] || []).forEach(fn => fn(data));
      }
    }
  };
});

describe('MoneyMakerAdvanced', () => {
  it('renders and updates on WebSocket betting:opportunity event', async () => {
    render(<MoneyMakerAdvanced />);
    expect(screen.getByText(/Loading MoneyMaker Advanced/i)).toBeInTheDocument();

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    // Simulate a betting opportunity event
    const testOpportunity: BettingOpportunity = {
      id: '1',
      description: 'Test Bet',
      odds: 2.5,
      confidence: 0.8,
      expectedValue: 1.2,
      kellySize: 0.5,
      models: ['ModelA']
    };
    act(() => {
      (webSocketManager as any).emit('betting:opportunity', testOpportunity);
    });

    // Check that the opportunity appears in the UI
    expect(await screen.findByText('Test Bet')).toBeInTheDocument();
  });
});
