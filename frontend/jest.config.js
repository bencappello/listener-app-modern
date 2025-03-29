module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
    '^.+\\.(css|jpg|jpeg|png|gif|webp|svg)$': 'jest-transform-stub',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@chakra-ui/utils/context$': 'jest-transform-stub',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/build/'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios|@?chakra-ui|@emotion)'
  ],
  clearMocks: true,
  coverageDirectory: 'coverage',
}; 