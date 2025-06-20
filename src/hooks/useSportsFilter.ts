import { create } from 'zustand';

interface Sport {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

interface SportsFilterState {
  sports: Sport[];
  activeSport: Sport | null;
  setActiveSport: (sport: Sport) => void;
  toggleSport: (sportId: string) => void;
  addSport: (sport: Sport) => void;
  removeSport: (sportId: string) => void;
}

const defaultSports: Sport[] = [
  {
    id: 'nfl',
    name: 'NFL',
    icon: '🏈',
    isActive: true,
  },
  {
    id: 'nba',
    name: 'NBA',
    icon: '🏀',
    isActive: false,
  },
  {
    id: 'mlb',
    name: 'MLB',
    icon: '⚾',
    isActive: false,
  },
  {
    id: 'nhl',
    name: 'NHL',
    icon: '🏒',
    isActive: false,
  },
];

export const useSportsFilter = create<SportsFilterState>(set => ({
  sports: defaultSports,
  activeSport: defaultSports[0],

  setActiveSport: sport => set(() => ({ activeSport: sport })),

  toggleSport: sportId =>
    set(state => ({
      sports: state.sports.map(sport =>
        sport.id === sportId ? { ...sport, isActive: !sport.isActive } : sport
      ),
    })),

  addSport: sport =>
    set(state => ({
      sports: [...state.sports, sport],
    })),

  removeSport: sportId =>
    set(state => ({
      sports: state.sports.filter(sport => sport.id !== sportId),
      activeSport: state.activeSport?.id === sportId ? null : state.activeSport,
    })),
}));
