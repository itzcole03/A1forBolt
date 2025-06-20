import './styles/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Initialize any global configurations or polyfills here
if (import.meta.env.MODE === 'development') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({ onUnhandledRequest: 'bypass' });
  });
}

// Check for dark mode preference
if (
  localStorage.theme === 'dark' ||
  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Listen for system dark mode changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!('theme' in localStorage)) {
    if (e.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
