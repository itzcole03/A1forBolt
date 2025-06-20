# Contexts Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/contexts` directory. Each entry includes purpose, usage, notes, and status, following the style of the provided hooks documentation.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains React context providers and hooks for global app state, including authentication, logging, metrics, theming, strategy input, and WebSocket connections. These contexts enable dependency injection, global state management, and cross-cutting concerns throughout the frontend application.

---

## File Breakdown

### AuthContext.tsx
- **Purpose:** Provides authentication context and hooks for user state, login, logout, and registration.
- **Usage:** Wraps the app to provide `useAuth` and manage user authentication state and actions.
- **Notes:** Integrates with `authService` and error logging; supports async initialization and error handling.
- **Status:** Actively used; not a candidate for removal.

### LoggerContext.tsx
- **Purpose:** Provides a context for unified logging utilities.
- **Usage:** Wraps the app to provide a `UnifiedLogger` instance to components.
- **Notes:** Used for dependency injection of logging services.
- **Status:** Actively used; not a candidate for removal.

### MetricsContext.tsx
- **Purpose:** Provides a context for unified metrics utilities.
- **Usage:** Wraps the app to provide a `UnifiedMetrics` instance to components.
- **Notes:** Used for dependency injection of metrics services.
- **Status:** Actively used; not a candidate for removal.

### StrategyInputContext.tsx
- **Purpose:** Provides context and hooks for managing strategy input state (stake, confidence, strategies, sports, props).
- **Usage:** Used to manage and update strategy input in betting and analytics flows.
- **Notes:** Supports updating and resetting strategy input; uses React state and context.
- **Status:** Actively used; not a candidate for removal.

### ThemeContext.tsx
- **Purpose:** Provides theming context and hooks for dark/light mode and Material-UI theme.
- **Usage:** Wraps the app to provide theme toggling and MUI theme provider.
- **Notes:** Supports dark mode toggle and custom theme configuration.
- **Status:** Actively used; not a candidate for removal.

### WebSocketContext.tsx
- **Purpose:** Provides context and hooks for WebSocket connection state, message subscription, and event handling.
- **Usage:** Wraps the app to provide WebSocket connection status and event subscription utilities.
- **Notes:** Integrates with `webSocketManager` and error logging; supports connection, disconnection, and error handling.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the contexts directory.*
