# Pages Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/pages` directory, including all nested subdirectories and files. Each entry includes purpose, usage, notes, and status, following the required documentation style.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)
- [Subdirectory File Breakdown](#subdirectory-file-breakdown)

---

## Overview

This directory contains all page-level React components for the frontend application. Each file represents a route or major view, handling layout, data fetching, and integration with core services and UI components.

---

## File Breakdown

### Admin.tsx
- **Purpose:** Admin dashboard for managing model settings, error logs, and cache.
- **Usage:** Used by administrators to monitor and configure backend and frontend features.
- **Notes:** Integrates with error handling, model settings, and cache management components.
- **Status:** Actively used; not a candidate for removal.

### Analytics.tsx
- **Purpose:** Analytics dashboard for visualizing trends, metrics, and model performance.
- **Usage:** Used to display charts and analytics for users and admins.
- **Notes:** Integrates with analytics service and charting libraries.
- **Status:** Actively used; not a candidate for removal.

### AnalyticsPage.tsx
- **Purpose:** Modern analytics dashboard with advanced widgets and visualizations.
- **Usage:** Used to display prediction confidence, risk, trends, and SHAP explanations.
- **Notes:** Integrates with advanced analytics and personalization services.
- **Status:** Actively used; not a candidate for removal.

### ArbitragePage.tsx
- **Purpose:** Displays arbitrage betting opportunities and related analytics.
- **Usage:** Used by users to find and act on arbitrage opportunities.
- **Notes:** Fetches opportunities from API; supports filtering and selection.
- **Status:** Actively used; not a candidate for removal.

### AuthPage.tsx
- **Purpose:** Main authentication page (login/register/forgot/reset password).
- **Usage:** Used for user authentication flows.
- **Notes:** May be split into subpages in `auth/`.
- **Status:** Actively used; not a candidate for removal.

### BankrollPage.tsx
- **Purpose:** Displays user bankroll, transaction history, and active bets.
- **Usage:** Used by users to track their financial activity and exposure.
- **Notes:** Fetches data from API; supports filtering by timeframe.
- **Status:** Actively used; not a candidate for removal.

### BetsPage.tsx
- **Purpose:** Main betting interface, including bet slip, history, and widgets.
- **Usage:** Used by users to place and track bets.
- **Notes:** Integrates with betting services and advanced widgets.
- **Status:** Actively used; not a candidate for removal.

### DashboardPage.tsx
- **Purpose:** Main dashboard view, aggregating predictions, analytics, and user stats.
- **Usage:** Used as the landing page after login.
- **Notes:** Integrates with prediction, analytics, and advanced widgets.
- **Status:** Actively used; not a candidate for removal.

### HomePage.jsx
- **Purpose:** Landing page for the platform, introducing features and navigation.
- **Usage:** Used as the public homepage.
- **Notes:** Simple layout; highlights live predictions, metrics, and risk analysis.
- **Status:** Actively used; not a candidate for removal.

### LineupBuilderPage.tsx
- **Purpose:** Page for building and analyzing betting lineups.
- **Usage:** Used by users to create and optimize lineups.
- **Notes:** Integrates with prediction and lineup services.
- **Status:** Actively used; not a candidate for removal.

### LineupPage.tsx
- **Purpose:** Displays betting lineups and top picks.
- **Usage:** Used by users to view and select lineups.
- **Notes:** Uses motion and MUI for layout and animation.
- **Status:** Actively used; not a candidate for removal.

### LoginPage.tsx
- **Purpose:** Login page for user authentication.
- **Usage:** Used by users to log in to the platform.
- **Notes:** Integrates with auth service and store.
- **Status:** Actively used; not a candidate for removal.

### NotFound.tsx
- **Purpose:** 404 error page for unknown routes.
- **Usage:** Shown when a user navigates to a non-existent page.
- **Notes:** Uses MUI and motion for layout.
- **Status:** Actively used; not a candidate for removal.

### Predictions.tsx
- **Purpose:** Displays predictions, tabs, and analytics for various sports/events.
- **Usage:** Used by users to view and filter predictions.
- **Notes:** Integrates with analytics and prediction services.
- **Status:** Actively used; not a candidate for removal.

### PredictionsDashboard.tsx
- **Purpose:** Dashboard for live predictions, model performance, and betting opportunities.
- **Usage:** Used by users to monitor predictions and performance in real time.
- **Notes:** Integrates with WebSocket and prediction services.
- **Status:** Actively used; not a candidate for removal.

### PrizePicksPage.tsx
- **Purpose:** Displays PrizePicks props, player data, and sentiment analysis.
- **Usage:** Used by users to explore and select PrizePicks opportunities.
- **Notes:** Integrates with store, modals, and analytics.
- **Status:** Actively used; not a candidate for removal.

### Profile.tsx
- **Purpose:** User profile page with stats, editable info, and preferences.
- **Usage:** Used by users to view and edit their profile.
- **Notes:** Integrates with MUI and mock data.
- **Status:** Actively used; not a candidate for removal.

### PropsPage.tsx
- **Purpose:** Displays prop bets, analytics, and trending props.
- **Usage:** Used by users to explore and analyze prop bets.
- **Notes:** Integrates with analytics and notification services.
- **Status:** Actively used; not a candidate for removal.

### RegisterPage.tsx
- **Purpose:** Registration page for new users.
- **Usage:** Used by users to create an account.
- **Notes:** Integrates with auth service and store.
- **Status:** Actively used; not a candidate for removal.

### RiskManagerPage.tsx
- **Purpose:** Manages user risk profiles and active bets.
- **Usage:** Used by users to configure risk settings and view exposure.
- **Notes:** Integrates with risk management services.
- **Status:** Actively used; not a candidate for removal.

### Settings.tsx
- **Purpose:** User settings page for notifications, display, betting, and privacy.
- **Usage:** Used by users to configure preferences.
- **Notes:** Integrates with MUI and state management.
- **Status:** Actively used; not a candidate for removal.

### SettingsPage.tsx
- **Purpose:** Wrapper for the modern settings component.
- **Usage:** Used to display the settings UI.
- **Notes:** Simple wrapper; delegates to Settings component.
- **Status:** Actively used; not a candidate for removal.

### SHAPExplain.tsx
- **Purpose:** Displays SHAP value analysis and feature importance.
- **Usage:** Used by users to understand model predictions.
- **Notes:** Placeholder for SHAP visualizations.
- **Status:** Actively used; not a candidate for removal.

### StrategiesPage.tsx
- **Purpose:** Displays available betting strategies and automation toggles.
- **Usage:** Used by users to view and enable/disable strategies.
- **Notes:** Integrates with strategy service and automation toggle.
- **Status:** Actively used; not a candidate for removal.

### Trends.tsx
- **Purpose:** Displays trends, analytics, and charts for sports and betting data.
- **Usage:** Used by users to analyze trends and performance.
- **Notes:** Integrates with analytics service and charting libraries.
- **Status:** Actively used; not a candidate for removal.

---

## Subdirectory File Breakdown

### auth/ForgotPasswordPage.tsx
- **Purpose:** Page for users to request a password reset email.
- **Usage:** Used in the password reset flow.
- **Notes:** Integrates with API service.
- **Status:** Actively used; not a candidate for removal.

### auth/LoginPage.tsx
- **Purpose:** Login page for authentication (auth submodule).
- **Usage:** Used by users to log in.
- **Notes:** Integrates with store and API service.
- **Status:** Actively used; not a candidate for removal.

### auth/RegisterPage.tsx
- **Purpose:** Registration page for new users (auth submodule).
- **Usage:** Used by users to register.
- **Notes:** Integrates with store and API service.
- **Status:** Actively used; not a candidate for removal.

### auth/ResetPasswordPage.tsx
- **Purpose:** Page for users to reset their password using a token.
- **Usage:** Used in the password reset flow.
- **Notes:** Integrates with API service.
- **Status:** Actively used; not a candidate for removal.

### Dashboard/Dashboard.tsx
- **Purpose:** Dashboard component for displaying active bets, winnings, and win rate.
- **Usage:** Used in the main dashboard page.
- **Notes:** Integrates with betting service and react-query.
- **Status:** Actively used; not a candidate for removal.

### Dashboard/__tests__/Dashboard.test.tsx
- **Purpose:** Unit tests for the Dashboard component.
- **Usage:** Ensures correct rendering and error handling.
- **Notes:** Uses React Testing Library and jest.
- **Status:** Active test; not a candidate for removal.

