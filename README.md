# UltimateSportsBettingApp – Frontend

## Overview

This is the frontend for the UltimateSportsBettingApp, built with React, TypeScript, Zustand, and Zod for schema validation. All modules are production-ready, type-safe, and fully documented.

## Key Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md): Structure, patterns, and build system
- [DEPENDENCY_GRAPH.md](./DEPENDENCY_GRAPH.md): Core and dev dependencies
- [README_API.md](./README_API.md): API and schema validation
- [DECISIONS.md](./DECISIONS.md): Key decisions and tradeoffs
- [README_TRACEABILITY.md](./README_TRACEABILITY.md): Feature-to-doc traceability
- [CHANGELOG.md](./CHANGELOG.md): All notable changes

## Getting Started

- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Lint: `npx eslint .`
- Test: `npx jest`

## Quality & CI/CD

- Linting: Airbnb/Prettier config
- Testing: Jest, 100% coverage goal
- CI/CD: Automated via GitHub Actions

## Contribution

- All new features must be documented and mapped in README_TRACEABILITY.md
- Update CHANGELOG.md and DECISIONS.md for every major change

## API Integrations

- The Risk Manager page (`components/RiskManagerPage.tsx`) integrates with `/api/risk-profiles` and `/api/active-bets` endpoints using axios.
- API base URL is configured via environment variable (`REACT_APP_API_URL` in `.env`).
- All API endpoints and keys are managed in `src/config/apiConfig.ts` for maintainability and security.
- See `.env.example` for required environment variables.
- The AffiliateService (`services/partner/AffiliateService.ts`) provides robust, type-safe integration for affiliate links, click tracking, and offers. All endpoints are rate-limited, error-handled, and fully tested in `__tests__/AffiliateService.test.ts`.
- The RefereeService (`services/referee/RefereeService.ts`) provides robust, type-safe integration for referee stats, batch queries, search, and advanced modeling. All endpoints are rate-limited, error-handled, and fully tested in `__tests__/RefereeService.test.ts`.
- The FinalPredictionEngine (FPE) is now the canonical aggregator for all prediction flows (API, WebSocket, UI). All prediction logic is consolidated in `PredictionIntegrationService`, with auxiliary data from modernized services. See `PredictionIntegrationService.ts` and `FinalPredictionEngineImpl` for details.

## Model Integration & Testing

- All model modules (`VenueEffectModel`, `RefereeImpactModel`, `LineupSynergyModel`) are fully integrated, type-safe, and tested.
- Each model exposes a robust async feature extraction function, with config flag gating and SHAP explainability.
- See `src/models/__tests__` for comprehensive test coverage and usage examples.
- All integration points are documented and validated against backend contracts.

# Integration Points

- `/api/risk-profiles` and `/api/active-bets` endpoints must be available and documented in backend API docs.
- API base URL is set via `REACT_APP_API_URL` in `.env` (see `env.example`).
- All API keys and secrets must be managed via environment variables and never hardcoded.
