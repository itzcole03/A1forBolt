# FinalPredictionEngine

The FinalPredictionEngine is the core intelligence layer of the platform, designed to assist users in making profitable, low-risk bets through strategic confidence-weighted analysis. It aggregates various signals and insights to provide comprehensive predictions with detailed explanations.

## Features

- **Multi-Model Aggregation**: Combines predictions from multiple models (historical, market, sentiment, correlation) with weighted confidence scoring
- **Risk Profiling**: Supports different risk profiles (safe, aggressive, custom) with adjustable multipliers
- **Feature Analysis**: Identifies and explains key features influencing predictions using SHAP values
- **Real-time Updates**: Processes live model feedback and event updates
- **Comprehensive Metrics**: Tracks prediction quality, data freshness, and signal strength
- **Type Safety**: Fully typed interfaces for robust integration
- **Error Handling**: Unified error system with detailed context
- **Logging & Monitoring**: Integrated logging and metrics tracking

## Architecture

### Core Components

1. **Prediction Generation**
   - Weighted aggregation of model outputs
   - Risk level determination
   - Confidence scoring
   - Feature impact analysis
   - Payout range calculation

2. **Risk Management**
   - Risk profile configuration
   - Stake limits
   - Confidence thresholds
   - Sure odds detection

3. **Feature Analysis**
   - SHAP value aggregation
   - Top feature identification
   - Supporting feature analysis
   - Impact visualization

4. **Monitoring & Metrics**
   - Processing time tracking
   - Data freshness scoring
   - Signal quality assessment
   - Decision path logging

## Usage

```typescript
import { FinalPredictionEngineImpl } from './FinalPredictionEngine';
import { FinalPredictionEngineConfig } from './types';

// Initialize the engine
const engine = new FinalPredictionEngineImpl(
  {
    logger: unifiedLogger,
    metrics: unifiedMetrics,
    config: unifiedConfig
  },
  initialConfig
);

// Generate a prediction
const prediction = await engine.generatePrediction(
  modelOutputs,
  riskProfile
);

// Update model weights
await engine.updateModelWeights(newWeights);

// Update risk profiles
await engine.updateRiskProfiles(newProfiles);

// Get engine metrics
const metrics = await engine.getEngineMetrics();

// Validate a prediction
const isValid = await engine.validatePrediction(prediction);
```

## Configuration

The engine can be configured through the `FinalPredictionEngineConfig` interface:

```typescript
interface FinalPredictionEngineConfig {
  modelWeights: ModelWeight[];
  riskProfiles: Record<string, RiskProfile>;
  sureOddsThreshold: number;
  featureThreshold: number;
  maxFeatures: number;
}
```

### Default Configuration

```typescript
const defaultConfig: FinalPredictionEngineConfig = {
  modelWeights: [
    { type: 'historical', weight: 0.4 },
    { type: 'market', weight: 0.3 },
    { type: 'sentiment', weight: 0.2 },
    { type: 'correlation', weight: 0.1 }
  ],
  riskProfiles: {
    safe: {
      type: 'safe',
      multiplier: 1.2,
      maxStake: 100
    },
    aggressive: {
      type: 'aggressive',
      multiplier: 2.0,
      maxStake: 500
    }
  },
  sureOddsThreshold: 0.8,
  featureThreshold: 0.1,
  maxFeatures: 5
};
```

## Integration

### Frontend Integration

The engine's predictions can be used by:

1. **Payout Preview Panel**
   - Real-time payout calculations
   - Risk-adjusted stake suggestions
   - Confidence visualization

2. **Betting Automation**
   - Automated bet placement
   - Risk management
   - Position sizing

3. **Analytics Dashboard**
   - Prediction performance tracking
   - Feature impact analysis
   - Risk profile optimization

### Backend Integration

The engine integrates with:

1. **Model Pipeline**
   - Real-time model updates
   - Feature importance tracking
   - Performance monitoring

2. **Event System**
   - Live event processing
   - Market data integration
   - Sentiment analysis

3. **Metrics System**
   - Performance tracking
   - Quality monitoring
   - System health checks

## Development

### Prerequisites

- Node.js 14+
- TypeScript 4+
- Jest for testing

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Build:
   ```bash
   npm run build
   ```

### Testing

The module includes comprehensive tests:

- Unit tests for core functionality
- Integration tests for dependencies
- Performance benchmarks
- Error handling scenarios

Run tests with:
```bash
npm test
```

## Error Handling

The engine uses a unified error system:

```typescript
class FinalPredictionError extends UnifiedError {
  constructor(
    message: string,
    code: string = 'PREDICTION_ERROR',
    severity: 'ERROR' | 'WARNING' = 'ERROR',
    context?: Record<string, any>
  ) {
    super(message, code, severity, context);
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License 