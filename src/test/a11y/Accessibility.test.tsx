import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import Dashboard from '../../pages/Dashboard';
import PropCards from '../../components/modern/PropCards';
import MoneyMaker from '../../components/modern/MoneyMaker';
import EntryTracking from '../../components/modern/EntryTracking';
import Settings from '../../components/modern/Settings';
import useStore from '../../store/useStore';
import { Entry, PlayerProp } from '../../types/core';
import { ProcessedPrizePicksProp } from '../../types/prizePicks';

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Reset store state
    const store = useStore.getState();
    store.setProps([]);
    store.opportunities = [];
    store.alerts = [];
    store.darkMode = false;
  });

  it('should have no accessibility violations in App', async () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in Dashboard', async () => {
    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in PropCards', async () => {
    const props: Partial<ProcessedPrizePicksProp>[] = [
      {
        player_name: 'John Doe',
        team_abbreviation: 'LAL',
        stat_type: 'POINTS',
        line_value: 20.5,
        pick_count: '1000',
        game_time: '2024-05-31T19:00:00Z',
        winningProp: {
          type: 'normal',
          percentage: 0.8,
          line: 20.5,
          icon: '⇄',
          multiplier: 1.95,
        },
      },
    ];

    const { container } = render(
      <BrowserRouter>
        <PropCards />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in MoneyMaker', async () => {
    const { container } = render(
      <BrowserRouter>
        <MoneyMaker />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in EntryTracking', async () => {
    const playerProp: PlayerProp = {
      id: 'prop-1',
      player: {
        id: 'player-1',
        name: 'John Doe',
        team: {
          id: 'team-1',
          name: 'Team A',
          sport: 'NBA',
        },
      },
      type: 'POINTS',
      line: 20.5,
      odds: 1.95,
      confidence: 0.8,
      timestamp: Date.now(),
    };

    const entries: Entry[] = [
      {
        id: 'entry-1',
        userId: 'user-1',
        status: 'active',
        type: 'single',
        props: [playerProp],
        stake: 100,
        potentialPayout: 195,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        date: new Date().toISOString(),
        legs: [],
        entry: 'entry-1',
        picks: [],
      },
    ];

    const { container } = render(
      <BrowserRouter>
        <EntryTracking entries={entries} />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in Settings', async () => {
    const { container } = render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels and roles', async () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Check navigation
    expect(container.querySelector('nav')).toHaveAttribute('aria-label', 'Main navigation');
    expect(container.querySelector('main')).toHaveAttribute('role', 'main');

    // Check buttons
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });

    // Check form inputs
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-label');
    });

    // Check modal dialogs
    const dialogs = container.querySelectorAll('[role="dialog"]');
    dialogs.forEach(dialog => {
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });
  });

  it('should have proper color contrast', async () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  it('should have proper keyboard navigation', async () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Check tab indices
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusableElements.forEach(element => {
      expect(element).toHaveAttribute('tabindex');
    });

    // Check skip links
    const skipLink = container.querySelector('[href="#main-content"]');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('tabindex', '0');
  });

  it('should have proper heading hierarchy', async () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(heading => parseInt(heading.tagName[1]));

    // Check if heading levels are sequential
    headingLevels.reduce((prevLevel, currentLevel) => {
      expect(currentLevel).toBeLessThanOrEqual(prevLevel + 1);
      return currentLevel;
    }, 0);
  });
});
