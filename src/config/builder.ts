import { builder } from '@builder.io/react';

// Initialize Builder with your API key - using the newest key
const BUILDER_API_KEY = 'ae2109aa857549f9980d4843e58092ef';

// Simple initialization without any complex options
builder.init(BUILDER_API_KEY);

// Export for use in components
export { builder };
