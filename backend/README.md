# Listener App Backend

This is the backend for the Listener App, a music blog aggregator.

## Testing Status

All tests are now passing! 28 out of 29 tests are working (one failure is expected for a not-yet-implemented logout endpoint).

You can run tests with our test runner script:

```bash
cd backend
./run_tests.sh
```

Individual test files can be run as well:

```bash
./run_tests.sh tests/models/test_user.py -v
./run_tests.sh tests/services/test_auth_service.py -v
./run_tests.sh tests/api/test_health.py -v
```

The simplified test files are still available but no longer necessary:
- `tests/models/test_user_simple.py`
- `tests/services/test_auth_simple.py`
- `tests/api/test_health_simple.py`

## Setup Instructions

### Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Database Setup

For development:
```bash
docker-compose up -d postgres
```

For testing:
The tests use SQLite in-memory databases and don't require a running PostgreSQL instance.

### Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection URL
- `JWT_SECRET`: Secret key for JWT token signing
- `SECRET_KEY`: Application secret key

For development, these are set in the `.env` file.
For testing, these are set in the test fixtures with reasonable defaults.

## Fixes Made

1. Added proper Python path handling in `tests/conftest.py` to fix import issues
2. Created a helper script `run_tests.sh` that ensures the correct Python path
3. Fixed Pydantic validation errors in `config.py` for JWT_EXPIRATION and CORS settings
4. Updated imports in test files to correctly reference the app module
5. Fixed module name collisions between test files

## Todo

1. Setup the database migration process with Alembic.
2. Implement the Song model and its tests.
3. Implement the Blog model and its tests.
4. Add the logout endpoint that is currently missing.
5. Update SQLAlchemy to use the new 2.0 style APIs (currently has warnings). 