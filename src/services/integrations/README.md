# Integrations Service Layer

This directory contains modular API connectors for all external data sources:
- Sports Data
- Odds Data
- Social Sentiment
- News
- Weather
- Injury Reports

Each connector uses environment variables for API keys and endpoints (see `src/config/apiConfig.ts`).

All connectors include:
- Error handling and retry logic
- Rate-limit awareness
- Request normalization
- Logging for data freshness and errors

See each file for usage details.
