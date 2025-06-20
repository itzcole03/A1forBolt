# User Services Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/services/user` directory. Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains services related to user bet tracking and analytics. It provides interfaces for retrieving user bet history, calculating ROI, win/loss streaks, and other betting analytics, integrating with backend APIs and rate limiting utilities.

---

## File Breakdown

### BetTrackingService.ts
- **Purpose:** Tracks user bets, calculates ROI, win/loss streaks, and provides analytics for user betting performance.
- **Usage:** Used to fetch user bet records and analytics from backend persistent storage. Exports a singleton `betTrackingService` for use in user dashboards and analytics features.
- **Notes:** Integrates with backend APIs and rate limiting. Returns detailed analytics including streaks and profit.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the user directory.*
