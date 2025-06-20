# Config Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/config` directory. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains configuration files and constants for the frontend application. These modules define API endpoints, environment-specific settings, automation parameters, feature flags, and shared constants used throughout the codebase. Centralizing configuration ensures maintainability, consistency, and ease of updates across environments and features.

---

## File Breakdown

### api.ts
- **Purpose:** Exports API configuration objects for TheOdds, SportRadar, and DailyFantasy, including API keys and base URLs.
- **Usage:** Used to access and manage API credentials and endpoints for external integrations.
- **Notes:** Provides default values and supports environment variable overrides.
- **Status:** Actively used; not a candidate for removal.

### apiConfig.ts
- **Purpose:** Centralized API configuration for all major integrations, including sports data, odds, sentiment, news, weather, and injury APIs.
- **Usage:** Used to configure API clients and services for different deployment environments.
- **Notes:** Supports environment variable overrides for all endpoints and keys.
- **Status:** Actively used; not a candidate for removal.

### automation.config.ts
- **Purpose:** Defines the AutomationConfig interface and provides a default configuration object for automation, risk management, prediction, personalization, and notification settings.
- **Usage:** Used by automation modules and services to determine scheduling, risk, and notification parameters.
- **Notes:** Highly extensible; includes nested configuration for multiple automation domains.
- **Status:** Actively used; not a candidate for removal.

### constants.ts
- **Purpose:** Exports shared constants for environment detection, API base URL, feature flags, WebSocket configuration, ML configuration, and UI configuration.
- **Usage:** Used throughout the frontend to ensure consistent configuration and avoid magic values.
- **Notes:** Includes dynamic base URL detection and utility functions for WebSocket URLs.
- **Status:** Actively used; not a candidate for removal.

### predictionConfig.ts
- **Purpose:** Defines feature flags, experiment configuration, and utility functions for managing feature flags and experiments in the prediction and analytics modules.
- **Usage:** Used to enable/disable features and manage experiments in analytics and prediction workflows.
- **Notes:** Includes interfaces, default values, and utility functions for feature flag management.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the config directory.*
