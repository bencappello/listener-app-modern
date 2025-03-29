# Listener App

A modern music blog aggregator that helps users discover new music by collecting and organizing content from music blogs. Users can play songs, search for music, follow blogs and other users, and maintain a personalized feed of new music.

## Technology Stack

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL
- Alembic for migrations
- JWT for authentication
- Redis for caching

### Frontend
- React with TypeScript
- Redux Toolkit for state management
- React Query for data fetching
- Chakra UI / Tailwind CSS for styling
- Howler.js for audio playback

### Infrastructure
- Docker for containerization
- AWS S3 for file storage
- Github Actions for CI/CD

## Project Structure

```
listener-app/
├── .github/                 # GitHub Actions workflows
├── docker/                  # Docker configuration
├── docs/                    # Documentation
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Core functionality
│   │   ├── db/              # Database models and migrations
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── tests/               # Backend tests
│   ├── alembic/             # Database migrations
│   └── main.py              # Entry point
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service integrations
│   │   ├── store/           # Redux store
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── tests/               # Frontend tests
└── scraper/                 # Blog scraping service
    ├── app/                 # Scraper application
    └── tests/               # Scraper tests
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Python 3.11+
- Node.js 18+

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/listener-app.git
   cd listener-app
   ```

2. Set up environment variables
   ```
   cp .env.example .env
   ```

3. Start the development environment
   ```
   docker-compose up -d
   ```

4. Access the applications:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

This project follows Test-Driven Development (TDD) principles. Before implementing features, write tests to define the expected behavior.

### Running Tests
```
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Deployment Automation

The Listener App includes comprehensive deployment automation scripts to simplify the deployment process for both development and production environments. These scripts are located in the `scripts/deployment` directory.

### Available Scripts

- **Main entry point**: `scripts/deployment/run.sh`
  - Provides access to all deployment operations through a unified interface
  - Use `./scripts/deployment/run.sh help` to see all available commands

- **Environment Setup**: `setup-environment.sh`
  - Sets up environment configuration for deployment
  - Creates environment files and configures Kubernetes resources

- **Deployment**: `deploy-dev.sh` and `deploy-prod.sh`
  - Deploys the application to development or production environments
  - Handles configmaps, secrets, and applies all necessary Kubernetes manifests

- **Status Checking**: `check-status.sh`
  - Monitors the status of deployments, pods, and services
  - Performs health checks on deployed applications

- **Scaling**: `scale.sh`
  - Scales application components (backend, frontend, scraper)
  - Adjusts the number of replicas based on load requirements

- **Rollback**: `rollback.sh`
  - Rolls back deployments to previous versions if needed
  - Supports rolling back to specific revisions

- **Secret Management**: `manage-secrets.sh`
  - Lists, retrieves, sets, and deletes Kubernetes secrets
  - Safely manages sensitive information for both environments

### Quickstart

1. **Set up the environment**:
   ```bash
   ./scripts/deployment/run.sh setup -e dev
   ```

2. **Deploy the application**:
   ```bash
   ./scripts/deployment/run.sh deploy -e dev
   ```

3. **Check deployment status**:
   ```bash
   ./scripts/deployment/run.sh status -e dev
   ```

4. **Scale a component**:
   ```bash
   ./scripts/deployment/run.sh scale -e dev -c backend -r 3
   ```

5. **Roll back if needed**:
   ```bash
   ./scripts/deployment/run.sh rollback -e dev -c backend
   ```

For more detailed documentation on Kubernetes deployment, see the [k8s/README.md](k8s/README.md) file.

## License
All rights reserved.
