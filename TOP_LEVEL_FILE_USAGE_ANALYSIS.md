# Top-Level File Usage Analysis (frontend/)

- **vite.config.ts**  
  *Purpose*: Vite build and dev server configuration.  
  *Exported*: Yes (default export)  
  *Imported*: No (not imported elsewhere; used by Vite CLI)  
  *Implementation*: Complete  
  *Notes*: Uses ES6 imports and exports.

- **tailwind.config.js**  
  *Purpose*: Tailwind CSS configuration.  
  *Exported*: No explicit export  
  *Imported*: No (used by Tailwind CLI)  
  *Implementation*: Complete  
  *Notes*: No ES6 or CommonJS exports; config file only.

- **eslint.config.js**  
  *Purpose*: ESLint configuration for the project.  
  *Exported*: Yes (default export)  
  *Imported*: No (used by ESLint CLI)  
  *Implementation*: Complete  
  *Notes*: Uses ES6 imports and exports.

- **component_audit.js**  
  *Purpose*: Script for auditing React components.  
  *Exported*: No explicit export  
  *Imported*: No (standalone script)  
  *Implementation*: Complete  
  *Notes*: Uses CommonJS `require` for dependencies; not imported elsewhere.

- **babel.config.js**  
  *Purpose*: Babel configuration for transpiling code.  
  *Exported*: No explicit export  
  *Imported*: No (used by Babel CLI)  
  *Implementation*: Complete  
  *Notes*: No ES6 or CommonJS exports; config file only.

- **windsurf_deployment.yaml**  
  *Purpose*: Deployment configuration for Windsurf (YAML).  
  *Exported*: N/A  
  *Imported*: No (used by deployment tools)  
  *Implementation*: Complete

- **tsconfig.sw.json**  
  *Purpose*: TypeScript config for service workers.  
  *Exported*: N/A  
  *Imported*: No (used by TypeScript CLI)  
  *Implementation*: Complete

- **tsconfig.node.json**  
  *Purpose*: TypeScript config for Node.js.  
  *Exported*: N/A  
  *Imported*: No (used by TypeScript CLI)  
  *Implementation*: Complete

- **tsconfig.json**  
  *Purpose*: Main TypeScript configuration.  
  *Exported*: N/A  
  *Imported*: No (used by TypeScript CLI)  
  *Implementation*: Complete

- **tsconfig.jest.json**  
  *Purpose*: TypeScript config for Jest tests.  
  *Exported*: N/A  
  *Imported*: No (used by Jest/TypeScript CLI)  
  *Implementation*: Complete

- **tsconfig.app.json**  
  *Purpose*: TypeScript config for the app build.  
  *Exported*: N/A  
  *Imported*: No (used by TypeScript CLI)  
  *Implementation*: Complete

- **TEST_AUDIT.md**  
  *Purpose*: Manual or automated test audit documentation.  
  *Exported*: N/A  
  *Imported*: No  
  *Implementation*: Complete

- **service-status-and-feature-flags.md**  
  *Purpose*: Documentation of service status and feature flags.  
  *Exported*: N/A  
  *Imported*: No  
  *Implementation*: Complete

- **README_TRACEABILITY.md**  
  *Purpose*: Traceability matrix and documentation.  
  *Exported*: N/A  
  *Imported*: No  
  *Implementation*: Complete

- **README_API.md**  
  *Purpose*: API documentation for the frontend.  
  *Exported*: N/A  
  *Imported*: No  
  *Implementation*: Complete

- **README.md**  
  *Purpose*: Main project readme.  
  *Exported*: N/A  
  *Imported*: No  
  *Implementation*: Complete

- **package.json**  
  *Purpose*: NPM package manifest.  
  *Exported*: N/A  
  *Imported*: No (used by npm/yarn)  
  *Implementation*: Complete

- **package-lock.json**  
  *Purpose*: NPM lockfile for reproducible installs.  
  *Exported*: N/A  
  *Imported*: No (used by npm)  
  *Implementation*: Complete

- **NEXT_FEATURES_PLAN.md**  
  *Purpose*: Planning document for upcoming features.  
  *Exported*: N/A  
  *Imported*: No  
  *Implementation*: Complete

- **netlify.toml**  
  *Purpose*: Netlify deployment configuration.  
  *Exported*: N/A  
  *Imported*: No (used by Netlify)  
  *Implementation*: Complete

- **lint-results.json**  
  *Purpose*: Linting results output.  
  *Exported*: N/A  
  *Imported*: No  
  *Implementation*: Complete

- **jest.config.mjs**  
  *Purpose*: Jest configuration (ESM).  
  *Exported*: No explicit export  
  *Imported*: No (used by Jest CLI)  
  *Implementation*: Complete

---

*Last updated: June 12, 2025*
