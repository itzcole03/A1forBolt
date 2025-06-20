# Builder.io Integration for A1Betting Frontend

This project now includes Builder.io integration for visual content editing and page building.

## Setup Instructions

### 1. Get Your Builder.io API Key

1. Go to [Builder.io](https://builder.io) and create an account
2. Create a new project or use an existing one
3. Copy your Public API Key from the project settings

### 2. Configure Your API Key

Update the API key in these files:

1. `frontend/src/config/builder.ts` - Replace `YOUR_BUILDER_PUBLIC_API_KEY` with your actual API key
2. `frontend/builder.config.json` - Replace `YOUR_BUILDER_PUBLIC_API_KEY` with your actual API key

### 3. Set Up Builder.io Models

In your Builder.io dashboard, create the following models:

1. **Page Model**: 
   - Name: `page`
   - Type: Page
   - URL Pattern: `/*`

2. **Section Models**:
   - Name: `header`
   - Type: Section
   
   - Name: `footer` 
   - Type: Section

### 4. Preview URL Configuration

1. In your Builder.io project settings, set the preview URL to: `http://localhost:5174`
2. This allows live editing while your dev server is running

### 5. Custom Components

The following custom components are registered with Builder.io:

#### BettingCard Component
- **Purpose**: Display betting match information
- **Inputs**:
  - `title`: Match title
  - `odds`: Betting odds
  - `team1`: First team name
  - `team2`: Second team name
  - `sport`: Sport type
  - `time`: Match time

### 6. Usage Examples

#### Render a Builder Page
```tsx
import { BuilderPage } from './components/builder';

// In your component
<BuilderPage 
  model="page" 
  url="/betting" 
/>
```

#### Render a Builder Section
```tsx
import { BuilderPage } from './components/builder';

// In your component
<BuilderPage 
  model="header" 
/>
```

### 7. Development Workflow

1. Start your dev server: `npm run dev`
2. Open Builder.io editor
3. Create/edit content
4. Preview changes live at `http://localhost:5174`
5. Publish when ready

### 8. Adding More Custom Components

To add new custom components:

1. Create your component in `src/components/builder/`
2. Register it with Builder.io using `Builder.registerComponent()`
3. Export it from `src/components/builder/index.ts`
4. Import the component file in your App.tsx to ensure registration

### 9. Environment Variables

For production, consider using environment variables:

```env
VITE_BUILDER_API_KEY=your_builder_api_key_here
```

Then update `src/config/builder.ts`:
```tsx
builder.init(import.meta.env.VITE_BUILDER_API_KEY || 'YOUR_BUILDER_PUBLIC_API_KEY');
```

### 10. Builder.io Features Available

- Visual page builder
- A/B testing
- Personalization
- Custom components
- Live editing
- Multi-variate testing
- Analytics integration

## Next Steps

1. Replace the placeholder API key with your actual Builder.io API key
2. Create your first page in Builder.io
3. Test the integration with live editing
4. Add more custom components as needed
5. Set up production deployment with Builder.io

## Troubleshooting

- Ensure your API key is correct
- Check that the preview URL matches your dev server
- Verify that custom components are properly registered
- Check browser console for any errors
