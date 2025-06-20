# API Services Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/services/api` directory. Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains the core API client, service, and exports for interacting with backend and third-party APIs. It provides a unified interface for HTTP requests, WebSocket connections, and API configuration, supporting both legacy and modern usage patterns.

---

## File Breakdown

### ApiService.ts
- **Purpose:** Implements a generic API service for HTTP and WebSocket communication with backend and third-party endpoints (e.g., Sportradar, OddsAPI, ESPN, Social).
- **Usage:** Used throughout the app for fetching player stats, odds, injuries, news, and subscribing to real-time data feeds. Exports a singleton `apiService` instance with environment-based configuration.
- **Notes:** Handles WebSocket reconnection, data streaming, and API key management. Central to all data fetching and real-time updates.
- **Status:** Actively used; not a candidate for removal.

### client.ts
- **Purpose:** Provides a type-safe API client for HTTP requests (GET, POST, PUT, PATCH, DELETE) with unified monitoring and error handling.
- **Usage:** Used by services and components to make HTTP requests to backend APIs. Exports a singleton `apiClient` and convenience `get`/`post` functions for legacy compatibility.
- **Notes:** Integrates with unified monitoring and error handling. Supports custom headers, params, and timeouts.
- **Status:** Actively used; not a candidate for removal.

### index.ts
- **Purpose:** Central export for API utilities, re-exporting `get`, `post`, and `apiService` for easy import across the app.
- **Usage:** `import { get, post, apiService } from './api';`
- **Notes:** Ensures consistent API usage and backward compatibility.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the api directory.*
