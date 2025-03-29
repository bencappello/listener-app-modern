# Testing Standards

This document outlines the testing standards for the Listener App project. We follow Test-Driven Development (TDD) principles, writing tests before implementing features.

## Testing Principles

1. **Test-First Development**: Write tests before implementing features
2. **Comprehensive Coverage**: Aim for >90% test coverage
3. **Test Pyramid**: Follow the testing pyramid with more unit tests than integration or end-to-end tests
4. **Isolation**: Tests should be independent and not rely on the state from other tests
5. **Readability**: Tests should be clear and serve as documentation for the codebase

## Backend Testing (Python)

### Test Framework
- Use pytest for all backend tests
- Organize tests to mirror the application structure
- Use fixtures for reusable test components

### Test Types
1. **Unit Tests**: Test individual functions and methods in isolation
2. **Integration Tests**: Test interactions between components
3. **API Tests**: Test API endpoints using TestClient
4. **Database Tests**: Test database models and queries with test database

### Example Test Structure
```python
# For a function in app/utils/formatters.py
# Create test in tests/utils/test_formatters.py

import pytest
from app.utils.formatters import format_duration

def test_format_duration_seconds():
    # Given
    duration_ms = 45000
    
    # When
    formatted = format_duration(duration_ms)
    
    # Then
    assert formatted == "0:45"
```

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/utils/test_formatters.py

# Run tests matching pattern
pytest -k "format"
```

## Frontend Testing (TypeScript/React)

### Test Framework
- Use Jest and React Testing Library
- Organize tests alongside components using `.test.tsx` suffix
- Use Mock Service Worker (MSW) for API mocking

### Test Types
1. **Component Tests**: Test individual React components
2. **Hook Tests**: Test custom React hooks
3. **Integration Tests**: Test interactions between components
4. **End-to-End Tests**: Test complete user flows using Cypress

### Example Test Structure
```tsx
// For a component in src/components/SongCard.tsx
// Create test in src/components/SongCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { SongCard } from './SongCard';

describe('SongCard', () => {
  const mockSong = {
    id: '1',
    title: 'Test Song',
    artist: 'Test Artist',
    duration: 180000
  };
  
  it('renders song title and artist', () => {
    // Given
    render(<SongCard song={mockSong} />);
    
    // Then
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });
  
  it('triggers play function when play button clicked', () => {
    // Given
    const mockPlay = jest.fn();
    render(<SongCard song={mockSong} onPlay={mockPlay} />);
    
    // When
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // Then
    expect(mockPlay).toHaveBeenCalledWith(mockSong.id);
  });
});
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/components/SongCard.test.tsx

# Run tests matching pattern
npm test -- -t "SongCard"
```

## Continuous Integration

- All tests run on every pull request
- PRs cannot be merged if tests fail
- Code coverage reports are generated for each build
- Performance benchmarks track changes over time

## Test Data

- Use factories for generating test data
- Avoid hardcoded test data when possible
- Use meaningful names for test data
- Reset database state between test runs
- Use seed data for consistent testing

## Mocking

- Mock external services like AWS S3, Redis
- Use dependency injection to facilitate mocking
- Specify explicitly what is being mocked and why
- Avoid over-mocking - test the real implementation when possible 