# Test Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/test` directory and its subdirectories. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains all automated tests, test utilities, setup files, and coverage checklists for the frontend application. It includes unit, integration, accessibility, API, and performance tests, as well as mocks and configuration for Jest and Vitest.

---

## File Breakdown

### featureCoverage.test.tsx
- **Purpose:** Integration test for full feature coverage, including rendering, navigation, error handling, and state persistence in the App.
- **Usage:** Used to ensure all main features and directories are covered by tests.
- **Notes:** Some tests are skipped due to incomplete logic or missing mocks.
- **Status:** Actively used; not a candidate for removal.

### integrationChecklist.md
- **Purpose:** Markdown checklist for tracking integration, API, UI, state, error, performance, and mobile coverage.
- **Usage:** Used by developers to manually or automatically track test coverage and feature validation.
- **Notes:** Referenced by automated tests; not for manual editing except for new features.
- **Status:** Actively used; not a candidate for removal.

### jest.setup-files.js
- **Purpose:** Jest setup file for mocking IntersectionObserver and setting up test environment for React and Next.js.
- **Usage:** Used in Jest configuration to ensure compatibility with browser APIs.
- **Notes:** Ensures tests pass in environments lacking certain browser features.
- **Status:** Actively used; not a candidate for removal.

### performanceMonitor.ts
- **Purpose:** Utility for measuring and asserting render/load performance in tests.
- **Usage:** Used in performance and integration tests to log and enforce performance budgets.
- **Notes:** Throws if render/load exceeds 2 seconds.
- **Status:** Actively used; not a candidate for removal.

### README.md
- **Purpose:** Documentation for running, maintaining, and interpreting automated tests and integration checks.
- **Usage:** Reference for developers and CI/CD.
- **Notes:** Includes best practices and CI/CD integration notes.
- **Status:** Actively used; not a candidate for removal.

### setup.ts
- **Purpose:** Vitest setup file for mocking browser APIs, localStorage, WebSocket, and Notification for consistent test environments.
- **Usage:** Used in Vitest configuration for global test setup.
- **Notes:** Ensures consistent mocks and timezone for all tests.
- **Status:** Actively used; not a candidate for removal.

### setupTests.mts
- **Purpose:** Jest ESM-compatible setup file for mocking browser APIs, Chart.js, and UnifiedConfig, and setting up environment variables.
- **Usage:** Used in Jest configuration for ESM projects.
- **Notes:** Ensures compatibility with ESM modules and browser APIs.
- **Status:** Actively used; not a candidate for removal.

### setupTests.ts
- **Purpose:** Jest setup file for polyfilling browser APIs, mocking Chart.js, and setting up environment variables for tests.
- **Usage:** Used in Jest configuration for CJS/ESM projects.
- **Notes:** Ensures compatibility with browser APIs and global mocks.
- **Status:** Actively used; not a candidate for removal.

---

## Subdirectories

### __mocks__/
- **Purpose:** Contains file mocks for static assets in tests.
- **Usage:** Used to mock file imports in Jest.
- **Notes:** Includes fileMock.js for asset stubbing.
- **Status:** Actively used; not a candidate for removal.

### a11y/
- **Purpose:** Contains accessibility tests for App and major components using jest-axe.
- **Usage:** Used to ensure accessibility compliance and ARIA/contrast/keyboard navigation.
- **Notes:** Includes tests for App, Dashboard, PropCards, MoneyMaker, EntryTracking, and Settings.
- **Status:** Actively used; not a candidate for removal.

### api/
- **Purpose:** Contains API endpoint and service tests.
- **Usage:** Used to test API integration and service logic.
- **Notes:** Includes endpoint and service tests for PrizePicks and other APIs.
- **Status:** Actively used; not a candidate for removal.

### integration/
- **Purpose:** Contains integration tests for features, authentication, and workflows.
- **Usage:** Used to test end-to-end flows and feature integration.
- **Notes:** Includes tests for all features, auth flow, and MoneyMaker.
- **Status:** Actively used; not a candidate for removal.

### performance/
- **Purpose:** Contains performance tests for dashboard load and overall app performance.
- **Usage:** Used to ensure performance budgets are met.
- **Notes:** Includes dashboardLoad.perf.test.ts and Performance.test.ts.
- **Status:** Actively used; not a candidate for removal.

### stateSync/
- **Purpose:** Contains tests for store consistency and state synchronization.
- **Usage:** Used to ensure state updates propagate correctly.
- **Notes:** Includes storeConsistency.test.ts.
- **Status:** Actively used; not a candidate for removal.

### unit/
- **Purpose:** Contains unit tests for core logic, prediction engine, state sync, and store hooks.
- **Usage:** Used to test isolated logic and hooks.
- **Notes:** Includes StateSync, UnifiedBettingCore, UnifiedPredictionEngine, and useAppStore tests.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the test directory.*
