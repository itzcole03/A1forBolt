# Styles Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/styles` directory. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains global and component-level CSS, Tailwind CSS layers, and theme tokens for the frontend application. These files define the visual style, utility classes, and design tokens for consistent UI/UX across the app.

---

## File Breakdown

### components.css
- **Purpose:** Defines Tailwind CSS component classes and custom variants for cards, buttons, inputs, badges, progress bars, tables, dropdowns, and more.
- **Usage:** Used to style reusable UI components with glassmorphism, gradients, and modern effects.
- **Notes:** Includes custom animations and responsive design utilities.
- **Status:** Actively used; not a candidate for removal.

### globals.css
- **Purpose:** Sets up Tailwind CSS base, component, and utility layers, and defines global CSS variables, base styles, and component classes.
- **Usage:** Used for global theming, typography, and utility classes across the app.
- **Notes:** Includes dark mode support, gradients, and custom scrollbars.
- **Status:** Actively used; not a candidate for removal.

### index.css
- **Purpose:** Integrates Tailwind CSS and custom global styles, including glassmorphism, gradients, card effects, responsive breakpoints, and loading spinners.
- **Usage:** Used as the main entry point for global styles in the app.
- **Notes:** Defines CSS variables for light/dark mode and custom animations.
- **Status:** Actively used; not a candidate for removal.

### modern.css
- **Purpose:** Provides modern UI custom styles for cards, premium inputs, and currency symbols, including glassmorphism and gradient backgrounds.
- **Usage:** Used to enhance the look and feel of modern UI components.
- **Notes:** Includes custom keyframes and dark mode variants.
- **Status:** Actively used; not a candidate for removal.

### theme.ts
- **Purpose:** Exports theme tokens for colors, shadows, fonts, radii, transitions, and gradients, along with utility functions for accessing and generating theme variables.
- **Usage:** Used in JS/TS to access design tokens and generate CSS variables for theming.
- **Notes:** Supports both static and programmatic theme management.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the styles directory.*
