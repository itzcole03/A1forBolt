# Frontend `src` Directory File Usage Analysis

This document provides a comprehensive breakdown of all files in the `frontend/src` directory (excluding nested directories). Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains the main entry points, global styles, configuration, and utility files for the frontend application. These files are essential for app initialization, theming, global CSS, type definitions, and test setup.

---

## File Breakdown

### App.css
- **Purpose:** Contains global styles for the main app layout, header, prediction cards, and error messages.
- **Usage:** Imported by `App.tsx` to style the main application UI.
- **Notes:** Uses standard CSS for layout and theming.
- **Status:** Actively used; not a candidate for removal.

### App.tsx
- **Purpose:** Main React application component, handles routing and renders the primary UI components.
- **Usage:** Entry point for the React app, imported by `index.tsx`.
- **Notes:** Implements simple hash-based routing and imports key dashboard and money-making components.
- **Status:** Actively used; not a candidate for removal.

### components.css
- **Purpose:** Contains Tailwind CSS layers and custom component styles (cards, buttons, inputs, etc.).
- **Usage:** Imported by various components for consistent styling.
- **Notes:** Uses Tailwind's `@layer` for reusable component classes.
- **Status:** Actively used; not a candidate for removal.

### globals.css
- **Purpose:** Defines global CSS variables, base styles, and reusable component classes using Tailwind.
- **Usage:** Imported at the app level for global theming and style resets.
- **Notes:** Includes dark mode, color variables, and modern UI classes.
- **Status:** Actively used; not a candidate for removal.

### index.css
- **Purpose:** Main global stylesheet, includes Tailwind base, component, and utility layers, plus custom global styles.
- **Usage:** Imported by `index.tsx` to apply global styles across the app.
- **Notes:** Includes glass morphism, gradients, card hover effects, and responsive breakpoints.
- **Status:** Actively used; not a candidate for removal.

### index.tsx
- **Purpose:** React app entry point, renders the `App` component into the DOM.
- **Usage:** Main entry for the frontend, bootstraps the React app.
- **Notes:** Uses React 18 root API and strict mode.
- **Status:** Actively used; not a candidate for removal.

### jest.setup-env.js
- **Purpose:** Sets up global environment variables and mocks for Jest tests.
- **Usage:** Imported by Jest to configure the test environment.
- **Notes:** Mocks `import.meta.env` and other globals for test compatibility.
- **Status:** Actively used for testing; not a candidate for removal.

### jest.setup-files.js
- **Purpose:** Sets up additional mocks for Jest tests, including `IntersectionObserver` and default intersection state.
- **Usage:** Imported by Jest for test setup.
- **Notes:** Ensures compatibility with React and Next.js test utilities.
- **Status:** Actively used for testing; not a candidate for removal.

### LoginPage.tsx
- **Purpose:** Implements a simple login page with email/password form and API integration.
- **Usage:** Used for user authentication in the frontend app.
- **Notes:** Stores JWT in localStorage on successful login; can be extended for real auth flows.
- **Status:** Actively used; not a candidate for removal.

### main.py
- **Purpose:** Python entry point for a system analysis tool (not directly related to the frontend React app).
- **Usage:** Used for system analysis, optimization, and reporting via CLI.
- **Notes:** Integrates with backend analysis modules; not part of the React build.
- **Status:** Utility script; not a candidate for removal.

### setupTests.ts
- **Purpose:** Sets up polyfills and mocks for the Node.js test environment (TextEncoder, TextDecoder, matchMedia, ResizeObserver).
- **Usage:** Imported by Jest to configure the test environment for React Testing Library.
- **Notes:** Ensures compatibility with browser APIs in Node.js tests.
- **Status:** Actively used for testing; not a candidate for removal.

### theme.ts
- **Purpose:** Defines the Material-UI theme configuration for the app, including palette, typography, and component overrides.
- **Usage:** Imported by the app to provide consistent theming via MUI.
- **Notes:** Uses dark mode by default; can be extended for custom themes.
- **Status:** Actively used; not a candidate for removal.

### types.ts
- **Purpose:** Type definitions for feature engineering analytics and ESPN headlines.
- **Usage:** Shared across services and components for type safety.
- **Notes:** Includes ESPN headline interface and generic feature types.
- **Status:** Actively used; not a candidate for removal.

### vite-env.d.ts
- **Purpose:** TypeScript declaration for Vite's environment variables.
- **Usage:** Ensures type safety for `import.meta.env` in the app.
- **Notes:** Standard Vite boilerplate.
- **Status:** Actively used; not a candidate for removal.

### zod.ts
- **Purpose:** Re-exports Zod for type-safe schema validation.
- **Usage:** Used throughout the app for runtime type validation.
- **Notes:** Centralizes Zod imports for consistency.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the `src` directory.*
