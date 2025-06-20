# Adapters Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/adapters` directory. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains adapter modules that interface with external data sources, APIs, and third-party services. Adapters are responsible for transforming, normalizing, and integrating data from various providers into a unified format for use throughout the application. This includes sports data, fantasy platforms, sentiment analysis, and odds providers.

---

## File Breakdown

### DailyFantasyAdapter.ts
- **Purpose:** Implements an adapter for fetching and caching daily fantasy sports projections from an external API.
- **Usage:** Used to fetch, cache, and provide daily fantasy projections, with event publishing and performance monitoring.
- **Notes:** Integrates with EventBus and PerformanceMonitor. Includes cache management and error handling.
- **Status:** Actively used; not a candidate for removal.

### ESPNAdapter.ts
- **Purpose:** Adapter for fetching NBA games and headlines from ESPN's public APIs and RSS feeds.
- **Usage:** Used to retrieve, cache, and provide ESPN game and news data, with event emission and performance monitoring.
- **Notes:** Includes cache management, data transformation, and error handling.
- **Status:** Actively used; not a candidate for removal.

### index.ts
- **Purpose:** Barrel export for all adapters.
- **Usage:** Used to re-export adapter modules for unified imports.
- **Notes:** Currently only exports prizepicks; should be updated as more adapters are ported.
- **Status:** Actively used; not a candidate for removal.

### poe/
- **Purpose:** Contains adapters and type definitions specific to the Poe platform.
- **Usage:** Used to transform Poe data to the app's API format.
- **Notes:** Includes PoeToApiAdapter.ts (placeholder class with stub method) and types.ts (comprehensive type definitions for Poe data structures).
- **Status:** Actively used; not a candidate for removal.

#### poe/PoeToApiAdapter.ts
- **Purpose:** Placeholder class for integrating Poe API with the data pipeline.
- **Usage:** Contains a stub method for fetching and transforming Poe data.
- **Notes:** No real implementation yet; serves as a scaffold for future integration.
- **Status:** Placeholder; not yet implemented.

#### poe/types.ts
- **Purpose:** TypeScript type definitions for Poe adapters and API integration.
- **Usage:** Shared across Poe adapter modules for type safety.
- **Notes:** Defines interfaces for props, players, sentiment, news, and API formats.
- **Status:** Actively used; not a candidate for removal.

### poeToApiAdapter.ts
- **Purpose:** Implements a class for transforming Poe-like data blocks into PrizePicksProps and simulates fetching mock data.
- **Usage:** Used to adapt Poe data for PrizePicks prop card display and testing.
- **Notes:** Includes transformation logic, mock data, and error reporting via unifiedMonitor.
- **Status:** Actively used; not a candidate for removal.

### prizepicks.ts
- **Purpose:** Placeholder for PrizePicks adapter logic ported from a legacy folder.
- **Usage:** No implementation yet.
- **Notes:** Serves as a scaffold for future PrizePicks integration.
- **Status:** Placeholder; not yet implemented.

### PrizePicksAdapter.ts
- **Purpose:** Implements an adapter for fetching, transforming, and caching PrizePicks projections from the PrizePicks API.
- **Usage:** Used to fetch, cache, and provide PrizePicks projections, players, and leagues, with performance monitoring.
- **Notes:** Includes transformation logic, cache management, and error handling. Integrates with unifiedMonitor.
- **Status:** Actively used; not a candidate for removal.

### README.md
- **Purpose:** Describes the intended purpose of the adapters folder and its future contents.
- **Usage:** Informational comment only.
- **Notes:** No functional code; serves as a roadmap for future migration.
- **Status:** Informational; not a candidate for removal.

### SocialSentimentAdapter.ts
- **Purpose:** Implements an adapter for aggregating and analyzing social sentiment data from Twitter, Reddit, and news sources.
- **Usage:** Used to fetch, cache, and provide sentiment data for players, with event publishing and performance monitoring.
- **Notes:** Includes scraping logic, sentiment scoring, and cache management. Integrates with newsService.
- **Status:** Actively used; not a candidate for removal.

### SportsRadarAdapter.ts
- **Purpose:** Implements an adapter for fetching, caching, and providing sports data from the SportsRadar API.
- **Usage:** Used to fetch, cache, and provide game, player, and odds data, with event publishing and performance monitoring.
- **Notes:** Includes cache management, odds fetching, and error handling. Requires API key.
- **Status:** Actively used; not a candidate for removal.

### TheOddsAdapter.ts
- **Purpose:** Implements an adapter for fetching, caching, and providing betting odds data from TheOdds API.
- **Usage:** Used to fetch, cache, and provide odds data, with event publishing and performance monitoring.
- **Notes:** Includes cache management, odds fetching, and error handling. Requires API key.
- **Status:** Actively used; not a candidate for removal.

### __tests__/
- **Purpose:** Contains unit and integration tests for adapter modules.
- **Usage:** Used to verify correctness and reliability of adapters.
- **Notes:** Includes SocialSentimentAdapter.test.ts for sentiment adapter testing.
- **Status:** Actively used; not a candidate for removal.

#### __tests__/SocialSentimentAdapter.test.ts
- **Purpose:** Unit tests for SocialSentimentAdapter functionality.
- **Usage:** Jest-based tests to ensure correct sentiment data adaptation, caching, and cache clearing.
- **Notes:** Tests fetch, cache, and clearCache methods.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the adapters directory.*
