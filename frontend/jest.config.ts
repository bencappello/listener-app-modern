import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$' : 'identity-obj-proxy',
    '^@/(.*)$'                  : '<rootDir>/src/$1',
  },
  transform: {
    // Use ts-jest for TypeScript/JavaScript files
    '^.+\\.(ts|tsx|js|jsx)$' : [
      'ts-jest',
      {
        tsconfig: 'tsconfig.app.json',
      },
    ],
  },
  // By default, jest doesn't transform node_modules. 
  // We need to whitelist jest-dom and potentially other CJS dependencies.
  transformIgnorePatterns: [
    // Default: '/node_modules/'
    // Allow transformation of jest-dom
    '/node_modules/(?!@testing-library/jest-dom)',
  ],
  // Ensure .ts and .tsx files are treated as modules
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Explicitly tell Jest which extensions are ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

export default config; 