# UltimateSportsBettingApp: Visual Architecture & Documentation Connections Overview

_Last updated: June 12, 2025_

This document provides a high-level visual and narrative summary of how all major modules, services, components, and *_ANALYSIS.md / *_FILE_USAGE_ANALYSIS.md documentation files connect and support the overall frontend architecture. Use this as a map to ensure all parts of the system are documented, connected, and actionable.

---

## 1. High-Level System Map

```mermaid
graph TD
  A[App Entry (index.tsx, App.tsx)] --> B[Providers (AuthProvider, ThemeProvider, useAuth, useTheme)]
  B --> C[Stores (Zustand: appStore, bettingStore, etc.)]
  B --> D[Theme & Styles (theme.ts, THEME_FILE_USAGE_ANALYSIS.md, STYLES_FILE_USAGE_ANALYSIS.md)]
  A --> E[Pages (src/pages, PAGES_FILE_USAGE_ANALYSIS.md)]
  E --> F[Components (src/components, COMPONENTS_FILE_USAGE_ANALYSIS.md)]
  F --> G[Hooks (src/hooks, frontend_hooks_docs.md)]
  F --> H[Stories (Storybook, STORIES_FILE_USAGE_ANALYSIS.md)]
  F --> I[Tests (src/tests, TESTS_FILE_USAGE_ANALYSIS.md)]
  A --> J[Services (src/services, SERVICES_FILE_USAGE_ANALYSIS.md)]
  J --> K[API Layer (api, API_FILE_USAGE_ANALYSIS.md)]
  J --> L[Analytics/ML (analytics, ANALYTICS_FILE_USAGE_ANALYSIS.md)]
  J --> M[Betting (betting, BETTING_FILE_USAGE_ANALYSIS.md)]
  J --> N[Notification (notification, NOTIFICATION_FILE_USAGE_ANALYSIS.md)]
  J --> O[Unified Services (unified, UNIFIED_FILE_USAGE_ANALYSIS.md)]
  J --> P[User Services (user, USER_FILE_USAGE_ANALYSIS.md)]
  J --> Q[Utils (utils, UTILS_FILE_USAGE_ANALYSIS.md)]
  J --> R[Types (types, TYPES_FILE_USAGE_ANALYSIS.md)]
  J --> S[Providers (providers, PROVIDERS_FILE_USAGE_ANALYSIS.md)]
  J --> T[Adapters (adapters, SERVICES_FILE_USAGE_ANALYSIS.md)]
  J --> U[Reporting/Monitoring (reporting, monitoring, REPORTING_FILE_USAGE_ANALYSIS.md, MONITORING_FILE_USAGE_ANALYSIS.md)]
  A --> V[Middleware (middleware, MIDDLEWARE_FILE_USAGE_ANALYSIS.md)]
  A --> W[Mocks (mocks, MOCKS_FILE_USAGE_ANALYSIS.md)]
  A --> X[Models (models, MODELS_FILE_USAGE_ANALYSIS.md)]
  A --> Y[Layouts (layouts, LAYOUTS_FILE_USAGE_ANALYSIS.md)]
  A --> Z[Validation (validation, VALIDATION_FILE_USAGE_ANALYSIS.md)]
  A --> AA[Config (config, CONFIG_FILE_USAGE_ANALYSIS.md)]
  A --> AB[Assets (assets, ASSETS_FILE_USAGE_ANALYSIS.md)]
  A --> AC[Scripts (scripts, SCRIPTS_FILE_USAGE_ANALYSIS.md)]
  A --> AD[Core (core, CORE_FILE_USAGE_ANALYSIS.md)]
  A --> AE[Data (data, DATA_FILE_USAGE_ANALYSIS.md)]
  A --> AF[Store (store, STORE_FILE_USAGE_ANALYSIS.md)]
  A --> AG[Stores (stores, STORES_FILE_USAGE_ANALYSIS.md)]
  A --> AH[Lib (lib, LIB_FILE_USAGE_ANALYSIS.md)]
  A --> AI[Strategies (strategies, STRATEGIES_FILE_USAGE_ANALYSIS.md)]
  A --> AJ[Analysis (analysis, ANALYSIS_FILE_USAGE_ANALYSIS.md)]

  subgraph Documentation
    D
    F
    G
    H
    I
    J
    K
    L
    M
    N
    O
    P
    Q
    R
    S
    T
    U
    V
    W
    X
    Y
    Z
    AA
    AB
    AC
    AD
    AE
    AF
    AG
    AH
    AI
    AJ
  end
```

---

## 2. Narrative: How Everything Connects

- **App Entry**: The application starts at `index.tsx` and `App.tsx`, which initialize providers, stores, and global styles.
- **Providers**: `AuthProvider`, `ThemeProvider`, and related hooks provide authentication and theming context to the entire app.
- **Stores**: Zustand-based stores manage global and domain-specific state, referenced in `STORE_FILE_USAGE_ANALYSIS.md` and `STORES_FILE_USAGE_ANALYSIS.md`.
- **Theme & Styles**: Theming and style modules ensure consistent UI, with documentation in `THEME_FILE_USAGE_ANALYSIS.md` and `STYLES_FILE_USAGE_ANALYSIS.md`.
- **Pages & Components**: All routes and UI are defined in `src/pages` and `src/components`, with usage and status tracked in their respective analysis files.
- **Hooks**: Custom hooks encapsulate reusable logic, documented in `frontend_hooks_docs.md`.
- **Services**: All business logic, API calls, analytics, betting, notifications, and more are handled in `src/services` and its subdirectories, each with a corresponding *_FILE_USAGE_ANALYSIS.md.
- **Adapters & Providers**: Abstract integration with external APIs and services, documented in `SERVICES_FILE_USAGE_ANALYSIS.md` and `PROVIDERS_FILE_USAGE_ANALYSIS.md`.
- **Analytics/ML**: Advanced analytics and ML logic are in `analytics/`, with migration and deprecation tracked in `ANALYTICS_FILE_USAGE_ANALYSIS.md`.
- **Testing & Stories**: All tests and Storybook stories are documented and mapped to their respective modules.
- **Reporting & Monitoring**: System health, metrics, and reporting modules are documented in `REPORTING_FILE_USAGE_ANALYSIS.md` and `MONITORING_FILE_USAGE_ANALYSIS.md`.
- **Other Directories**: All other directories (mocks, models, layouts, validation, config, assets, scripts, core, data, strategies, analysis, etc.) are documented in their *_FILE_USAGE_ANALYSIS.md files.

---

## 3. Documentation & Audit Coverage

- Every major directory and service has a corresponding *_FILE_USAGE_ANALYSIS.md or *_ANALYSIS.md file.
- Deprecated, legacy, or incomplete files are flagged in their respective analysis docs.
- The roadmap and this overview are cross-referenced with all analysis files to ensure nothing is missed.

---

_If you see a missing connection or undocumented module, update the relevant *_FILE_USAGE_ANALYSIS.md and cross-reference it here and in the roadmap._
