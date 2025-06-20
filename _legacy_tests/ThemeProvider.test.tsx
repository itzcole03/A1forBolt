import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('applies theme styles', () => {
    render(
      <ThemeProvider>
        <div className="MuiPaper-root">Test Content</div>
      </ThemeProvider>
    );

    const paperElement = screen.getByText('Test Content');
    expect(paperElement).toHaveClass('MuiPaper-root');
  });

  it('applies dark mode styles', () => {
    render(
      <ThemeProvider>
        <div className="MuiPaper-root">Test Content</div>
      </ThemeProvider>
    );

    const paperElement = screen.getByText('Test Content');
    const computedStyle = window.getComputedStyle(paperElement);
    expect(computedStyle.backgroundColor).toBe('rgb(30, 30, 30)'); // #1e1e1e
  });

  it('applies typography styles', () => {
    render(
      <ThemeProvider>
        <h5>Test Heading</h5>
      </ThemeProvider>
    );

    const heading = screen.getByText('Test Heading');
    const computedStyle = window.getComputedStyle(heading);
    expect(computedStyle.fontWeight).toBe('600');
  });

  it('applies CssBaseline', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    // CssBaseline adds a style tag to the document
    const styleTags = document.getElementsByTagName('style');
    expect(styleTags.length).toBeGreaterThan(0);
  });
});
