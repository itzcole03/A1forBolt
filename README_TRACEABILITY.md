# Traceability Matrix – Frontend

This document maps features, modules, and requirements to their implementation and documentation for deep research and audit purposes.

| Feature/Requirement     | Module/File                       | Documentation                  |
| ----------------------- | --------------------------------- | ------------------------------ |
| Schema validation       | validation/schemas.ts, zod.ts     | README_API.md, ARCHITECTURE.md |
| API integration         | services/apiService.ts, services/ | README_API.md, ARCHITECTURE.md |
| State management        | store/, zustand usage             | ARCHITECTURE.md                |
| UI components           | components/                       | README.md, ARCHITECTURE.md     |
| Type safety             | types/, all .ts/.tsx files        | ARCHITECTURE.md, DECISIONS.md  |
| Testing                 | **tests**/, \*.test.ts(x)         | README.md, ARCHITECTURE.md     |
| Linting/Quality         | eslint.config.js, package.json    | ARCHITECTURE.md, DECISIONS.md  |
| Changelog               | CHANGELOG.md                      | CHANGELOG.md                   |
| Key decisions/tradeoffs | DECISIONS.md                      | DECISIONS.md                   |
| Risk Manager integration (profiles, bets) | components/RiskManagerPage.tsx, config/apiConfig.ts | README_API.md, README.md, README_TRACEABILITY.md |

- All features and modules are mapped to their documentation for full traceability.
- For any new feature, update this matrix and the relevant documentation.
