# Frontend Architecture Overview

## Structure

- **src/**: Main source code, organized by features and services.
- **components/**: Reusable React components.
- **services/**: API, ML, and integration services.
- **types/**: TypeScript type definitions.
- **validation/**: Schema validation using zod.
- **utils/**: Utility functions and helpers.

## Key Technologies

- React 18 (functional components, hooks)
- TypeScript (strict, type-safe)
- Zustand (state management)
- Zod (runtime schema validation)
- Jest (testing)
- ESLint (Airbnb/Prettier config)

## Patterns

- Feature-based modular structure
- Type-safe API and validation layers
- Test-driven development
- Modern, idiomatic React/TS patterns

## Build & Quality

- Linting: `eslint.config.js` (Airbnb/Prettier)
- Testing: Jest, 100% coverage goal
- CI/CD: Automated via GitHub Actions
