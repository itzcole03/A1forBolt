import Analytics from '../components/Analytics';
import App from '../App';
import EntryBuilder from '../components/EntryBuilder';
import Predictions from '../components/Predictions';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { store } from '../store';


expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  test('App should have no accessibility violations', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('EntryBuilder should have no accessibility violations', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <EntryBuilder />
        </BrowserRouter>
      </Provider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Analytics should have no accessibility violations', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Analytics />
        </BrowserRouter>
      </Provider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Predictions should have no accessibility violations', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Predictions />
        </BrowserRouter>
      </Provider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('All form inputs should have labels', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EntryBuilder />
        </BrowserRouter>
      </Provider>
    );

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-label');
    });

    const selects = screen.getAllByRole('combobox');
    selects.forEach(select => {
      expect(select).toHaveAttribute('aria-label');
    });
  });

  test('All interactive elements should be keyboard accessible', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('tabIndex');
    });

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('tabIndex');
    });
  });

  test('All images should have alt text', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
  });

  test('Color contrast should meet WCAG standards', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
    expect(results).toHaveNoViolations();
  });

  test('All modals should be accessible', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    const modals = screen.getAllByRole('dialog');
    modals.forEach(modal => {
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });
  });
}); 