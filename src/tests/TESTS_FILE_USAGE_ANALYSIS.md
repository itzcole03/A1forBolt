# Tests Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/tests` directory and its subdirectories. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains end-to-end (E2E) and Playwright tests for the frontend application. These tests simulate user flows, API interactions, and UI behaviors to ensure the application works as expected in real-world scenarios.

---

## File Breakdown

### e2e/prediction.test.ts
- **Purpose:** Playwright E2E test suite for the prediction flow, including API mocking, UI interactions, filtering, sorting, modal explanations, error handling, and risk profile updates.
- **Usage:** Used to verify the full prediction workflow, including recommendations, filtering, sorting, and error handling in the UI.
- **Notes:** Mocks API responses for predictions and risk profiles. Simulates user actions and checks UI updates and error messages.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the tests directory.*
