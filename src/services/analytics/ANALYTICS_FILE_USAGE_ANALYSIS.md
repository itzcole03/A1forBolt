# Analytics Services Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/services/analytics` directory. Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains advanced analytics and machine learning (ML) services for the frontend. It includes feature engineering, selection, transformation, validation, monitoring, and registry utilities, as well as orchestration for ML models, risk assessment, and prediction logic. Most backend ML logic is accessed via API endpoints, with only select models (e.g., TensorFlow.js) running in-browser. Legacy files are being migrated to unified, type-safe modules.

---

## File Breakdown

### index.ts
- **Purpose:** Exports the main ML service for use throughout the app.
- **Usage:** `import { mlService } from './mlService';`
- **Notes:** Central entry point for analytics/ML services.
- **Status:** Actively used; not a candidate for removal.

### mlService.ts
- **Purpose:** (Legacy) Previously provided unified orchestration for advanced ML, prediction, and analytics features.
- **Usage:** Deprecated; all logic now handled by `useUnifiedAnalytics` and related unified services.
- **Notes:** File is empty except for a migration notice.
- **Status:** Deprecated; candidate for removal.

### mlService.test.ts
- **Purpose:** Unit tests for the legacy `mlService` API surface.
- **Usage:** Jest-based tests to verify the presence of ML service methods.
- **Notes:** Tests are now legacy; should be updated or removed if `mlService` is deleted.
- **Status:** Legacy; candidate for removal or update.

### UnifiedFeatureService.ts
- **Purpose:** (Legacy) Previously handled feature analytics logic.
- **Usage:** Deprecated; logic migrated to unified analytics modules.
- **Notes:** File is empty except for a migration notice.
- **Status:** Deprecated; candidate for removal.

### types.ts
- **Purpose:** TypeScript type definitions for analytics, feature engineering, and ML services.
- **Usage:** Shared across analytics modules for type safety and consistency.
- **Notes:** Includes interfaces for player data, feature configs, validation results, and more.
- **Status:** Actively used; not a candidate for removal.

### featureEngineeringService.ts
- **Purpose:** Provides feature engineering for player, team, and opponent data, including base, temporal, interaction, and contextual features.
- **Usage:** Used to generate, transform, select, validate, cache, and monitor features for ML models and analytics.
- **Notes:** Integrates with multiple submodules (selector, transformer, validator, etc.). Highly extensible and central to analytics pipeline.
- **Status:** Actively used; not a candidate for removal.

### featureSelection.ts
- **Purpose:** Implements feature selection logic, including importance calculation and filtering.
- **Usage:** Used by feature engineering service to select the most relevant features for ML models.
- **Notes:** Supports numerical, categorical, temporal, and derived features. Includes normalization and importance thresholding.
- **Status:** Actively used; not a candidate for removal.

### featureTransformation.ts
- **Purpose:** Handles transformation of numerical, categorical, and derived features for ML models.
- **Usage:** Used by feature engineering service to normalize, scale, and apply nonlinear transformations to features.
- **Notes:** Includes advanced transformations (e.g., rate of change, regression slope/intercept).
- **Status:** Actively used; not a candidate for removal.

### featureValidation.ts
- **Purpose:** Validates engineered features for completeness, consistency, and quality.
- **Usage:** Used by feature engineering service to ensure features meet quality standards before use in ML models.
- **Notes:** Validates all feature types and metadata; includes correlation and trend checks.
- **Status:** Actively used; not a candidate for removal.

### featureLogging.ts
- **Purpose:** Provides logging utilities for feature engineering and analytics modules.
- **Usage:** Used throughout analytics services for info, warning, error, and debug logging.
- **Notes:** Supports configurable log level, format, and output. Placeholder for file writing/rotation.
- **Status:** Actively used; not a candidate for removal.

### featureMonitor.ts
- **Purpose:** Monitors feature engineering metrics, quality, and performance.
- **Usage:** Used to track feature counts, quality, and processing metrics over time.
- **Notes:** Supports enabling/disabling, interval configuration, and metrics retrieval.
- **Status:** Actively used; not a candidate for removal.

### featureRegistry.ts
- **Purpose:** Manages registration and versioning of engineered features.
- **Usage:** Used to store, retrieve, and manage feature sets and their versions.
- **Notes:** Integrates with feature store for persistence and backup.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the analytics directory.*
