# Theme Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/theme` directory. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains theme configuration and utilities for the frontend application, primarily for Material-UI (MUI). It defines light and dark themes, typography, and component overrides, and provides hooks for accessing the current theme.

---

## File Breakdown

### index.ts
- **Purpose:** Exports MUI theme objects for light and dark modes, with shared typography and component overrides. Provides a getTheme function and a useTheme hook for accessing the current theme from the theme store.
- **Usage:** Used throughout the app to provide consistent theming and access to MUI theme objects based on user preference or system settings.
- **Notes:** Integrates with Zustand theme store. Supports both light and dark mode palettes and component customizations.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the theme directory.*
