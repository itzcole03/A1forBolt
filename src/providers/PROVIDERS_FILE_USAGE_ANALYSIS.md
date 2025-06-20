# Providers Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/providers` directory. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains React context providers and related hooks for global state management, such as authentication and theme. These modules enable application-wide access to user authentication and theme preferences.

---

## File Breakdown

### AuthProvider.tsx
- **Purpose:** Implements the AuthProvider React context for user authentication, including login, logout, registration, token validation, and profile updates.
- **Usage:** Wraps the application to provide authentication state and actions via context. Exports a useAuth hook for consuming authentication state and actions.
- **Notes:** Handles token storage, validation, and user state. Integrates with a remote API for authentication and profile management.
- **Status:** Actively used; not a candidate for removal.

### ThemeProvider.tsx
- **Purpose:** Implements the ThemeProvider React context for managing dark/light theme state and toggling.
- **Usage:** Wraps the application to provide theme state and a toggle function via context. Exports a useTheme hook for consuming theme state and toggling.
- **Notes:** Persists theme preference in localStorage and applies/removes the 'dark' class on the document root.
- **Status:** Actively used; not a candidate for removal.

### useAuth.ts
- **Purpose:** Exports a useAuth hook for consuming the AuthContext.
- **Usage:** Used in React components to access authentication state and actions provided by AuthProvider.
- **Notes:** Throws an error if used outside of AuthProvider. Duplicates the useAuth export from AuthProvider.tsx for convenience.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the providers directory.*
