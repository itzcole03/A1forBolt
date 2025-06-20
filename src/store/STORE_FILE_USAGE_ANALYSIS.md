# Store Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/store` directory and its immediate subdirectories. Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains Zustand-based state management stores, slices, and utilities for the frontend application. It includes global app state, prediction/model stores, theming, and modular slices for authentication, notifications, bet slips, and more. These stores are central to managing UI, user, and analytics state across the app.

---

## File Breakdown

### index.ts
- **Purpose:** Defines the main Zustand app store, including user, bets, props, stats, performance, headlines, and UI state.
- **Usage:** Used throughout the app for global state management and UI updates.
- **Notes:** Centralizes state and actions for all major app domains.
- **Status:** Actively used; not a candidate for removal.

### modelStore.ts
- **Purpose:** Zustand store for managing prediction models, including active model and model options.
- **Usage:** Used to select and manage prediction models in analytics and prediction flows.
- **Notes:** Supports persistence and model versioning.
- **Status:** Actively used; not a candidate for removal.

### predictionStore.ts
- **Purpose:** Zustand store for managing prediction state, settings, analytics, and UI loading state.
- **Usage:** Used in prediction and analytics modules to manage lineups, opportunities, and metrics.
- **Notes:** Supports advanced settings and analytics tracking.
- **Status:** Actively used; not a candidate for removal.

### themeStore.ts
- **Purpose:** Zustand store for theme mode (light/dark) with persistence.
- **Usage:** Used to toggle and persist theme preference across sessions.
- **Notes:** Simple toggle and storage for theme state.
- **Status:** Actively used; not a candidate for removal.

### types.ts
- **Purpose:** Type definitions for app state and toast notifications.
- **Usage:** Shared across stores and components for type safety.
- **Notes:** Includes error and loading state for global app state.
- **Status:** Actively used; not a candidate for removal.

### useAppStore.ts
- **Purpose:** Combines modular Zustand slices (auth, notifications, bet slip, etc.) into a single app store.
- **Usage:** Used for advanced state management and modularization of app state.
- **Notes:** Integrates multiple slices and supports persistence.
- **Status:** Actively used; not a candidate for removal.

### useStore.ts
- **Purpose:** Zustand store for user, props, entries, metrics, opportunities, alerts, and UI state.
- **Usage:** Used for global state management, authentication, and analytics.
- **Notes:** Supports devtools and persistence middleware.
- **Status:** Actively used; not a candidate for removal.

### useThemeStore.ts
- **Purpose:** Zustand store for theme (dark/light/system) with persistence.
- **Usage:** Used to set and persist theme preference.
- **Notes:** Simple and extensible for theming needs.
- **Status:** Actively used; not a candidate for removal.

#### ml-predictions/index.ts
- **Purpose:** Zustand store for managing ML predictions, loading state, and errors.
- **Usage:** Used in ML prediction modules to manage and update predictions.
- **Notes:** Supports devtools and modular prediction state/actions.
- **Status:** Actively used; not a candidate for removal.

#### slices/authSlice.ts
- **Purpose:** Zustand slice for authentication state, token management, and WebSocket auth status.
- **Usage:** Used in modular app store for authentication flows and session management.
- **Notes:** Supports async login/logout and session rehydration.
- **Status:** Actively used; not a candidate for removal.

#### slices/prizePicksSlice.ts
- **Purpose:** Zustand slice for PrizePicks props, players, lines, and entries.
- **Usage:** Used in modular app store for PrizePicks data management.
- **Notes:** Supports async fetching and error handling.
- **Status:** Actively used; not a candidate for removal.

#### slices/betSlipSlice.ts
- **Purpose:** Zustand slice for bet slip state, legs, stake, payout, and submission.
- **Usage:** Used in modular app store for bet slip management and submission.
- **Notes:** Includes odds conversion and async submission.
- **Status:** Actively used; not a candidate for removal.

#### slices/notificationSlice.ts
- **Purpose:** Zustand slice for toast notifications.
- **Usage:** Used in modular app store for managing toasts and notifications.
- **Notes:** Supports adding/removing toasts with unique IDs.
- **Status:** Actively used; not a candidate for removal.

#### slices/bankrollSlice.ts
- **Purpose:** Zustand slice for bankroll state, transactions, settings, and stats.
- **Usage:** Used to manage bankroll, add transactions, and update settings.
- **Notes:** Supports stats refresh and reset.
- **Status:** Actively used; not a candidate for removal.

#### slices/betHistorySlice.ts
- **Purpose:** Zustand slice for user/model bet history state.
- **Usage:** Used to manage and update bet history for users and models.
- **Notes:** Supports adding, setting, and clearing history.
- **Status:** Actively used; not a candidate for removal.

#### slices/confidenceSlice.ts
- **Purpose:** Zustand slice for confidence band and win probability state.
- **Usage:** Used to manage prediction confidence and win probability.
- **Notes:** Supports setting, updating, and clearing state.
- **Status:** Actively used; not a candidate for removal.

#### slices/dynamicDataSlice.ts
- **Purpose:** Zustand slice for dynamic data (sentiments, headlines, projections, live odds, subscriptions).
- **Usage:** Used to fetch and update dynamic data from services and APIs.
- **Notes:** Supports async fetching and WebSocket updates.
- **Status:** Actively used; not a candidate for removal.

#### slices/simulationSlice.ts
- **Purpose:** Zustand slice for bet simulation input/result state.
- **Usage:** Used to manage simulation input and results for bet simulations.
- **Notes:** Supports setting, updating, and clearing simulation state.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the store directory.*
