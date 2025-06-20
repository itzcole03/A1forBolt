# API Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/api` directory. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains API modules and endpoint integrations for the frontend application. These modules define how the frontend communicates with backend services, third-party APIs, and prediction engines. Centralizing API logic ensures maintainability, consistency, and ease of updates as backend contracts evolve.

---

## File Breakdown

### index.ts
- **Purpose:** Configures and exports an Axios instance for making authenticated API requests to the backend.
- **Usage:** Used throughout the frontend for HTTP requests to `/api/v1` endpoints, with automatic token injection.
- **Notes:** Adds request interceptor for Bearer token from localStorage.
- **Status:** Actively used; not a candidate for removal.

### prediction.ts
- **Purpose:** Express router for prediction-related endpoints, including generation, model updates, evaluation, comparison, metrics, and fantasy recommendations.
- **Usage:** Used as backend API routes for prediction workflows.
- **Notes:** Integrates with PredictionIntegrationService. Handles errors and logs them.
- **Status:** Actively used; not a candidate for removal.

### predictions.js
- **Purpose:** Provides a predictionsApi object with methods for fetching predictions, optimizing lineups, getting feature importance, model performance, and odds updates via Axios.
- **Usage:** Used in the frontend to interact with prediction and analytics endpoints.
- **Notes:** Includes request/response interceptors for authentication and error handling.
- **Status:** Actively used; not a candidate for removal.

### PrizePicksAPI.ts
- **Purpose:** Implements a PrizePicksAPI class for interacting with the PrizePicks API, including projections, leagues, stat types, and player details.
- **Usage:** Used by adapters and services to fetch and transform PrizePicks data.
- **Notes:** Handles API key, error reporting, and response transformation.
- **Status:** Actively used; not a candidate for removal.

### dailyfantasy/
- **Purpose:** Contains API handler for daily fantasy data requests.
- **Usage:** Used as a Next.js API route for fetching and processing daily fantasy data from DraftKings or FanDuel.
- **Notes:** Includes logging, metrics, and error handling. Requires API key in request headers.
- **Status:** Actively used; not a candidate for removal.

#### dailyfantasy/index.ts
- **Purpose:** Next.js API handler for POST requests to fetch and process daily fantasy data.
- **Usage:** Used to standardize and return player data from external fantasy APIs.
- **Notes:** Integrates with logger and metrics. Validates method and API key.
- **Status:** Actively used; not a candidate for removal.

### predictions/
- **Purpose:** Contains API handler for generating predictions.
- **Usage:** Used as a Next.js API route for generating predictions based on model and date.
- **Notes:** Integrates with logger and metrics. Validates method and input.
- **Status:** Actively used; not a candidate for removal.

#### predictions/generate.ts
- **Purpose:** Next.js API handler for POST requests to generate predictions using a specified model and date.
- **Usage:** Used to trigger prediction generation and return results.
- **Notes:** Integrates with logger and metrics. Handles errors and logs them.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the API directory.*
