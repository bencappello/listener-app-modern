# Listener App Frontend

This is the frontend application for the Listener App - a music blog aggregator for discovering new music.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

### Building for Production

```bash
npm run build
```

## Testing Infrastructure

The frontend application uses a comprehensive testing setup with the following tools and utilities:

### Testing Libraries

- **Jest**: Test runner and assertion library
- **React Testing Library**: For testing React components
- **Mock Service Worker (MSW)**: For mocking API requests

### Test Utilities

Located in `src/test-utils/`:

- `testing-library-utils.tsx`: Custom render function with router provider
- `api-test-utils.ts`: Utilities for API testing with MSW
- `redux-test-utils.tsx`: Utilities for testing with Redux
- `test-fixtures.ts`: Common test data fixtures

### Mock Service Worker (MSW)

MSW is used to intercept and mock API requests during tests and development:

- `src/mocks/handlers.ts`: API endpoint request handlers
- `src/mocks/server.ts`: MSW setup for tests
- `src/mocks/browser.ts`: MSW setup for browser (development)

### Running Tests

To run all tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm run coverage
```

To run a specific test file:

```bash
npm test -- path/to/test-file.test.tsx
```

### Writing Tests

When writing tests, you can use the following utilities:

1. Basic component testing:
```tsx
import { render, screen } from '../test-utils/testing-library-utils';
import YourComponent from './YourComponent';

test('renders correctly', () => {
  render(<YourComponent />);
  expect(screen.getByText('Some text')).toBeInTheDocument();
});
```

2. Testing with Redux:
```tsx
import { renderWithRedux } from '../test-utils/redux-test-utils';
import YourReduxComponent from './YourReduxComponent';

test('renders with redux state', () => {
  renderWithRedux(<YourReduxComponent />, {
    preloadedState: {
      // Your initial state here
    }
  });
});
```

3. Testing authenticated components:
```tsx
import { renderAuthenticated } from '../test-utils/redux-test-utils';
import AuthenticatedComponent from './AuthenticatedComponent';

test('renders for authenticated users', () => {
  renderAuthenticated(<AuthenticatedComponent />);
});
```

4. Testing API interactions:
```tsx
import { mockApiSuccess, mockApiError } from '../test-utils/api-test-utils';

test('handles API success', async () => {
  mockApiSuccess.user();
  // Test component that fetches user data
});

test('handles API error', async () => {
  mockApiError.network('/api/some-endpoint');
  // Test error handling
});
``` 