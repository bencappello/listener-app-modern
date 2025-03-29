# API Testing Guide

This directory contains tests for the API endpoints in the application.

## Favorites API Testing Strategy

The favorites API testing is implemented using a combination of approaches:

### Main Test Files

- **`test_favorites.py`**: The primary test file for favorites functionality, containing:
  - `test_favorites_comprehensive`: A comprehensive test that creates its own user and test client
  - `test_favorites_fixture_based`: A simpler test that uses the fixtures provided by conftest.py

- **`test_favorites_async.py`**: Reference implementation for handling async functionality using a hybrid approach
  - Contains notes and examples for dealing with SQLAlchemy async testing challenges

- **`test_favorites_sync.py`**: Simple test for the synchronous endpoints

### Testing Approach

The testing strategy focuses on reliable, repeatable tests that verify the following:

1. Adding songs to favorites
2. Retrieving favorites
3. Checking favorite status
4. Removing favorites

Tests use synchronous endpoints (`/api/v1/users/me/favorites/sync/...`) to avoid SQLAlchemy greenlet issues that can occur with async endpoints.

### Special Considerations

#### Async Testing Challenges

When testing async SQLAlchemy code, the following issues must be considered:

1. **Greenlet Spawn**: SQLAlchemy's async operations require proper greenlet setup
   - The error "greenlet_spawn has not been called" indicates this issue
   - Our `conftest.py` includes a patch for `greenlet_spawn`

2. **Dependency Overrides**: Tests need to properly override FastAPI dependencies
   - For async tests, override both sync and async dependencies
   - For sync tests, override only sync dependencies

3. **Test Client**: Use the appropriate client
   - `TestClient` for sync endpoints
   - `AsyncClient` with `ASGITransport` for async endpoints

#### Recommended Approach

For simplicity and reliability, we recommend:

1. Testing using synchronous endpoints when possible
2. Creating dedicated users and test data within tests
3. Direct database verification alongside API testing
4. Proper cleanup even in case of test failures

## Running Tests

To run all API tests:
```bash
python -m pytest tests/api/v1
```

To run specific favorites tests:
```bash
python -m pytest tests/api/v1/test_favorites.py
```

## Current Test Issues

After investigating the test failures, we've identified several issues:

1. **Authentication Issues**: 
   - The original favorites tests in `test_favorites.py` are failing with a 401 Unauthorized error because the tests try to access async endpoints with synchronous test functions.
   - The auth headers are being created but not properly passed or recognized for certain endpoints.

2. **Async Test Issues**:
   - The async favorites tests in `test_favorites_async.py` are failing with `sqlalchemy.exc.MissingGreenlet` errors, indicating issues with how SQLAlchemy async operations are being used.
   - The error message "greenlet_spawn has not been called; can't call await_only() here" suggests that the FastAPI test client doesn't properly set up the SQLAlchemy async environment.

3. **DELETE Request Issues**:
   - There are issues with the DELETE endpoints in both sync and async tests, related to response handling.

## Working Solutions

1. For synchronous tests, use the sync endpoints:
   - Instead of using `/api/v1/users/me/favorites`, use `/api/v1/users/me/favorites/sync`.
   - The `client` fixture in `conftest.py` already sets up authentication overrides correctly for these endpoints.
   - See `test_favorites_sync.py` and `test_favorites_final.py` for working examples.

2. For any endpoint handling:
   - Always use direct DB operations for cleanup rather than API calls where possible to avoid HTTP response handling issues.
   - SQLAlchemy ORM operations are more reliable for test setup and cleanup than API calls.

## Fixing All Tests

To fix all the failing tests, follow these guidelines:

1. **Sync Tests**: 
   - Update all sync test functions to use the `/sync` endpoints.
   - Use the client fixture without explicit auth_headers (they're already set up).
   - See `test_favorites_final.py` for a working example.

2. **Async Tests**:
   - Async tests require additional configuration to fix the greenlet issue.
   - Async database setup in tests requires SQLAlchemy event loop configuration.
   - Consider using synchronous tests with sync endpoints for tests where possible.

3. **For DELETE operations**:
   - Use direct ORM operations for cleanup to avoid HTTP response handling issues.
   - If you must test DELETE endpoints, handle response errors appropriately.

4. **General Test Design**:
   - Keep test functions focused on testing a single aspect of functionality.
   - Clean up after tests in the `finally` block to ensure state doesn't leak between tests.
   - Use separate database sessions for each test function.

## Future Improvements

1. Update the `conftest.py` file to properly handle async tests with SQLAlchemy.
2. Replace async tests with sync tests where possible for simplicity.
3. Fix the underlying authentication and dependency injection issues in the app.
4. Use the working test pattern demonstrated in `test_favorites_sync.py` for all new tests. 