# Unified Services Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/services/unified` directory. Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains unified and advanced data services, including analytics, betting, prediction, notification, backup, error handling, logging, settings, state, and WebSocket management. These services provide a consistent, extensible interface for all core app domains, supporting singleton patterns, event-driven updates, and integration with both backend and third-party APIs.

---

## File Breakdown

### UnifiedDataService.ts
- **Purpose:** Provides a singleton service for unified data access, caching, and real-time updates from multiple sources (PrizePicks, ESPN, Odds API).
- **Usage:** Used to fetch, cache, and subscribe to data from various APIs and WebSocket streams. Exposes event-driven interface for data updates.
- **Notes:** Integrates with axios, socket.io, and zod for schema validation. Supports cache management and WebSocket lifecycle.
- **Status:** Actively used; not a candidate for removal.

### README.md
- **Purpose:** Directory-level note indicating this folder contains unified and advanced data services ported from legacy code.
- **Usage:** Informational only.
- **Notes:** No functional code.
- **Status:** Not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the unified directory.*
