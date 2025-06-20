# Types Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/types` directory. Each entry includes purpose, usage, notes, and status, following the required documentation style.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains all TypeScript type definitions, interfaces, and global type declarations for the application. Each file defines types for a specific domain (betting, ML, prediction, analytics, etc.), ensuring type safety and consistency across the frontend codebase.

---

## File Breakdown

### analytics.ts
- **Purpose:** Defines interfaces for analytics metrics, trends, risk factors, and explainability maps.
- **Usage:** Used by analytics and reporting modules for type safety.
- **Notes:** Includes performance metrics and risk profile types.
- **Status:** Actively used; not a candidate for removal.

### api.ts
- **Purpose:** Defines user, player, and API-related types and interfaces.
- **Usage:** Used by API service and data-fetching modules.
- **Notes:** Includes user preferences, player stats, and status.
- **Status:** Actively used; not a candidate for removal.

### bankroll.ts
- **Purpose:** Types for bankroll management, transactions, and stats.
- **Usage:** Used by bankroll and transaction modules.
- **Notes:** Includes transaction types and bankroll settings.
- **Status:** Actively used; not a candidate for removal.

### betting.new.ts
- **Purpose:** Legacy file, now removed as part of codebase consolidation.
- **Usage:** Not used in the current codebase.
- **Notes:** Kept for historical reference.
- **Status:** Legacy; candidate for removal.

### betting.ts
- **Purpose:** Comprehensive types for betting, sportsbooks, arbitrage, line shopping, and opportunities.
- **Usage:** Used throughout betting, arbitrage, and odds modules.
- **Notes:** Large file; includes all core betting types.
- **Status:** Actively used; not a candidate for removal.

### common.ts
- **Purpose:** Shared enums and types for sports, props, alerts, and statuses.
- **Usage:** Used across multiple modules for consistency.
- **Notes:** Includes alert types, bet results, and market states.
- **Status:** Actively used; not a candidate for removal.

### components.ts
- **Purpose:** Types for React component props (risk profile selector, SHAP visualization, betting opportunities, etc.).
- **Usage:** Used by UI components for type safety.
- **Notes:** Integrates with betting and analytics types.
- **Status:** Actively used; not a candidate for removal.

### confidence.ts
- **Purpose:** Types for prediction confidence bands, win probability, and performance history.
- **Usage:** Used by prediction and analytics modules.
- **Notes:** Includes interfaces for confidence bands and historical performance.
- **Status:** Actively used; not a candidate for removal.

### core.d.ts
- **Purpose:** Empty global type declaration file.
- **Usage:** Reserved for future global type extensions.
- **Notes:** Currently empty.
- **Status:** Candidate for future use.

### core.ts
- **Purpose:** Core types for SHAP vectors, game context, bet types, and results.
- **Usage:** Used by core analytics and prediction modules.
- **Notes:** Large file; includes many foundational types.
- **Status:** Actively used; not a candidate for removal.

### env.d.ts
- **Purpose:** Type declarations for Vite environment variables and import meta.
- **Usage:** Used for type safety with environment variables.
- **Notes:** Includes all VITE_ prefixed variables and NODE_ENV.
- **Status:** Actively used; not a candidate for removal.

### explainability.ts
- **Purpose:** Types for SHAP values, summaries, breakdowns, and visualization props.
- **Usage:** Used by explainability and analytics modules.
- **Notes:** Supports advanced SHAP visualizations.
- **Status:** Actively used; not a candidate for removal.

### filters.ts
- **Purpose:** Types for advanced filtering, filter options, and contextual input.
- **Usage:** Used by filtering and prediction modules.
- **Notes:** Includes filter operators and advanced filter sets.
- **Status:** Actively used; not a candidate for removal.

### global.d.ts
- **Purpose:** Global type declarations for third-party modules and overrides.
- **Usage:** Used to extend or override types for external libraries.
- **Notes:** Includes MUI, framer-motion, react-router-dom, axios, etc.
- **Status:** Actively used; not a candidate for removal.

### history.ts
- **Purpose:** Types for historical prediction and bet performance tracking.
- **Usage:** Used by analytics and user history modules.
- **Notes:** Includes user and model performance history.
- **Status:** Actively used; not a candidate for removal.

### index.ts
- **Purpose:** Types for Poe-like data context, blocks, and API responses.
- **Usage:** Used by data aggregation and API modules.
- **Notes:** Includes example content types for PoeDataBlock.
- **Status:** Actively used; not a candidate for removal.

### lineup.ts
- **Purpose:** Types for betting lineups, legs, performance, and metrics.
- **Usage:** Used by lineup builder and analytics modules.
- **Notes:** Integrates with predictions and performance types.
- **Status:** Actively used; not a candidate for removal.

### market.ts
- **Purpose:** Types for market data, updates, context, and analysis.
- **Usage:** Used by market analytics and odds modules.
- **Notes:** Includes CLV analysis and order book types.
- **Status:** Actively used; not a candidate for removal.

### ml-modules.d.ts
- **Purpose:** Type declarations for ML libraries (SVM, KNN, Naive Bayes, XGBoost, Random Forest).
- **Usage:** Used to provide type safety for ML module imports.
- **Notes:** Declares modules for various ML libraries.
- **Status:** Actively used; not a candidate for removal.

### ml.ts
- **Purpose:** Types for machine learning explanations, model performance, and metrics.
- **Usage:** Used by ML and analytics modules.
- **Notes:** Includes SHAP explanations and feature importance.
- **Status:** Actively used; not a candidate for removal.

### model.ts
- **Purpose:** Types for model performance and metrics.
- **Usage:** Used by model evaluation and analytics modules.
- **Notes:** Includes accuracy, precision, recall, and F1 score.
- **Status:** Actively used; not a candidate for removal.

### models.ts
- **Purpose:** Model-specific type definitions for prediction models, game context, and player stats.
- **Usage:** Used by prediction and analytics modules.
- **Notes:** Includes SHAP vector and player stats interfaces.
- **Status:** Actively used; not a candidate for removal.

### money-maker.ts
- **Purpose:** Types for MoneyMaker feature, model status, predictions, and tabs.
- **Usage:** Used by MoneyMaker modules and UI.
- **Notes:** Includes prediction, tab config, and model breakdown types.
- **Status:** Actively used; not a candidate for removal.

### performance.ts
- **Purpose:** Types for performance metrics, strategy metrics, and risk assessment.
- **Usage:** Used by analytics and performance tracking modules.
- **Notes:** Includes timestamped data and risk assessment interfaces.
- **Status:** Actively used; not a candidate for removal.

### prediction.ts
- **Purpose:** Types for prediction results, SHAP values, and prediction responses.
- **Usage:** Used by prediction and analytics modules.
- **Notes:** Includes model weights, features, and metadata.
- **Status:** Actively used; not a candidate for removal.

### prizePicks.ts
- **Purpose:** Types for PrizePicks entries, players, projections, and leagues.
- **Usage:** Used by PrizePicks modules and UI.
- **Notes:** Extensible for future fields.
- **Status:** Actively used; not a candidate for removal.

### README.md
- **Purpose:** Overview and usage notes for the types directory.
- **Usage:** Reference for developers.
- **Notes:** Lists example type files and usage.
- **Status:** Actively maintained; not a candidate for removal.

### shap.d.ts
- **Purpose:** Type declarations for the 'shap' module (DeepExplainer class).
- **Usage:** Used by explainability and ML modules.
- **Notes:** Declares DeepExplainer class and methods.
- **Status:** Actively used; not a candidate for removal.

### shared.ts
- **Purpose:** Shared type definitions used across multiple modules.
- **Usage:** Used by core, analytics, and prediction modules.
- **Notes:** Includes timestamped data, market state, and model ensemble types.
- **Status:** Actively used; not a candidate for removal.

### simulation.ts
- **Purpose:** Types for bet probability simulation and result modeling.
- **Usage:** Used by simulation and analytics modules.
- **Notes:** Includes simulation input, result, and scenario types.
- **Status:** Actively used; not a candidate for removal.

### sports.ts
- **Purpose:** Types for sports, teams, and events.
- **Usage:** Used by sports analytics and event modules.
- **Notes:** Not yet analyzed in this batch.
- **Status:** Actively used; not a candidate for removal.

### strategy.ts
- **Purpose:** Types for betting strategies and automation.
- **Usage:** Used by strategy and automation modules.
- **Notes:** Not yet analyzed in this batch.
- **Status:** Actively used; not a candidate for removal.

### webSocket.ts
- **Purpose:** Types for WebSocket events and payloads.
- **Usage:** Used by WebSocket modules and services.
- **Notes:** Not yet analyzed in this batch.
- **Status:** Actively used; not a candidate for removal.

