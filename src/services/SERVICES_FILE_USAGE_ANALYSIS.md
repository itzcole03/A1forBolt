# Services Directory Documentation

This document provides a comprehensive breakdown of all files and subdirectories in `frontend/src/services`. Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [Adapters](#adapters)
  - [index.ts](#adapterstsd)
  - [prizepicks.ts](#adaptersprizepickstsd)

---

## Overview

This directory contains service modules and adapters used throughout the frontend codebase. These services encapsulate API integrations, business logic, and utility functions for interacting with external systems, betting providers, and backend APIs.

---

## Adapters

### index.ts
- **Purpose:** Central export and registry for all service adapters in the `adapters/` subdirectory.
- **Usage:** Used to aggregate and re-export all available adapters for easy import elsewhere in the codebase. Ensures a single entry point for adapter access.
- **Notes:** Should be updated whenever new adapters are added or removed from the directory.
- **Status:** Actively used; not a candidate for removal.

### prizepicks.ts
- **Purpose:** Implements the PrizePicks betting provider adapter, encapsulating API integration, data transformation, and provider-specific logic.
- **Usage:** Used by the unified betting system and opportunity analysis modules to interact with PrizePicks, fetch props, submit entries, and normalize provider data.
- **Notes:** Handles provider-specific quirks, error handling, and data mapping. Should be reviewed if PrizePicks API changes.
- **Status:** Actively used; core to PrizePicks integration.

---

## Directory Overview

This directory contains all frontend service modules for the application. Each file provides a service for data access, caching, analytics, or business logic. Test files are in the `__tests__/` subfolder. Subdirectories group related services (e.g., analytics, betting, notification, unified, etc.).

---

## adapters/

### index.ts
- **Purpose/Usage:**
  - Central manager for all service adapters (e.g., PrizePicks, SportsRadar, ESPN). Provides a singleton `AdapterManager` for registering, retrieving, and enabling/disabling adapters. Used to abstract and unify access to various external data sources/APIs.
- **Status:**
  - Actively used as the entry point for adapter management. Not legacy.
- **Special Notes:**
  - Exports `adapterManager` singleton. Integrates with `prizepicks.ts` and expects additional adapters to be registered as needed.

### prizepicks.ts
- **Purpose/Usage:**
  - Implements the PrizePicks adapter for fetching props, players, and lines from the PrizePicks API. Handles caching and error logging. Used by the adapter manager and possibly other services for PrizePicks data integration.
- **Status:**
  - Actively used. Not legacy. Singleton pattern via `PrizePicksAdapterImpl`.
- **Special Notes:**
  - Uses environment variables for API URL and key. Integrates with local cache and logger utilities. Exports `prizePicksAdapter` singleton.

---

