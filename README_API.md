# Frontend API & Schema Validation

## API Layer

- All API calls are handled via the `services/` directory.
- Axios is used for HTTP requests.
- API responses are validated using zod schemas in `validation/schemas.ts`.

## Schema Validation

- All user input and API responses are validated with zod.
- See `validation/schemas.ts` for all schema definitions.

## Example Usage

```typescript
import { betSchema } from "./validation/schemas";

const result = betSchema.parse(apiResponse);
```

## Error Handling

- All validation errors are caught and reported to the user with clear messages.
- Middleware in `validation/schemas.ts` ensures type safety and error reporting.

## Risk Manager API Integration

- The Risk Manager page fetches risk profiles from `/api/risk-profiles` and active bets from `/api/active-bets` using axios.
- API responses are type-checked and validated in the component.
- All endpoints are configured via environment variables and `config/apiConfig.ts`.
