import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BettingOpportunities } from '../BettingOpportunities';
import { BettingOpportunityService } from '../../services/bettingOpportunityService';
import { ArbitrageOpportunity, LineShoppingResult } from '../../types/betting';
import { Notification } from '../../services/notification/notificationManager';
import { Prediction } from '../../services/predictionService';

jest.mock('../../services/bettingOpportunityService');

describe('BettingOpportunities', () => {
  let mockService: jest.Mocked<BettingOpportunityService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = BettingOpportunityService.getInstance() as jest.Mocked<BettingOpportunityService>;
  });

  it('renders monitoring button', () => {
    render(<BettingOpportunities />);
    expect(screen.getByText('Start Monitoring')).toBeInTheDocument();
  });

  it('starts monitoring when button is clicked', () => {
    render(<BettingOpportunities />);
    fireEvent.click(screen.getByText('Start Monitoring'));
    expect(mockService.startMonitoring).toHaveBeenCalled();
  });

  it('stops monitoring when button is clicked while active', () => {
    render(<BettingOpportunities />);
    fireEvent.click(screen.getByText('Start Monitoring'));
    fireEvent.click(screen.getByText('Stop Monitoring'));
    expect(mockService.stopMonitoring).toHaveBeenCalled();
  });

  it('displays notifications', () => {
    const mockNotification: Notification = {
      id: 'test-id',
      type: 'arbitrage',
      title: 'Test Notification',
      message: 'Test message',
      priority: 'high',
      timestamp: Date.now(),
      read: false,
    };

    render(<BettingOpportunities />);
    act(() => {
      mockService.emit('newNotification', mockNotification);
    });

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('displays arbitrage opportunities', () => {
    const mockOpportunity: ArbitrageOpportunity = {
      id: 'test-id',
      timestamp: Date.now(),
      profitMargin: 0.05,
      totalStake: 1000,
      expectedProfit: 50,
      legs: [
        {
          bookId: 'book1',
          propId: 'prop1',
          odds: 2.0,
          stake: 500,
          maxStake: 1000,
          timestamp: Date.now(),
        },
      ],
      risk: {
        exposure: 1000,
        confidence: 0.8,
        timeSensitivity: 0.5,
      },
      status: 'pending',
    };

    render(<BettingOpportunities />);
    act(() => {
      mockService.emit('arbitrageOpportunity', mockOpportunity);
    });

    expect(screen.getByText('prop1 - 5.00% profit')).toBeInTheDocument();
    expect(screen.getByText('Total stake: $1000.00')).toBeInTheDocument();
  });

  it('displays line shopping opportunities', () => {
    const mockOpportunity: LineShoppingResult = {
      eventId: 'event1',
      market: 'market1',
      selection: 'selection1',
      bestOdds: {
        bookmaker: 'book1',
        odds: 2.0,
        timestamp: Date.now(),
      },
      allOdds: [
        {
          bookmaker: 'book1',
          odds: 2.0,
          timestamp: Date.now(),
        },
      ],
      priceImprovement: 5,
      confidence: 0.8,
    };

    render(<BettingOpportunities />);
    act(() => {
      mockService.emit('lineShoppingOpportunity', mockOpportunity);
    });

    expect(screen.getByText('selection1 - 5.00% better')).toBeInTheDocument();
    expect(screen.getByText('Best odds: 2.00 @ book1')).toBeInTheDocument();
  });

  it('displays predictions', () => {
    const mockPrediction: Prediction = {
      id: 'test-id',
      propId: 'prop1',
      predictedValue: 0.75,
      confidence: 0.85,
      factors: [
        {
          name: 'historical_performance',
          weight: 0.4,
          value: 0.8,
        },
        {
          name: 'odds_movement',
          weight: 0.3,
          value: 0.7,
        },
      ],
      timestamp: Date.now(),
    };

    render(<BettingOpportunities />);
    act(() => {
      mockService.emit('prediction', mockPrediction);
    });

    expect(screen.getByText('prop1 - 0.75')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 85.0%')).toBeInTheDocument();
    expect(screen.getByText('historical_performance: 80.0% (weight: 0.4)')).toBeInTheDocument();
    expect(screen.getByText('odds_movement: 70.0% (weight: 0.3)')).toBeInTheDocument();
  });

  it('marks notification as read when button is clicked', () => {
    const mockNotification: Notification = {
      id: 'test-id',
      type: 'arbitrage',
      title: 'Test Notification',
      message: 'Test message',
      priority: 'high',
      timestamp: Date.now(),
      read: false,
    };

    render(<BettingOpportunities />);
    act(() => {
      mockService.emit('newNotification', mockNotification);
    });

    fireEvent.click(screen.getByText('Mark as read'));
    expect(mockService.markNotificationAsRead).toHaveBeenCalledWith('test-id');
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(<BettingOpportunities />);
    unmount();
    expect(mockService.removeAllListeners).toHaveBeenCalled();
  });
});
