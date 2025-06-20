# Stores Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/stores` directory, including all nested subdirectories and files. Each entry includes purpose, usage, notes, and status, following the required documentation style.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)
- [Subdirectory File Breakdown](#subdirectory-file-breakdown)

---

## Overview

This directory contains all Zustand-based state management stores for the frontend application. Each file defines a store or slice for a specific domain (betting, user, predictions, UI, etc.), supporting modular, persistent, and testable state logic.

---

## File Breakdown

### appStore.ts
- **Purpose:** Zustand store for global app state (user, setUser).
- **Usage:** Used for managing the current user and related global state.
- **Notes:** Simple store; used in unified store composition.
- **Status:** Actively used; not a candidate for removal.

### bettingStore.ts
- **Purpose:** Zustand store for betting state (active bets, bet slip, odds, selection).
- **Usage:** Used to manage betting actions, odds, and bet slip logic.
- **Notes:** Uses devtools and persist middleware.
- **Status:** Actively used; not a candidate for removal.

### enhanced.ts
- **Purpose:** Zustand store for enhanced user state with validation and metrics.
- **Usage:** Used for advanced user state, validation, and performance tracking.
- **Notes:** Integrates with immer, devtools, and persist middleware.
- **Status:** Actively used; not a candidate for removal.

### filterStore.ts
- **Purpose:** Zustand store for betting filter state and presets.
- **Usage:** Used to manage filters, risk profiles, and filter presets for betting.
- **Notes:** Supports localStorage persistence for filter presets.
- **Status:** Actively used; not a candidate for removal.

### index.ts
- **Purpose:** Re-exports all stores and types; creates a unified store combining all slices.
- **Usage:** Used to provide a single entry point for all state management.
- **Notes:** Integrates with devtools and persist; supports unified RootState.
- **Status:** Actively used; not a candidate for removal.

### mlStore.ts
- **Purpose:** Placeholder for ML-related Zustand store (not implemented).
- **Usage:** Reserved for future ML state logic.
- **Notes:** Currently a stub.
- **Status:** Candidate for future implementation.

### moneyMakerStore.ts
- **Purpose:** Zustand store for MoneyMaker feature (predictions, portfolio, metrics).
- **Usage:** Used to manage MoneyMaker state, predictions, and actions.
- **Notes:** Integrates with auth and prediction services; supports advanced analytics.
- **Status:** Actively used; not a candidate for removal.

### monitoring.ts
- **Purpose:** Zustand store for tracking store performance metrics (update count, durations).
- **Usage:** Used to monitor and optimize store update performance.
- **Notes:** Provides updatePerformanceMetrics utility.
- **Status:** Actively used; not a candidate for removal.

### oddsStore.ts
- **Purpose:** Zustand store for odds data by event.
- **Usage:** Used to manage and update odds for events and markets.
- **Notes:** Integrates with devtools middleware.
- **Status:** Actively used; not a candidate for removal.

### payoutStore.ts
- **Purpose:** Zustand store for payout previews and Kelly stake calculations.
- **Usage:** Used to compute and preview payouts for bet selections.
- **Notes:** Integrates with risk profile and store.
- **Status:** Actively used; not a candidate for removal.

### predictionStore.ts
- **Purpose:** Zustand store for predictions by event.
- **Usage:** Used to update and retrieve predictions and analytics for events.
- **Notes:** Integrates with devtools middleware.
- **Status:** Actively used; not a candidate for removal.

### riskProfileStore.ts
- **Purpose:** Zustand store for user risk profile and bankroll.
- **Usage:** Used to update risk profile, bankroll, and calculate stakes.
- **Notes:** Integrates with devtools middleware and default risk profiles.
- **Status:** Actively used; not a candidate for removal.

### themeStore.ts
- **Purpose:** Zustand store for theme mode (light/dark) with persistence.
- **Usage:** Used to toggle and persist theme preference.
- **Notes:** Uses persist middleware for localStorage.
- **Status:** Actively used; not a candidate for removal.

### useAppStore.ts
- **Purpose:** Unified Zustand store combining multiple slices (auth, bet slip, notifications, etc.).
- **Usage:** Used as the main app store for complex state.
- **Notes:** Integrates with persist and multiple slice creators.
- **Status:** Actively used; not a candidate for removal.

### useStore.ts
- **Purpose:** Zustand store for toast notifications and other slices.
- **Usage:** Used to manage toasts and extend with additional slices.
- **Notes:** Simple composition; extensible.
- **Status:** Actively used; not a candidate for removal.

### websocketStore.ts
- **Purpose:** Zustand store for WebSocket connection state and subscriptions.
- **Usage:** Used to manage WebSocket status, subscriptions, and messages.
- **Notes:** Integrates with WebSocketManager and persist middleware.
- **Status:** Actively used; not a candidate for removal.

---

## Subdirectory File Breakdown

### slices/bettingSlice.ts
- **Purpose:** Zustand slice for betting state (bets, odds, payouts, actions).
- **Usage:** Used in unified store composition for betting logic.
- **Notes:** Implements placeBet, updateActiveBet, clearOpportunities.
- **Status:** Actively used; not a candidate for removal.

### slices/mlSlice.ts
- **Purpose:** Zustand slice for ML state (predictions, metrics, drift alerts).
- **Usage:** Used in unified store composition for ML logic.
- **Notes:** Implements updatePredictions, updateModelMetrics, drift alert management.
- **Status:** Actively used; not a candidate for removal.

### slices/toastSlice.ts
- **Purpose:** Zustand slice for toast notifications.
- **Usage:** Used to add and remove toasts in the UI.
- **Notes:** Uses uuid for toast IDs.
- **Status:** Actively used; not a candidate for removal.

### __tests__/enhanced.test.ts
- **Purpose:** Unit tests for the enhanced user store.
- **Usage:** Ensures correct state, validation, and persistence.
- **Notes:** Uses React Testing Library hooks and jest.
- **Status:** Active test; not a candidate for removal.

