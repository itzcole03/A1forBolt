# Middleware Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/middleware` directory. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains Express middleware modules for authentication, rate limiting, and security. These modules are designed to be reusable and composable, providing robust protection and access control for the application's API endpoints.

---

## File Breakdown

### auth.ts
- **Purpose:** Provides authentication and authorization middleware, including JWT verification, role-based access control, password validation, session management, and rate limiting for login and registration.
- **Usage:** Used to protect routes, enforce password policies, and manage user sessions in Express applications.
- **Notes:** Integrates with JWT, Express rate limiter, and user type definitions. Includes logic for token renewal and role checks.
- **Status:** Actively used; not a candidate for removal.

### rateLimiter.ts
- **Purpose:** Defines multiple rate limiters for different API endpoints, including general API, authentication, and betting routes.
- **Usage:** Used to prevent abuse and brute-force attacks by limiting request rates per IP address.
- **Notes:** Integrates with UnifiedLogger for logging rate limit events. Custom handlers for each limiter.
- **Status:** Actively used; not a candidate for removal.

### security.ts
- **Purpose:** Provides security middleware for setting HTTP security headers and integrating Helmet for advanced security policies.
- **Usage:** Used to enhance HTTP response security, enforce CSP, and log security events in Express applications.
- **Notes:** Integrates with UnifiedLogger. Exports both a custom security middleware and a configured Helmet instance.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the middleware directory.*
