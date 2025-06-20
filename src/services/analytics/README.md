// This directory will contain all advanced analytics and ML services ported from Newfolder.

## Advanced ML Service (`mlService.ts`)

This service provides unified orchestration for all advanced machine learning, prediction, risk, and analytics features. It exposes methods for:
- Model training and management
- Prediction and pattern detection
- Risk assessment
- Community insights
- Automated strategy generation
- Correlation analysis
- Custom metric creation

All backend ML logic (XGBoost, LightGBM, SHAP, LIME, etc.) is accessed via API endpoints. Only TensorFlow.js models (DNN, LSTM) are run in-browser.

**Usage:**
```ts
import { mlService } from './mlService';
```

See the file for full API and extension points.

## Testing & Automation

- All analytics and ML services are covered by Jest-based unit tests in this directory.
- To run tests, ensure you have the correct Jest/ts-jest configuration for ESM/TypeScript. See `jest.config.mjs` for details.
- Example command (Windows PowerShell):

```powershell
node --experimental-vm-modules ./node_modules/.bin/jest --passWithNoTests
```

- If you encounter ESM/CommonJS issues, see the Jest docs for ESM/TypeScript interop or use the provided config as a template.

## Integration Notes
- All backend ML and analytics logic is accessed via API endpoints; only TensorFlow.js models run in-browser.
- This service is exported via `index.ts` for easy import across the app.
- Extend or adapt this service for new analytics, risk, or prediction features as needed.
