# Listener App - Modernization Project

## Project Overview
This project aims to create a modernized version of the Listener app, porting all functionality from the legacy application to a new tech stack. The Listener app is a music blog aggregator that helps users discover new music by collecting and organizing content from music blogs.

### Repository Structure
- **old-app/**: Contains all the original Listener app code (legacy codebase)
- **new-listener-app/**: The target directory for the modernized application

### Git Workflow
- A Git repository has been initialized in the `new-listener-app/` directory
- After completing each step in this guide, changes should be committed with descriptive messages
- All commits should be pushed to GitHub at https://github.com/bencappello
- Regular commits will help track progress and maintain version history

### Modernization Approach
This build guide follows Test-Driven Development (TDD) principles, with tests written before implementation to ensure code quality and reliability. The guide includes testable milestones that can be verified by an AI agent to track progress.

# Listener App - Build Guide (Test-Driven Development Approach)

This document provides a step-by-step guide for building the Listener app from start to finish following Test-Driven Development (TDD) principles. Each feature is first defined by tests before implementation. The guide includes testable milestones that can be verified by an AI agent to track progress.

## Phase 1: Project Setup & Foundation

### Step 1: Project Initialization
1. Create GitHub repository
2. Set up project directory structure
3. Initialize backend and frontend projects
4. Create initial documentation, including testing standards

### Step 2: Development Environment
1. Create Docker configuration
2. Set up Docker Compose for local development
3. Configure environment variables
4. Create development, testing, and production environment profiles
5. Set up test runners for both backend (pytest) and frontend (Jest)

### Step 3: Test Infrastructure Setup
1. Configure pytest for backend testing
2. Set up Jest and React Testing Library for frontend
3. Create test database configuration
4. Implement test fixtures and utilities
5. Set up code coverage reporting

### Step 4: Database Setup
1. Design initial database schema
2. **Write tests for base model behaviors**
3. Configure PostgreSQL
4. Set up Alembic for migrations 
5. Implement base model classes to pass tests

### Step 5: Backend Framework
1. **Write tests for application setup and configuration**
2. Set up FastAPI application structure
3. Configure CORS middleware
4. Set up dependency injection system
5. Implement database connection management with test coverage

### Step 6: CI/CD Pipeline
1. Configure GitHub Actions workflow with test automation
2. Set up automated testing for every pull request
3. Configure linting and code quality checks
4. Create staging and production deployment pipelines with test gates

### 🔍 MILESTONE 1: Foundation Ready
**Verification Criteria:**
- Repository structure follows the project plan
- Docker environment starts successfully with `docker-compose up`
- Database migrations run successfully with Alembic
- FastAPI server starts and responds to health check endpoint
- CI pipeline successfully runs tests on pull requests
- Test coverage report shows >80% coverage for existing code
- All base model tests pass

**Verification Commands:**
```
# Check repository structure
find . -type d -not -path "*/\.*" | sort

# Test Docker environment
docker-compose up -d
curl http://localhost:8000/health

# Check migrations
cd backend && alembic current

# Run backend tests with coverage
cd backend && pytest --cov=app tests/

# Check CI pipeline status
gh run list -L 5
```

## Phase 2: Core Backend Development

### Step 7: User Authentication (TDD)
1. **Write tests for user registration, login, and validation**
2. Implement user model to pass tests
3. **Write tests for authentication endpoints**
4. Create authentication endpoints (register, login, logout)
5. **Write tests for JWT functionality**
6. Implement JWT token generation and validation
7. Set up password hashing and security features with test coverage

### Step 8: Core Models (TDD)
1. **Write tests for Band model and endpoints**
2. Implement Band model and endpoints to pass tests
3. **Write tests for Blog model and endpoints**
4. Implement Blog model and endpoints to pass tests
5. **Write tests for Song model and endpoints**
6. Implement Song model and endpoints to pass tests
7. **Write tests for Tag and Comment models**
8. Implement remaining models with test coverage

### Step 9: Relationship Models (TDD)
1. **Write tests for UserSong relationships**
2. Implement UserSong (favorites) relationships to pass tests
3. **Write tests for UserBlog relationships**
4. Implement UserBlog (followed blogs) relationships to pass tests
5. **Write tests for UserFollow relationships**
6. Implement UserFollow (followed users) relationships to pass tests
7. **Write tests for Tag relationships**
8. Implement Tag relationships with test coverage

### 🔍 MILESTONE 2: Core Models Complete
**Verification Criteria:**
- All model tests pass with >90% coverage
- Database schema matches design specifications
- API endpoints for all core models are functional
- Authentication flow works end-to-end with JWT
- Relationship models correctly link related entities
- Database migrations are up-to-date

**Verification Commands:**
```
# Run model tests
cd backend && pytest tests/models/ -v

# Check database schema
cd backend && alembic current

# Test authentication endpoints
curl -X POST http://localhost:8000/api/auth/register -d '{"username":"testuser","email":"test@example.com","password":"securepassword"}' -H "Content-Type: application/json"
curl -X POST http://localhost:8000/api/auth/login -d '{"username":"testuser","password":"securepassword"}' -H "Content-Type: application/json"

# Verify relationship endpoints
curl http://localhost:8000/api/users/1/favorites -H "Authorization: Bearer $TOKEN"
```

### Step 10: Advanced API Features (TDD)
1. **Write tests for search functionality**
2. Implement search functionality to pass tests
3. **Write tests for song popularity endpoints**
4. Create song popularity endpoints to pass tests
5. **Write tests for feed generation**
6. Implement user feed generation to pass tests
7. **Write tests for pagination and filtering**
8. Implement pagination and filtering features with test coverage

### Step 11: Media Storage (TDD)
1. **Write tests for file upload and retrieval**
2. Configure AWS S3 integration with mocks for testing
3. **Write tests for presigned URL generation**
4. Implement file upload endpoints to pass tests
5. **Write tests for media validation**
6. Implement media file validation with test coverage

### 🔍 MILESTONE 3: Backend API Complete
**Verification Criteria:**
- All API endpoints return correct responses
- Search functionality works with various query parameters
- Pagination correctly limits and offsets results
- Media files can be uploaded and retrieved
- API documentation (Swagger) is complete and accurate
- All backend tests pass with >90% coverage

**Verification Commands:**
```
# Test search functionality
curl "http://localhost:8000/api/songs/search?q=test&page=1&limit=10" -H "Authorization: Bearer $TOKEN"

# Test file upload
curl -X POST http://localhost:8000/api/songs/upload -F "file=@test.mp3" -H "Authorization: Bearer $TOKEN"

# Test feed generation
curl http://localhost:8000/api/users/1/feed -H "Authorization: Bearer $TOKEN"

# Run all backend tests
cd backend && pytest
```

## Phase 3: Frontend Foundation

### Step 12: Frontend Project Setup
1. Initialize React with TypeScript
2. Configure build system
3. Set up routing with React Router
4. Create directory structure for components, pages, hooks, and tests
5. Set up frontend testing environment (Jest, React Testing Library)

### Step 13: State Management (TDD)
1. **Write tests for Redux store configuration**
2. Configure Redux Toolkit store to pass tests
3. **Write tests for API integration hooks**
4. Set up React Query for API integration to pass tests
5. **Write tests for context providers**
6. Create context providers and API client utilities with test coverage

### Step 14: Authentication Components (TDD)
1. **Write tests for LoginForm component**
2. Create LoginForm component to pass tests
3. **Write tests for RegisterForm component**
4. Implement RegisterForm component to pass tests
5. **Write tests for authentication flow**
6. Build user profile components and authentication flow with test coverage

### Step 15: Layout & Navigation (TDD)
1. **Write tests for MainLayout component**
2. Create MainLayout component to pass tests
3. **Write tests for Navbar component**
4. Build Navbar component to pass tests
5. **Write tests for Footer and Sidebar**
6. Implement remaining layout components
7. **Write tests for protected routes**
8. Implement protected routes with test coverage

### 🔍 MILESTONE 4: Frontend Foundation Ready
**Verification Criteria:**
- Frontend application builds without errors
- Redux store is properly configured with slices
- API client connects to backend endpoints
- User can register and login through the UI
- Protected routes correctly redirect unauthorized users
- Layout components render correctly in various screen sizes
- All frontend tests pass with >85% coverage

**Verification Commands:**
```
# Build the frontend
cd frontend && npm run build

# Run frontend tests
cd frontend && npm test

# Run component-specific tests
cd frontend && npm test -- --testPathPattern=components/authentication

# Check coverage
cd frontend && npm test -- --coverage
```

## Phase 4: Core Frontend Features

### Step 16: Song Components (TDD)
1. **Write tests for SongCard component**
2. Build SongCard component to pass tests
3. **Write tests for SongList component**
4. Create SongList component to pass tests
5. **Write tests for SongDetail page**
6. Implement SongDetail page to pass tests
7. **Write tests for song search interface**
8. Create song search interface with test coverage

### Step 17: User Components (TDD)
1. **Write tests for UserProfile page**
2. Build UserProfile page to pass tests
3. **Write tests for UserFeed page**
4. Create UserFeed page to pass tests
5. **Write tests for FollowButton component**
6. Implement FollowButton component to pass tests
7. **Write tests for FavoriteButton component**
8. Create FavoriteButton component with test coverage

### Step 18: Blog Components (TDD)
1. **Write tests for BlogList component**
2. Build BlogList component to pass tests
3. **Write tests for BlogDetail page**
4. Create BlogDetail page to pass tests
5. **Write tests for BlogForm component**
6. Implement BlogForm for creation/editing to pass tests
7. **Write tests for blog following functionality**
8. Add blog following functionality with test coverage

### Step 19: Common Components (TDD)
1. **Write tests for comment components**
2. Create CommentList and CommentForm components to pass tests
3. **Write tests for TagList component**
4. Build TagList component to pass tests
5. **Write tests for pagination and search components**
6. Implement Pagination and SearchBar components to pass tests
7. **Write tests for Modal component**
8. Build Modal component and system with test coverage

### 🔍 MILESTONE 5: Core UI Components Complete
**Verification Criteria:**
- All core components render correctly
- Components handle empty, loading, and error states
- Interactive components (buttons, forms) respond to user actions
- Responsive design works on mobile, tablet, and desktop
- Components maintain style guide consistency
- All component tests pass with >90% coverage

**Verification Commands:**
```
# Test component rendering
cd frontend && npm test -- --testPathPattern=components

# Run Storybook to visually verify components (if configured)
cd frontend && npm run storybook

# Check responsive design with Cypress viewport testing
cd frontend && npx cypress run --spec "cypress/e2e/responsive.cy.js"
```

### Step 20: Audio Player (TDD)
1. **Write tests for player context and hooks**
2. Integrate Howler.js and create PlayerContext to pass tests
3. **Write tests for player control components**
4. Build player controls UI to pass tests
5. **Write tests for queue management**
6. Implement queue management to pass tests
7. **Write tests for player persistence**
8. Add player persistence with test coverage

### 🔍 MILESTONE 6: Frontend Features Complete
**Verification Criteria:**
- Audio player successfully plays tracks
- Player controls work (play, pause, skip, volume)
- Queue management functions correctly
- Player state persists across page navigation
- User can interact with all core features (browse, search, favorite, follow)
- All frontend integration tests pass

**Verification Commands:**
```
# Run integration tests
cd frontend && npm test -- --testPathPattern=integration

# Test audio player functionality
cd frontend && npm test -- --testPathPattern=components/player

# E2E test for core user journeys
cd frontend && npx cypress run --spec "cypress/e2e/user-journey.cy.js"
```

## Phase 5: Blog Scraper Service

### Step 21: Scraper Setup (TDD)
1. **Write tests for scraper service configuration**
2. Create Python scraper service to pass tests
3. **Write tests for Celery task management**
4. Configure Celery for task management to pass tests
5. **Write tests for scheduler functionality**
6. Set up Redis connection and scheduling with test coverage

### Step 22: Scraper Implementation (TDD)
1. **Write tests for blog content fetching**
2. Build blog content fetching to pass tests
3. **Write tests for HTML parsing**
4. Implement HTML parsing with BeautifulSoup to pass tests
5. **Write tests for song extraction algorithms**
6. Create song extraction algorithms to pass tests
7. **Write tests for audio link validation**
8. Implement audio link validation with test coverage

### Step 23: Content Processing (TDD)
1. **Write tests for deduplication logic**
2. Create deduplication logic to pass tests
3. **Write tests for band/artist recognition**
4. Implement band/artist recognition to pass tests
5. **Write tests for image extraction**
6. Add image extraction for thumbnails to pass tests
7. **Write tests for tag detection and notifications**
8. Build tag detection and notification systems with test coverage

### 🔍 MILESTONE 7: Scraper Service Operational
**Verification Criteria:**
- Scraper can fetch content from test blog sources
- Content extraction correctly identifies songs and metadata
- Deduplication prevents duplicate entries
- Scheduled tasks run at appropriate intervals
- Extracted content is properly saved to the database
- Scraper handles error cases gracefully
- All scraper tests pass with >85% coverage

**Verification Commands:**
```
# Run scraper tests
cd scraper && pytest

# Test scraper with a mock blog
cd scraper && python -m app.tasks.test_scrape

# Check Celery task status
cd scraper && celery -A app.tasks status

# Verify extracted content in database
cd backend && python -c "from app.db.session import SessionLocal; from app.models import Song; db = SessionLocal(); print(db.query(Song).filter(Song.source=='scraper').count())"
```

## Phase 6: Integration & Performance

### Step 24: API Integration
1. **Write integration tests for frontend-backend communication**
2. Connect frontend components to backend API to pass tests
3. **Write tests for error handling scenarios**
4. Implement comprehensive error handling to pass tests
5. **Write tests for loading states**
6. Add loading states and indicators to pass tests
7. **Write tests for offline functionality**
8. Create offline functionality with test coverage

### Step 25: End-to-End Testing
1. Set up end-to-end testing framework (Cypress or Playwright)
2. **Write end-to-end tests for critical user flows**
3. Implement fixes for any issues discovered in E2E tests
4. **Write tests for multi-browser compatibility**
5. Ensure cross-browser compatibility with automated tests

### Step 26: Performance Optimization
1. **Write performance tests and benchmarks**
2. Implement Redis caching based on performance tests
3. Optimize database queries based on query performance tests
4. Add frontend lazy loading and code splitting
5. Optimize asset loading with measured performance improvements

### 🔍 MILESTONE 8: Integration Complete
**Verification Criteria:**
- End-to-end flows work correctly (user registration to content consumption)
- Error handling covers edge cases and network issues
- Loading states provide feedback during asynchronous operations
- Performance metrics meet targets (page load <3s, TTI <1.5s)
- Application functions across Chrome, Firefox, Safari, Edge
- End-to-end tests pass in CI pipeline
- Lighthouse scores >90 for performance, accessibility, best practices

**Verification Commands:**
```
# Run end-to-end tests
cd frontend && npx cypress run

# Measure performance with Lighthouse
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json

# Test cross-browser compatibility
cd frontend && npx playwright test

# Verify Redis caching
redis-cli --scan --pattern "listener:cache:*" | wc -l
```

## Phase 7: Deployment & Infrastructure

### Step 27: AWS Infrastructure Setup
1. **Write infrastructure as code tests (using Terraform or CloudFormation)**
2. Configure S3 buckets using IaC
3. Set up RDS for PostgreSQL
4. Configure ElastiCache for Redis
5. Set up CloudFront and Route 53

### Step 28: Backend Deployment
1. **Write tests for Docker container functionality**
2. Create production Docker images to pass tests
3. **Write smoke tests for deployed backend**
4. Configure Elastic Beanstalk with automated tests
5. Set up database connections, logging, and monitoring

### Step 29: Frontend Deployment
1. **Write build verification tests**
2. Create production build to pass tests
3. **Write smoke tests for deployed frontend**
4. Deploy to Vercel or similar platform with automated verification
5. Set up CDN caching and verify with performance tests

### Step 30: Monitoring & Logging
1. **Write tests for metrics collection**
2. Implement Prometheus metrics to pass tests
3. Create Grafana dashboards
4. **Write tests for log aggregation**
5. Set up ELK Stack with verified collection
6. Configure alert notifications with test scenarios

### 🔍 MILESTONE 9: Deployment Ready
**Verification Criteria:**
- Infrastructure as code provisions resources correctly
- Backend services deploy successfully to staging environment
- Frontend deploys successfully to CDN
- Monitoring captures key metrics (response time, error rates)
- Logs are centralized and searchable
- Alerts trigger on predefined thresholds
- Smoke tests pass in staging environment

**Verification Commands:**
```
# Verify infrastructure deployment
terraform validate && terraform plan

# Test backend deployment
curl https://api-staging.listenerapp.com/health

# Verify frontend deployment
curl -I https://staging.listenerapp.com

# Check monitoring
curl -s https://api-staging.listenerapp.com/metrics | grep http_requests_total

# Test logging
curl -s https://api-staging.listenerapp.com/log-test
# Then check ELK for the log entry
```

## Phase 8: Data Migration & Launch

### Step 31: Data Migration (TDD)
1. **Write tests for data export accuracy**
2. Create export scripts for legacy data to pass tests
3. **Write tests for data transformation**
4. Build data transformation utilities to pass tests
5. **Write tests for import accuracy**
6. Implement import scripts with validated integrity
7. **Write tests for user account migration**
8. Migrate user accounts with verification

### Step 32: Pre-Launch Testing
1. Conduct comprehensive User Acceptance Testing
2. Perform security audits and penetration testing
3. Run full regression test suite across all features
4. Verify mobile responsiveness with automated tests
5. Conduct load testing with performance baselines

### Step 33: Launch Preparation
1. Create launch checklist with test verification steps
2. Prepare documentation including test scenarios
3. Set up support channels
4. Create user guides
5. Run final full test suite before launch

### Step 34: Launch & Transition
1. Deploy production version with smoke tests
2. Set up parallel running with legacy system
3. Implement redirection with verification tests
4. Monitor system performance against baselines
5. Address post-launch issues with regression tests

### 🔍 MILESTONE 10: Production Launch
**Verification Criteria:**
- Data migration is complete with verified integrity
- Security audits show no critical vulnerabilities
- Load testing demonstrates capacity for 10x expected traffic
- Production environment passes all smoke tests
- Documentation is complete and accessible
- Support channels are operational
- Monitoring shows normal operation post-launch

**Verification Commands:**
```
# Verify data migration integrity
cd backend && python -m scripts.verify_migration

# Run security scan
npm run security-scan

# Execute load test
k6 run load-tests/scenarios.js

# Production smoke test
curl https://api.listenerapp.com/health
curl -I https://listenerapp.com

# Verify monitoring dashboards
open https://grafana.listenerapp.com/d/listener-production
```

## Phase 9: Post-Launch Support

### Step 35: Maintenance Setup
1. Establish regular update schedule with test requirements
2. Create dependency update process with automated testing
3. Implement security patch workflow with regression testing
4. Set up backup and recovery testing schedule
5. Create performance review process with benchmarks

### Step 36: Support Procedures
1. Set up issue tracking system with reproduction test requirements
2. Create bug fix prioritization process
3. Implement feature request workflow with test criteria
4. Establish emergency response protocol with test plans
5. Create user feedback collection and analysis system

### 🔍 MILESTONE 11: Operational Stability
**Verification Criteria:**
- Maintenance procedures are documented and tested
- Automated backup/restore process works correctly
- Regular security scans are in place
- Support workflow handles reported issues efficiently
- User feedback mechanism captures and categorizes input
- System maintains >99.9% uptime over 30 days

**Verification Commands:**
```
# Test backup and restore
cd backend && python -m scripts.test_backup_restore

# Check support ticket metrics
curl -s https://support.listenerapp.com/api/metrics | jq '.average_resolution_time'

# Verify uptime monitoring
curl -s https://status.listenerapp.com/api/uptime | jq '.last_30_days'

# Run security scan
npm run security-scan
```

## Phase 10: Future Development

### Step 37: Feature Expansion Planning
1. Prioritize potential enhancements with test considerations
2. Create roadmap for mobile application with TDD approach
3. Plan machine learning integration with testable outcomes
4. Design enhanced social features with test scenarios
5. Outline analytics capabilities with verification methods

### Step 38: Scaling Strategy
1. Plan for database sharding with performance tests
2. Design multi-region deployment with latency tests
3. Prepare microservices evolution with integration test strategy
4. Create CDN optimization strategy with performance benchmarks
5. Design caching improvements with measurable outcomes

### 🔍 MILESTONE 12: Future Ready
**Verification Criteria:**
- Feature roadmap includes test criteria for each item
- Development priorities are based on user feedback data
- Scaling strategy is documented with specific metrics
- Performance benchmarks establish baselines for improvements
- Internationalization/localization readiness is verified
- Mobile strategy has defined testing requirements

**Verification Commands:**
```
# Verify roadmap documentation
ls -la docs/roadmap/

# Check feature prioritization data
cat docs/analytics/feature_requests_summary.json

# Test internationalization readiness
cd frontend && npm run test:i18n

# Mobile compatibility test
npx lighthouse http://listenerapp.com --output=json --output-path=./mobile-report.json --emulated-form-factor=mobile
```

Each phase and step incorporates Test-Driven Development principles, writing tests before implementation to ensure code quality, reliability, and adherence to requirements throughout the development process. The milestones provide clear verification points that can be assessed by an AI agent to track progress and validate the quality of the implementation. 