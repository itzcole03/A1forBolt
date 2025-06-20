# UltimateSportsBettingApp Frontend Roadmap

_Last updated: June 12, 2025_

This roadmap is designed for maximum maintainability and ease of completion. It is structured by actionable themes, with each item referencing the relevant analysis or documentation file. Contributors should update this file as progress is made or as new requirements arise.

## How to Use This Roadmap
- Each section groups related tasks by theme (Deprecation, Refactor, Documentation, Testing, etc.).
- Each item is traceable to a specific audit or analysis file for context.
- Status should be updated as work progresses: **TODO**, **IN PROGRESS**, **DONE**.
- For detailed file/component/hook usage, see:
  - [COMPONENTS_FILE_USAGE_ANALYSIS.md](./src/components/COMPONENTS_FILE_USAGE_ANALYSIS.md)
  - [TOP_LEVEL_FILE_USAGE_ANALYSIS.md](./TOP_LEVEL_FILE_USAGE_ANALYSIS.md)
  - [frontend_hooks_docs.md](../frontend_hooks_docs.md)
  - [frontend_component_docs.md](../frontend_component_docs.md)

Each section below is cross-referenced with the latest deep audit of all *_ANALYSIS.md and *_FILE_USAGE_ANALYSIS.md files, as well as all major documentation and gap analysis files in the workspace. See the references at the end for a full list.

---

## 1. Deprecation & Cleanup
- [ ] **Deprecate or consolidate unused/legacy components** (see COMPONENTS_FILE_USAGE_ANALYSIS.md, notes section)
    - Review all components exported but not imported anywhere (e.g., Accordion, Alert, Analytics, ApiHealthIndicator, etc.). Remove, merge, or document as reusable library components.
- [ ] **Remove obsolete config/docs files** (see TOP_LEVEL_FILE_USAGE_ANALYSIS.md)
    - Audit for any top-level files or docs that are no longer referenced or needed.

[ ] **Remove deprecated/legacy files and stubs across all directories**
    - Remove or complete deprecated/empty files (e.g., legacy analytics/ML service stubs, empty type declarations, deprecated hooks, and migration notices in analytics services).
    - Remove or update legacy test files and documentation in `_legacy_tests/` and other test directories as identified in PROJECT_FILE_USAGE_ANALYSIS.md.

## 2. Documentation
- [ ] **Add/complete JSDoc for all public components and hooks** (see frontend_hooks_docs.md, frontend_component_docs.md)
    - Fill documentation gaps for components and hooks, especially those missing usage examples or clear purpose comments.
- [ ] **Document empty or placeholder hooks** (see frontend_hooks_docs.md)
    - Implement, document, or remove empty hooks (e.g., useDriftDetection, useFeatureImportance, useHyperMLAnalytics).

[ ] **Ensure all *_FILE_USAGE_ANALYSIS.md and *_ANALYSIS.md files are kept up to date**
    - Update all analysis and usage documentation as files are added, removed, or refactored (see all *_FILE_USAGE_ANALYSIS.md files).
    - Ensure all new directories and services have corresponding analysis documentation.

## 3. Refactor & Modernization
- [ ] **Refactor components flagged as incomplete or outdated** (see COMPONENTS_FILE_USAGE_ANALYSIS.md)
    - Complete implementation for stub/TODO files (e.g., BettingDashboard.tsx).
- [ ] **Adopt latest React patterns (e.g., hooks, context) where missing**
- [ ] **Consolidate duplicate logic/utilities**
- [ ] **Remove deprecated hooks and migrate usages**
    - Remove useEvolutionaryAnalytics and migrate all usages to useUnifiedAnalytics.
- [ ] **Wire advanced features to real backend**
    - Complete backend integration for MoneyMaker/AdvancedMLDashboard and related panels.

[ ] **Remove or refactor deprecated/legacy ML and analytics service files**
    - Remove empty or deprecated files (e.g., mlService.ts, UnifiedFeatureService.ts, legacy test files in analytics) as identified in ANALYTICS_FILE_USAGE_ANALYSIS.md.
    - Refactor or remove legacy/empty type files (e.g., betting.new.ts, core.d.ts) as identified in TYPES_FILE_USAGE_ANALYSIS.md.

[ ] **Review and update all service adapters and managers**
    - Ensure all adapters (e.g., PrizePicks, SportsRadar) are up to date and documented in SERVICES_FILE_USAGE_ANALYSIS.md.

## 4. Testing
- [ ] **Add/expand unit tests for under-tested components/hooks** (see COMPONENTS_FILE_USAGE_ANALYSIS.md, frontend_hooks_docs.md)
    - Identify and cover components/hooks with little or no test coverage.
- [ ] **Integrate E2E tests for critical user flows**
    - Ensure all major flows, especially those involving new or refactored components, have E2E coverage.

[ ] **Audit and update all test directories for coverage and legacy files**
    - Remove or update legacy and incomplete test files (see PROJECT_FILE_USAGE_ANALYSIS.md, TESTS_FILE_USAGE_ANALYSIS.md, TEST_FILE_USAGE_ANALYSIS.md).
    - Ensure all new features and services have corresponding test coverage and documentation.

## 5. Performance & Optimization
- [ ] **Profile and optimize slow components** (see notes in COMPONENTS_FILE_USAGE_ANALYSIS.md)
    - Apply virtualization, memoization, or throttling to components like LineupComparisonTable, LiveOddsTicker, UltimateMoneyMaker, etc.
- [ ] **Implement code-splitting/lazy loading where beneficial**

[ ] **Monitor and optimize all core services and stores**
    - Use monitoring and reporting modules (see MONITORING_FILE_USAGE_ANALYSIS.md, REPORTING_FILE_USAGE_ANALYSIS.md) to identify and address performance bottlenecks in services, stores, and analytics modules.

## 6. Analytics & Monitoring
- [ ] **Add/verify analytics hooks in key user journeys**
- [ ] **Ensure error boundaries and logging are in place**
    - Expand use of ErrorBoundary and error hooks; ensure all critical flows are covered.

[ ] **Integrate and document all monitoring and reporting modules**
    - Ensure all monitoring, reporting, and metrics collection modules are integrated and documented (see MONITORING_FILE_USAGE_ANALYSIS.md, REPORTING_FILE_USAGE_ANALYSIS.md).

## 7. Admin & Diagnostics
- [ ] **Document and expose admin/diagnostic features** (see TOP_LEVEL_FILE_USAGE_ANALYSIS.md)
    - Enhance FeatureStatusPanel with real-time updates and admin edit controls.
- [ ] **Add feature flags for experimental features**

[ ] **Review and document all admin, diagnostic, and provider modules**
    - Ensure all providers, admin, and diagnostic modules are documented and up to date (see PROVIDERS_FILE_USAGE_ANALYSIS.md, ADMIN/diagnostic sections in *_FILE_USAGE_ANALYSIS.md).

## 8. Accessibility & Theming
- [ ] **Audit and improve accessibility (a11y) for all components**
    - Improve presentational components (e.g., ErrorFallback) for dark mode and accessibility.
- [ ] **Standardize theming and dark mode support**

[ ] **Review and update all theme and style modules**
    - Ensure all theme, style, and layout modules are up to date and documented (see THEME_FILE_USAGE_ANALYSIS.md, STYLES_FILE_USAGE_ANALYSIS.md, LAYOUTS_FILE_USAGE_ANALYSIS.md).

---

## References

- All *_FILE_USAGE_ANALYSIS.md and *_ANALYSIS.md files in the workspace (see deep search list)
- [PROJECT_FILE_USAGE_ANALYSIS.md]
- [ML_MODEL_GAPS_ANALYSIS.md]
- [INTELLIGENT_AUDIT_ANALYSIS.md]
- [MONITORING_FILE_USAGE_ANALYSIS.md]
- [REPORTING_FILE_USAGE_ANALYSIS.md]
- [COMPONENTS_FILE_USAGE_ANALYSIS.md]
- [TOP_LEVEL_FILE_USAGE_ANALYSIS.md]
- [frontend_hooks_docs.md]
- [frontend_component_docs.md]

*This roadmap is continuously updated based on the latest deep audit of all analysis and usage documentation. All contributors should ensure new features, services, and modules are reflected in the relevant *_FILE_USAGE_ANALYSIS.md and *_ANALYSIS.md files and cross-referenced here as appropriate.*

---

## Status Legend
- [ ] TODO
- [~] IN PROGRESS
- [x] DONE

---

_This roadmap is living documentation. Update as you complete tasks or as new priorities emerge._
