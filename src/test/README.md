# Automated Testing & Integration Guide

## Running All Tests

- Run all tests (unit, integration, performance):
  ```bash
  npm test
  ```
- Run lint/type-check:
  ```bash
  npm run lint
  npm run type-check
  ```

## Interpreting Results
- All tests must pass for a successful build.
- Performance tests will fail if load/render >2s.
- Coverage report is generated in `/coverage`.
- Errors and failed tests are reported in the console and CI.

## Maintaining Tests
- Add new tests for every new feature/component/hook/service.
- Update tests if APIs, UI, or state logic changes.
- Use `src/test/integrationChecklist.md` to track coverage and manual checks.

## Using the Integration Checklist
- Open `src/test/integrationChecklist.md`.
- Check off each item as it is validated.
- Add notes for regressions or new features.

## Best Practices
- Write tests before implementing new features (TDD).
- Mock external APIs and WebSockets in tests.
- Use `measurePerformance` utility for all render/load tests.
- Keep tests isolated and maintainable.

## CI/CD
- All tests and checks run automatically on every push/PR via GitHub Actions (`.github/workflows/ci.yml`).
- Builds fail if any test, lint, or performance check fails.
- Coverage artifacts are uploaded for review. 