import { Player, Entry, Lineup, EntryStatus, LineupType, PropType } from '../types';
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';



const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'LeBron James',
    team: 'LAL',
    position: 'SF',
    opponent: 'GSW',
    gameTime: '7:30 PM ET',
    sport: 'NBA',
    fireCount: '3',
    winningProp: {
      stat: 'POINTS',
      line: 28,
      type: 'POINTS',
      percentage: 85
    },
    whyThisBet: 'Averaging 32 PPG in last 5 games vs GSW'
  },
  {
    id: '2',
    name: 'Stephen Curry',
    team: 'GSW',
    position: 'PG',
    opponent: 'LAL',
    gameTime: '7:30 PM ET',
    sport: 'NBA',
    fireCount: '2',
    winningProp: {
      stat: 'THREES',
      line: 5,
      type: 'THREES',
      percentage: 75
    },
    whyThisBet: 'Hit 5+ threes in 8 of last 10 games'
  }
];

const mockEntries: Entry[] = [
  {
    id: '1',
    userId: 'user1',
    status: EntryStatus.PENDING,
    type: LineupType.PARLAY,
    props: [],
    stake: 100,
    potentialWinnings: 260,
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
  }
];

const mockLineups: Lineup[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'High Value Parlay',
    type: LineupType.PARLAY,
    props: [],
    status: EntryStatus.PENDING,
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
  }
];

const handlers = [
  http.get('/api/props', () => {
    return HttpResponse.json({
      success: true,
      data: {
        props: []
      }
    });
  }),

  http.get('/api/odds', () => {
    return HttpResponse.json({
      success: true,
      data: {
        odds: []
      }
    });
  }),

  http.get('/api/predictions', () => {
    return HttpResponse.json({
      success: true,
      data: {
        predictions: []
      }
    });
  }),

  http.get('/api/players', () => {
    return HttpResponse.json(mockPlayers);
  }),

  http.get('/api/entries', () => {
    return HttpResponse.json(mockEntries);
  }),

  http.get('/api/lineups', () => {
    return HttpResponse.json(mockLineups);
  }),
];

export const worker = setupWorker(...handlers); 