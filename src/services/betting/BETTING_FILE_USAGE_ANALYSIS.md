# Betting Services Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/services/betting` directory. Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains services for player prop analysis and general sports betting logic. These services aggregate data from analytics, risk, and data integration modules to provide real-time betting recommendations, prop analysis, and risk assessment for both individual and portfolio-level bets.

---

## File Breakdown

### PlayerPropService.ts
- **Purpose:** Provides real-time analysis and recommendations for player prop bets, including expected value, probability, confidence, and risk scoring.
- **Usage:** Used to analyze player props by aggregating stats, odds, news, and sentiment data streams. Exports a singleton `playerPropService` for use in betting UIs and analytics.
- **Notes:** Integrates with advanced ML and data integration services. Supports lineup optimization and portfolio risk analysis.
- **Status:** Actively used; not a candidate for removal.

### sportsBettingService.ts
- **Purpose:** Implements core sports betting logic, including odds aggregation, match prediction, risk modeling, and value assessment.
- **Usage:** Used to generate match predictions, recommend bets, and calculate optimal stake sizes. Exports a singleton `sportsBettingService` for use in betting flows and dashboards.
- **Notes:** Integrates with analytics, ML, and risk modules. Validates API configuration and supports Kelly criterion for stake sizing.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the betting directory.*
