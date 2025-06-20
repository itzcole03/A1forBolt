# UTILS_FILE_USAGE_ANALYSIS.md

## Table of Contents

- [Overview](#overview)
- [File-by-File Analysis](#file-by-file-analysis)
  - [TypeScript/TSX Utilities](#typescripttsx-utilities)
  - [Test Files](#test-files)
  - [Python Utilities](#python-utilities)
  - [Type Declarations](#type-declarations)
  - [Subdirectories](#subdirectories)

---

## Overview

This document provides a comprehensive, recursively generated analysis of every file in the `frontend/src/utils` directory, including all subdirectories and test/config files. For each file, you will find its purpose/usage, status (active/legacy/candidate for removal), and any special notes (test, config, utility, etc.).

---

## File-by-File Analysis

### TypeScript/TSX Utilities

- **AdvancedAnalysisEngine.ts**  
  *Purpose*: Core engine for advanced player and trend analysis, integrating data and risk/opportunity assessment.  
  *Status*: Active  
  *Notes*: Used by prediction and analytics modules.

- **AnalysisFramework.ts**  
  *Purpose*: Plugin-based analysis registry and context for extensible analytics.  
  *Status*: Active  
  *Notes*: Central to modular analytics.

- **analyticsHelpers.ts**  
  *Purpose*: User stats and performance chart calculation helpers.  
  *Status*: Active  
  *Notes*: Utility for user-facing analytics.

- **Analyzer.ts**  
  *Purpose*: Generic analyzer interface for analytics modules.  
  *Status*: Active  
  *Notes*: Used for type safety and extensibility.

- **animations.ts**  
  *Purpose*: Keyframe animation utilities for UI transitions.  
  *Status*: Active  
  *Notes*: UI/UX enhancement.

- **api.ts**  
  *Purpose*: Axios instance with interceptors for API requests and authentication.  
  *Status*: Active  
  *Notes*: Core API utility.

- **apiUtils.ts**  
  *Purpose*: Retry logic and helpers for Axios requests.  
  *Status*: Active  
  *Notes*: Used for robust API calls.

- **app.ts**  
  *Purpose*: Application singleton for unified service access and initialization.  
  *Status*: Active  
  *Notes*: Central app bootstrapper.

- **betting.ts**  
  *Purpose*: Interfaces for frontend betting strategies and opportunities.  
  *Status*: Active  
  *Notes*: Used in strategy modules.

- **browser.ts**  
  *Purpose*: Mock data and browser utilities for testing and development.  
  *Status*: Active  
  *Notes*: Used for MSW and mock APIs.

- **businessRules.ts**  
  *Purpose*: Centralized business logic and validation for betting rules.  
  *Status*: Active  
  *Notes*: Used for enforcing app rules.

- **cacheUtils.ts**  
  *Purpose*: Generic cache implementation with TTL and size limits.  
  *Status*: Active  
  *Notes*: Used for in-memory caching.

- **chart.ts**  
  *Purpose*: Chart.js registration utility.  
  *Status*: Active  
  *Notes*: Charting setup.

- **classNames.ts**  
  *Purpose*: Utility for merging and composing class names (Tailwind/clsx).  
  *Status*: Active  
  *Notes*: UI utility.

- **combinationsWorker.ts**  
  *Purpose*: Web worker for generating prop combinations.  
  *Status*: Active  
  *Notes*: Used for performance in prop selection.

- **common.ts**  
  *Purpose*: Common types and enums for sports, props, alerts, etc.  
  *Status*: Active  
  *Notes*: Shared across modules.

- **constants.ts**  
  *Purpose*: App-wide constants (app name, theme, max parlay legs, etc.).  
  *Status*: Active  
  *Notes*: Central config.

- **DailyFantasyAdapter.ts**  
  *Purpose*: Adapter for daily fantasy data integration.  
  *Status*: Active  
  *Notes*: Used by data integration hub.

- **DataIntegrationHub.ts**  
  *Purpose*: Aggregates and integrates data from multiple sources.  
  *Status*: Active  
  *Notes*: Core to analytics pipeline.

- **DataPipeline.ts**  
  *Purpose*: Data pipeline and caching utilities.  
  *Status*: Active  
  *Notes*: Used for streaming and batch data.

- **DataSource.ts**  
  *Purpose*: Data source interface and metrics.  
  *Status*: Active  
  *Notes*: Used by adapters and integration.

- **encryption.ts**  
  *Purpose*: AES encryption/decryption helpers.  
  *Status*: Active  
  *Notes*: Uses environment key.

- **errorHandler.ts**  
  *Purpose*: Centralized error handling, logging, and reporting.  
  *Status*: Active  
  *Notes*: Integrates with EventBus and monitoring.

- **errorLogger.ts**  
  *Purpose*: Singleton error logger with global error handling.  
  *Status*: Active  
  *Notes*: Used for error tracking.

- **errorUtils.ts**  
  *Purpose*: Error type guards and custom error classes.  
  *Status*: Active  
  *Notes*: Used for robust error handling.

- **ESPNAdapter.ts**  
  *Purpose*: Adapter for ESPN data (games, headlines).  
  *Status*: Active  
  *Notes*: Used by data integration.

- **FeatureComposition.ts**  
  *Purpose*: Composable feature processing and validation.  
  *Status*: Active  
  *Notes*: Used for feature engineering.

- **FeatureFlags.ts**  
  *Purpose*: Feature flag and experiment management.  
  *Status*: Active  
  *Notes*: Used for A/B testing and rollout.

- **formatters.ts**  
  *Purpose*: Date, currency, and percentage formatting utilities.  
  *Status*: Active  
  *Notes*: UI and reporting utility.

- **helpers.ts**  
  *Purpose*: Generic helper functions (sleep, unique ID, etc.).  
  *Status*: Active  
  *Notes*: Utility functions.

- **index.ts**  
  *Purpose*: (Node/Express) API and service entrypoint.  
  *Status*: Active  
  *Notes*: Not used in browser build; for server-side utilities.

- **lazyLoad.tsx**  
  *Purpose*: React lazy loading utility with Suspense.  
  *Status*: Active  
  *Notes*: UI performance utility.

- **odds.ts**  
  *Purpose*: Odds conversion, payout, and win probability calculations.  
  *Status*: Active  
  *Notes*: Used in betting modules.

- **PerformanceMonitor.ts**  
  *Purpose*: Singleton for performance tracing and measurement.  
  *Status*: Active  
  *Notes*: Used in analytics and monitoring.

- **performanceTracking.ts**  
  *Purpose*: Sentry-based performance and metric tracking utilities.  
  *Status*: Active  
  *Notes*: Observability and tracing.

- **PredictionEngine.ts**  
  *Purpose*: Core prediction engine integrating analytics, strategies, and data.  
  *Status*: Active  
  *Notes*: Central to prediction pipeline.

- **ProjectionAnalyzer.ts**  
  *Purpose*: Analyzer for player projections and confidence.  
  *Status*: Active  
  *Notes*: Used in analytics modules.

- **ProjectionBettingStrategy.ts**  
  *Purpose*: Strategy for betting based on player projections.  
  *Status*: Active  
  *Notes*: Used in strategy engine.

- **rateLimiter.ts**  
  *Purpose*: Rate limiter utility for API calls.  
  *Status*: Active  
  *Notes*: Used for throttling requests.

- **scheduler.ts**  
  *Purpose*: Job scheduling utility for periodic tasks.  
  *Status*: Active  
  *Notes*: Used for background jobs.

- **security.ts**  
  *Purpose*: CSRF token management and input sanitization.  
  *Status*: Active  
  *Notes*: Security utility.

- **SentimentEnhancedAnalyzer.ts**  
  *Purpose*: Analyzer combining projections with sentiment and market data.  
  *Status*: Active  
  *Notes*: Used in advanced analytics.

- **serviceWorker.ts**  
  *Purpose*: Service worker for caching and offline support.  
  *Status*: Active  
  *Notes*: PWA support.

- **setup.ts**  
  *Purpose*: Test setup for Vitest and DOM mocks.  
  *Status*: Active  
  *Notes*: Test utility.

- **setupE2ETests.ts**  
  *Purpose*: End-to-end test setup and mocks.  
  *Status*: Active  
  *Notes*: Test utility.

- **setupIntegrationTests.ts**  
  *Purpose*: Integration test setup and mocks.  
  *Status*: Active  
  *Notes*: Test utility.

- **setupTests.ts**  
  *Purpose*: Jest test setup and environment mocks.  
  *Status*: Active  
  *Notes*: Test utility.

- **shap.ts**  
  *Purpose*: SHAP value calculation for model explainability.  
  *Status*: Active  
  *Notes*: Used in ML explainability.

- **SocialSentimentAdapter.ts**  
  *Purpose*: Adapter for social sentiment data.  
  *Status*: Active  
  *Notes*: Used in analytics and integration.

- **strategy.ts**  
  *Purpose*: Types and interfaces for betting strategies and recommendations.  
  *Status*: Active  
  *Notes*: Used in strategy modules.

- **StrategyComposition.ts**  
  *Purpose*: Composable strategy components and results.  
  *Status*: Active  
  *Notes*: Used in strategy engine.

- **StrategyEngine.ts**  
  *Purpose*: Core engine for executing betting strategies.  
  *Status*: Active  
  *Notes*: Central to strategy execution.

- **theme.ts**  
  *Purpose*: MUI theme creation and customization.  
  *Status*: Active  
  *Notes*: UI theming utility.

- **TheOddsAdapter.ts**  
  *Purpose*: Adapter for odds data integration.  
  *Status*: Active  
  *Notes*: Used by data integration hub.

- **UnifiedAnalytics.ts**  
  *Purpose*: Singleton analytics event and metrics manager.  
  *Status*: Active  
  *Notes*: Used for analytics and reporting.

- **UnifiedBettingAnalytics-MyPC.ts**  
  *Purpose*: Local/experimental version of unified betting analytics.  
  *Status*: Candidate for removal  
  *Notes*: Redundant with UnifiedBettingAnalytics.ts.

- **UnifiedBettingAnalytics.ts**  
  *Purpose*: Singleton for unified betting analytics and strategy management.  
  *Status*: Active  
  *Notes*: Used in analytics and betting modules.

- **UnifiedBettingCore.ts**  
  *Purpose*: Singleton for core betting logic and performance metrics.  
  *Status*: Active  
  *Notes*: Used in unified betting modules.

- **UnifiedCache.ts**  
  *Purpose*: (Empty/placeholder)  
  *Status*: Candidate for removal  
  *Notes*: No implementation.


### Test Files

- **APIEndpoints.test.ts**  
  *Purpose*: Tests for API endpoints and service methods.  
  *Status*: Active  
  *Notes*: Jest test file.

- **StateSync.test.ts**  
  *Purpose*: Tests for state synchronization and context integration.  
  *Status*: Active  
  *Notes*: Jest test file.

- **UnifiedBettingCore.test.ts**  
  *Purpose*: Tests for unified betting core logic and caching.  
  *Status*: Active  
  *Notes*: Jest test file.

- **__tests__/cacheUtils.test.ts**  
  *Purpose*: Unit tests for cache utility.  
  *Status*: Active  
  *Notes*: Jest test file in __tests__ subdirectory.


### Python Utilities

- **config.py**  
  *Purpose*: Loads and manages YAML configuration for the system analysis tool.  
  *Status*: Active  
  *Notes*: Used for backend/config integration.

- **logging.py**  
  *Purpose*: Centralized logging configuration and management.  
  *Status*: Active  
  *Notes*: Used for backend/config integration.


### Type Declarations

- **env.d.ts**  
  *Purpose*: Type declarations for Vite environment variables.  
  *Status*: Active  
  *Notes*: Used for type safety in build and runtime.


### Subdirectories

- **__tests__/**  
  *Purpose*: Contains test files for utilities.  
  *Status*: Active  
  *Notes*: All files are test-related.

---

*Last updated: June 12, 2025*
