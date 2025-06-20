# Mocks Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/mocks` directory. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains mock service worker (MSW) setup and mock data for frontend development and testing. These modules allow the frontend to simulate API responses and work with mock data without requiring a live backend.

---

## File Breakdown

### browser.ts
- **Purpose:** Sets up a mock service worker (MSW) with handlers for various API endpoints and provides mock data for players, entries, and lineups.
- **Usage:** Used during development and testing to intercept API requests and return mock responses, enabling frontend development without a backend.
- **Notes:** Includes mock data for NBA players, entries, and lineups. Handlers are defined for props, odds, predictions, players, entries, and lineups endpoints.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the mocks directory.*
