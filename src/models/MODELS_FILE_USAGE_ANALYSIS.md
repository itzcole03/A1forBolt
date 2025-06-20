# Models Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/models` directory. Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains TypeScript interfaces and modular model scaffolds for user, betting, prediction, clustering, and advanced analytics models. These models are used throughout the frontend for type safety, feature engineering, and integration with analytics and prediction services.

---

## File Breakdown

### BehaviorProfile.ts
- **Purpose:** Defines the `BehaviorProfile` interface for user betting behavior, performance metrics, risk profile, and prediction preferences.
- **Usage:** Used to model and update user behavior and risk analytics in betting flows and analytics dashboards.
- **Notes:** Includes update methods for each profile section.
- **Status:** Actively used; not a candidate for removal.

### Bet.ts
- **Purpose:** Defines the `Bet` interface for representing a user's bet, including prediction details and factors.
- **Usage:** Used throughout betting, analytics, and user dashboards to represent and process bets.
- **Notes:** Includes prediction breakdown and confidence factors.
- **Status:** Actively used; not a candidate for removal.

### Cluster.ts
- **Purpose:** Defines the `Cluster` interface for user or bet clustering, including risk profile and characteristics.
- **Usage:** Used in analytics and segmentation features to group users or bets by behavior and risk.
- **Notes:** Supports clustering by style, risk, and market preference.
- **Status:** Actively used; not a candidate for removal.

### LineupSynergyModel.ts
- **Purpose:** Provides a modular model for lineup synergy analysis, including feature extraction and SHAP insights.
- **Usage:** Used to compute synergy scores for lineups in analytics and prediction modules.
- **Notes:** Integrates with unified config and SHAP utilities. Throws if disabled by config.
- **Status:** Actively used; not a candidate for removal.

### PlayerFormModel.ts
- **Purpose:** Modular model for player form analysis, extending a base model and emitting SHAP insights.
- **Usage:** Used to predict player form and generate analytics for dashboards and prediction services.
- **Notes:** Integrates with unified config, event bus, and SHAP utilities. Throws if disabled by config.
- **Status:** Actively used; not a candidate for removal.

### Prediction.ts
- **Purpose:** Defines the `Prediction` interface for model predictions, including probability, confidence, and factor breakdowns.
- **Usage:** Used in prediction, analytics, and betting modules to represent and process predictions.
- **Notes:** Supports metadata, SHAP values, and prediction breakdowns.
- **Status:** Actively used; not a candidate for removal.

### PvPMatchupModel.ts
- **Purpose:** Modular model for player-vs-player matchup analysis, extending a base model and emitting SHAP insights.
- **Usage:** Used to predict PvP outcomes and generate analytics for dashboards and prediction services.
- **Notes:** Integrates with unified config, event bus, and SHAP utilities. Throws if disabled by config.
- **Status:** Actively used; not a candidate for removal.

### RefereeImpactModel.ts
- **Purpose:** Modular model for referee impact analysis, including feature extraction and SHAP insights.
- **Usage:** Used to compute referee impact scores in analytics and prediction modules.
- **Notes:** Integrates with unified config and SHAP utilities. Throws if disabled by config.
- **Status:** Actively used; not a candidate for removal.

### User.ts
- **Purpose:** Defines the `User` interface for user profile, preferences, and statistics.
- **Usage:** Used throughout the app for user management, analytics, and personalization.
- **Notes:** Includes notification settings and betting statistics.
- **Status:** Actively used; not a candidate for removal.

### VenueEffectModel.ts
- **Purpose:** Modular model for venue effect analysis, including feature extraction and SHAP insights.
- **Usage:** Used to compute venue effect scores in analytics and prediction modules.
- **Notes:** Integrates with unified config and SHAP utilities. Throws if disabled by config.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the models directory.*
