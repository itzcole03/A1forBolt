# Scripts Directory Documentation

This document provides a comprehensive breakdown of all files in the `frontend/src/scripts` directory. Each entry is based on direct analysis of the file contents and includes purpose, usage, notes, and status.

---

## Table of Contents

- [Overview](#overview)
- [File Breakdown](#file-breakdown)

---

## Overview

This directory contains Node.js scripts for automation, server startup, and data updates. These scripts are designed to automate development tasks, run backend services, and manage data scraping and updates.

---

## File Breakdown

### automate-updates.ts
- **Purpose:** Automates updates for dependencies, imports, type definitions, and UI components. Updates framer-motion, modifies imports, creates a SmartSidebar component, updates type definitions, and runs a linter.
- **Usage:** Run as a Node.js script to automate project maintenance and codebase updates.
- **Notes:** Uses child_process, fs, and path modules. Modifies files and runs npm commands.
- **Status:** Actively used; not a candidate for removal.

### runAutomation.ts
- **Purpose:** Starts and manages the betting automation service, handling process signals and errors for graceful shutdown and notifications.
- **Usage:** Run as a Node.js script to start the betting automation workflow.
- **Notes:** Integrates with BettingAutomationService and notificationService. Handles process signals and exceptions.
- **Status:** Actively used; not a candidate for removal.

### start.ts
- **Purpose:** Starts the Express server and logs available endpoints and health check URLs.
- **Usage:** Run as a Node.js script to start the backend server.
- **Notes:** Imports the app from the main index file. Configurable port.
- **Status:** Actively used; not a candidate for removal.

### updateData.ts
- **Purpose:** Runs the DataScrapingService to fetch and update player data.
- **Usage:** Run as a Node.js script to perform data scraping and updates.
- **Notes:** Uses reflect-metadata and a singleton DataScrapingService. Logs errors if data update fails.
- **Status:** Actively used; not a candidate for removal.

---

*This documentation is auto-generated and should be updated as files are added, removed, or refactored in the scripts directory.*
