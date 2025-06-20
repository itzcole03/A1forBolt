# Core Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/core` directory (top-level only). Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains the core infrastructure, engines, event bus, error handling, data integration, and analysis framework for the frontend application. These files provide the backbone for analytics, prediction, plugin systems, unified monitoring, and advanced data processing.

---

## File Breakdown

### AdvancedAnalysisEngine.ts
- **Purpose:** Implements the advanced analysis engine for player predictions, trends, risk, and opportunity analysis.
- **Usage:** Used to aggregate and analyze integrated data, generate predictions, and identify opportunities and risks.
- **Notes:** Integrates with event bus, feature flags, and performance monitoring.
- **Status:** Actively used; not a candidate for removal.

### AnalysisFramework.ts
- **Purpose:** Provides the plugin-based analysis framework and registry for registering, managing, and executing analysis plugins.
- **Usage:** Used to register and execute analysis plugins, manage dependencies, and monitor performance.
- **Notes:** Integrates with event bus, performance monitor, and unified monitor.
- **Status:** Actively used; not a candidate for removal.

### Analyzer.ts
- **Purpose:** Defines the `Analyzer` interface for analysis modules, including metrics and validation.
- **Usage:** Used to implement custom analyzers for prediction and analytics modules.
- **Notes:** Provides a standard interface for analysis logic and metrics.
- **Status:** Actively used; not a candidate for removal.

### core.ts
- **Purpose:** Defines minimal event types for the event bus.
- **Usage:** Used as a type definition for event bus events.
- **Notes:** Simple type utility.
- **Status:** Actively used; not a candidate for removal.

### DataIntegrationHub.ts
- **Purpose:** Central hub for integrating data from multiple sources (adapters, APIs, services).
- **Usage:** Used to aggregate, normalize, and provide integrated data for analytics and prediction engines.
- **Notes:** Integrates with adapters, event bus, and performance monitor.
- **Status:** Actively used; not a candidate for removal.

### DataPipeline.ts
- **Purpose:** Defines the data pipeline, stages, sinks, and cache for processing and transforming data.
- **Usage:** Used to build and manage data pipelines for analytics and prediction workflows.
- **Notes:** Supports pipeline metrics, validation, and cleanup.
- **Status:** Actively used; not a candidate for removal.

### DataSource.ts
- **Purpose:** Defines the `DataSource` interface and related config/metrics for data providers.
- **Usage:** Used to implement and configure data sources for integration and analytics.
- **Notes:** Supports connection, metadata, and quality metrics.
- **Status:** Actively used; not a candidate for removal.

### ErrorHandler.ts
- **Purpose:** Singleton error handler for capturing, logging, and emitting errors via the event bus.
- **Usage:** Used to handle and track errors across the app, with severity and details.
- **Notes:** Integrates with event bus and supports error limits.
- **Status:** Actively used; not a candidate for removal.

### errors.ts
- **Purpose:** Defines the `SystemError` class and error context for system-level errors.
- **Usage:** Used to throw and handle system errors with context and severity.
- **Notes:** Integrates with unified error types.
- **Status:** Actively used; not a candidate for removal.

### EventBus.ts
- **Purpose:** Singleton event bus for app-wide event publishing and subscription.
- **Usage:** Used to emit, listen, and manage events across the app.
- **Notes:** Uses `eventemitter3` for event management.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the core directory.*

---

## Subdirectory File Breakdown

This section documents all files in nested subdirectories of `frontend/src/core`, including analytics, BestBetSelector, CacheManager, config, error, FinalPredictionEngine, logging, metrics, models, types, websocket, and their test/type files.

### analytics/ModelPerformanceTracker.ts
- **Purpose:** Tracks and records model performance metrics (ROI, win rate, drawdown, calibration, etc.) for prediction models.
- **Usage:** Used by analytics and monitoring modules to evaluate and visualize model effectiveness over time.
- **Notes:** Integrates with unified logging and metrics; supports calibration and historical snapshots.
- **Status:** Actively used; not a candidate for removal.

### analytics/PerformanceMonitor.ts
- **Purpose:** Monitors model performance metrics and triggers alerts based on configurable thresholds (ROI, win rate, drawdown, etc.).
- **Usage:** Used to detect and respond to model degradation or anomalies in real time.
- **Notes:** Singleton pattern; integrates with logging and metrics; supports custom alert thresholds.
- **Status:** Actively used; not a candidate for removal.

### analytics/__tests__/ModelPerformanceTracker.test.ts
- **Purpose:** Unit tests for the ModelPerformanceTracker class.
- **Usage:** Ensures correct tracking, updating, and reporting of model performance metrics.
- **Notes:** Jest test file; mocks logger and metrics.
- **Status:** Active test; not a candidate for removal.

### BestBetSelector/BestBetSelector.ts
- **Purpose:** Implements logic to select the best betting opportunities based on model outputs, risk profiles, and performance.
- **Usage:** Used by the prediction and betting modules to recommend optimal bets.
- **Notes:** Integrates with prediction engine, event bus, error handler, and performance monitor.
- **Status:** Actively used; not a candidate for removal.

### BestBetSelector/__tests__/BestBetSelector.test.ts
- **Purpose:** Unit tests for the BestBetSelector class.
- **Usage:** Validates selection logic and risk profile handling.
- **Notes:** Jest test file; mocks logger and metrics.
- **Status:** Active test; not a candidate for removal.

### CacheManager/types.ts
- **Purpose:** Defines interfaces for cache configuration, entries, statistics, and unified logger/metrics.
- **Usage:** Used by cache management modules to enforce type safety and extensibility.
- **Notes:** Type definitions only.
- **Status:** Actively used; not a candidate for removal.

### config/types.ts
- **Purpose:** Interface for unified configuration manager (get/set/delete/has methods).
- **Usage:** Used by config management modules for type safety and abstraction.
- **Notes:** Type definitions only.
- **Status:** Actively used; not a candidate for removal.

### error/types.ts
- **Purpose:** Enumerates error severities, categories, and context interfaces for unified error handling.
- **Usage:** Used by error handling modules to standardize error reporting and metrics.
- **Notes:** Type definitions only.
- **Status:** Actively used; not a candidate for removal.

### FinalPredictionEngine/FinalPredictionEngine.ts
- **Purpose:** Implements the core prediction engine, aggregating model outputs, risk profiles, and feature impacts to generate final predictions.
- **Usage:** Used by analytics and betting modules to produce confidence-weighted predictions and explanations.
- **Notes:** Highly extensible; integrates with logging, metrics, config, and error handling.
- **Status:** Actively used; not a candidate for removal.

### FinalPredictionEngine/README.md
- **Purpose:** Documentation for the FinalPredictionEngine architecture, features, and usage.
- **Usage:** Reference for developers integrating or extending the prediction engine.
- **Notes:** Markdown documentation; not code.
- **Status:** Actively maintained; not a candidate for removal.

### FinalPredictionEngine/types.ts
- **Purpose:** Type definitions for prediction engine interfaces, model outputs, risk profiles, feature impacts, and errors.
- **Usage:** Used throughout the prediction engine and related modules for type safety.
- **Notes:** Type definitions only.
- **Status:** Actively used; not a candidate for removal.

### FinalPredictionEngine/__tests__/FinalPredictionEngine.test.ts
- **Purpose:** Unit tests for the FinalPredictionEngine implementation.
- **Usage:** Validates prediction aggregation, risk handling, and feature impact logic.
- **Notes:** Jest test file; mocks logger, metrics, and config.
- **Status:** Active test; not a candidate for removal.

### logging/logger.ts
- **Purpose:** Centralized logger implementation for unified logging across the app.
- **Usage:** Used by all modules for info, error, warn, debug, and trace logging.
- **Notes:** Can be swapped for production loggers (Sentry, Datadog, etc.).
- **Status:** Actively used; not a candidate for removal.

### logging/types.ts
- **Purpose:** Interface for the unified logger (info, error, warn, debug, trace).
- **Usage:** Used by logger implementations and consumers for type safety.
- **Notes:** Type definitions only.
- **Status:** Actively used; not a candidate for removal.

### metrics/metrics.ts
- **Purpose:** Implements unified metrics tracking (track, increment, gauge, timing, histogram) for app-wide observability.
- **Usage:** Used by analytics, prediction, and monitoring modules to record and report metrics.
- **Notes:** Extensible for custom metrics and tags.
- **Status:** Actively used; not a candidate for removal.

### metrics/types.ts
- **Purpose:** Interface for unified metrics (track, increment, gauge, timing, histogram).
- **Usage:** Used by metrics implementations and consumers for type safety.
- **Notes:** Type definitions only.
- **Status:** Actively used; not a candidate for removal.

### models/BaseMLService.ts, models/MLService.ts, models/ModelEvaluator.ts, models/ModelManager.ts, models/ModelRegistry.ts, models/types.ts
- **Purpose:** Core machine learning service, evaluation, management, and registry logic for prediction models.
- **Usage:** Used by analytics and prediction modules to manage and evaluate ML models.
- **Notes:** Type definitions and service logic.
- **Status:** Actively used; not a candidate for removal.

### types/prediction.ts, types.ts
- **Purpose:** Type definitions for prediction, analytics, and core logic.
- **Usage:** Used throughout the core and analytics modules for type safety.
- **Notes:** Type definitions only.
- **Status:** Actively used; not a candidate for removal.

### websocket/handlers/PredictionHandler.ts, websocket/WebSocketManager.ts
- **Purpose:** Implements WebSocket management and prediction event handling for real-time updates.
- **Usage:** Used by the app to manage WebSocket connections and handle prediction events.
- **Notes:** Supports extensibility for new event types and handlers.
- **Status:** Actively used; not a candidate for removal.

