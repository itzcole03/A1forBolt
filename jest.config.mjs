/**
 * Jest configuration for TypeScript and ESM support
 */
export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jsdom',
    transform: {}, // ts-jest handles .ts/.tsx, ESM support enabled
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        // Handle CSS imports (if any)
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    globals: {
        'ts-jest': {
            useESM: true,
            tsconfig: './tsconfig.app.json',
        },
    },
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
};
