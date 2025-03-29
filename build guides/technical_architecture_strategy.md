# Listener App - Technical Architecture Strategy

## 1. Overview

This document outlines the technical architecture strategy for modernizing the Listener app, transitioning from the legacy Ruby on Rails and Backbone.js stack to a modern Python backend and React frontend. The architecture is designed to be scalable, maintainable, and to support all features described in the modernization blueprint.

## 2. Technology Stack

### 2.1 Backend

| Component | Technology | Justification |
|-----------|------------|---------------|
| Framework | FastAPI | High performance, modern Python framework with built-in async support, automatic OpenAPI documentation, and type validation |
| Database ORM | SQLAlchemy | Mature, feature-rich ORM with excellent support for complex queries and relationship management |
| Database Migrations | Alembic | Works seamlessly with SQLAlchemy for versioned database schema changes |
| Authentication | JWT + PassLib | Industry-standard token-based authentication with secure password hashing |
| API Validation | Pydantic | Type validation, data conversion, and schema definition built into FastAPI |
| Testing | pytest | Comprehensive testing framework with support for async testing |
| Task Queue | Celery | Robust solution for background processing tasks like blog scraping |
| Rate Limiting | uvicorn-limiter | Protect API endpoints from abuse |

### 2.2 Frontend

| Component | Technology | Justification |
|-----------|------------|---------------|
| Framework | React 18+ | Modern UI library with excellent ecosystem and community support |
| Type System | TypeScript | Static typing for improved code quality and developer experience |
| State Management | Redux Toolkit | Simplified Redux with less boilerplate and better TypeScript integration |
| API Data Fetching | React Query | Caching, auto-refetching, and mutation handling with minimal code |
| Routing | React Router | De facto standard for client-side routing in React applications |
| Component Styling | Tailwind CSS | Utility-first CSS framework for rapid UI development |
| UI Component Library | Chakra UI | Accessible, composable component library with Tailwind-like styling |
| Form Handling | React Hook Form | Performance-focused form library with validation integration |
| Audio Player | Howler.js | Cross-browser audio library with streaming support |
| Testing | Jest + React Testing Library | Component and integration testing focusing on user interactions |

### 2.3 Database

| Component | Technology | Justification |
|-----------|------------|---------------|
| Primary Database | PostgreSQL 14+ | Robust relational database with advanced features like full-text search |
| Caching Layer | Redis | In-memory data store for caching and session management |
| Database Hosting | AWS RDS or DigitalOcean Managed Databases | Managed solution with automated backups and scaling |

### 2.4 Infrastructure

| Component | Technology | Justification |
|-----------|------------|---------------|
| Containerization | Docker | Consistent environments across development and production |
| Container Orchestration | Docker Compose (dev), AWS ECS (prod) | Simple orchestration for development, managed solution for production |
| CI/CD | GitHub Actions | Modern CI/CD directly integrated with GitHub repositories |
| Hosting | AWS or DigitalOcean | Scalable cloud services with a range of managed components |
| CDN | Cloudflare | Global content delivery with DDoS protection |
| File Storage | AWS S3 | Scalable object storage for images and audio files |
| Media Processing | AWS Lambda + S3 Events | Serverless image and audio processing on upload |
| Monitoring | Prometheus + Grafana | Industry-standard monitoring and visualization |
| Logging | ELK Stack (Elasticsearch, Logstash, Kibana) | Comprehensive log collection, analysis, and visualization |

## 3. System Architecture

### 3.1 High-Level Architecture Diagram

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  Client        │     │  API Gateway   │     │  Auth Service  │
│  (React App)   │────▶│  (AWS/Nginx)   │────▶│  (FastAPI)     │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
                                │
                                │
                                ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  File Storage  │◀───▶│  Core APIs     │◀───▶│  Database      │
│  (AWS S3)      │     │  (FastAPI)     │     │  (PostgreSQL)  │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
                                │
                                │
                                ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  Cache         │◀───▶│  Task Queue    │◀───▶│  Blog Scraper  │
│  (Redis)       │     │  (Celery)      │     │  (Python)      │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
```

### 3.2 Component Breakdown

1. **Client Application**: Single-page React application served from CDN
2. **API Gateway**: Route traffic, handle SSL, and basic rate limiting
3. **Auth Service**: Handle user authentication and authorization
4. **Core APIs**: FastAPI services for songs, blogs, users, etc.
5. **Database**: PostgreSQL for relational data storage
6. **File Storage**: S3 for audio files and images
7. **Cache**: Redis for performance optimization
8. **Task Queue**: Celery for background and scheduled tasks
9. **Blog Scraper**: Python service for content aggregation

## 4. Hosting & Third-Party Services

### 4.1 Production Environment

| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend Hosting | Vercel | Fast global CDN for React application |
| Backend Hosting | AWS Elastic Beanstalk or DigitalOcean App Platform | Managed container hosting with auto-scaling |
| Database | AWS RDS or DigitalOcean Managed PostgreSQL | Managed PostgreSQL with automated backups |
| Redis Cache | AWS ElastiCache or DigitalOcean Managed Redis | Managed Redis service |
| File Storage | AWS S3 | Object storage for media files |
| CDN | Cloudflare | Content delivery and DDoS protection |
| DNS Management | Cloudflare | DNS management and SSL certificates |
| Email Service | AWS SES or SendGrid | Transactional emails |
| Monitoring | AWS CloudWatch or Datadog | Application and infrastructure monitoring |
| Error Tracking | Sentry | Real-time error tracking and debugging |
| Analytics | Google Analytics or Plausible | User behavior analysis |

### 4.2 Development Environment

| Service | Provider | Purpose |
|---------|----------|---------|
| Source Control | GitHub | Code repository and collaboration |
| CI/CD | GitHub Actions | Automated testing and deployment |
| Local Development | Docker Compose | Containerized local development environment |
| Secrets Management | Docker secrets (dev), AWS Parameter Store (prod) | Secure credentials management |
| API Documentation | Swagger UI (via FastAPI) | Interactive API documentation |

## 5. Data Flow Architecture

### 5.1 Authentication Flow

1. User registers or logs in through the client application
2. Auth service validates credentials and issues JWT
3. JWT is stored securely (HttpOnly cookie or localStorage with precautions)
4. JWT is included in API requests for authorization
5. API Gateway and/or Auth Middleware validates the JWT
6. Expired tokens trigger re-authentication

### 5.2 Song Playback Flow

1. User selects a song from the UI
2. Client requests song details from API
3. API returns song data including pre-signed URL for media file
4. Howler.js player loads and streams the audio from S3
5. Play count/analytics data sent to API

### 5.3 Feed Generation Flow

1. User requests personalized feed
2. API queries database for followed blogs and users
3. Database returns matching songs with pagination
4. Results are cached in Redis with appropriate TTL
5. Formatted feed data returned to client

### 5.4 Blog Scraping Flow

1. Scheduled Celery task triggers scraper
2. Scraper fetches content from configured blog sources
3. Scraper extracts song data and media links
4. New content is deduplicated and stored in database
5. Related entities (bands, tags) are created or updated
6. Notification events triggered for new content (optional)

## 6. Security Strategy

### 6.1 Authentication & Authorization

- JWT-based authentication with short token expiry
- Refresh token pattern for extended sessions
- Role-based access control for admin features
- HTTPS-only communication
- Secure cookie settings (HttpOnly, SameSite, Secure)

### 6.2 Data Protection

- Parameter validation on all API endpoints
- Prepared statements for database queries
- Cross-Site Request Forgery (CSRF) protection
- Content Security Policy implementation
- Rate limiting on authentication and public endpoints
- Input sanitization for user-generated content

### 6.3 Infrastructure Security

- VPC configuration for private network isolation
- Security groups limiting access between services
- Regular security updates for all components
- Principle of least privilege for service accounts
- Encrypted data at rest and in transit

## 7. Scaling Strategy

### 7.1 Application Scaling

- Stateless API design for horizontal scaling
- Database read replicas for query-heavy operations
- Caching strategy to reduce database load
- Content Delivery Network for static assets
- Efficient database indexing strategy

### 7.2 Infrastructure Scaling

- Auto-scaling groups for API services
- Database connection pooling
- Serverless functions for irregular workloads
- Redis cluster for cache scaling
- Multi-region deployment option for global audience

## 8. Development & Deployment Workflow

### 8.1 Development Workflow

1. Feature branches created from `main` branch
2. Local development using Docker Compose
3. Automated tests run on pre-commit hooks
4. Pull requests with CI checks before merging
5. Code review process with required approvals

### 8.2 Deployment Pipeline

1. Merge to `main` triggers staging deployment
2. Automated tests run in staging environment
3. Manual approval for production deployment
4. Blue/green deployment to production
5. Automated rollback on error detection
6. Post-deployment smoke tests

## 9. Monitoring & Maintenance

### 9.1 Monitoring

- Real-time application performance monitoring
- Error tracking and alerting
- Database query performance analysis
- System resource utilization monitoring
- API endpoint usage and response time tracking
- User behavior analytics

### 9.2 Maintenance

- Scheduled database maintenance windows
- Regular dependency updates
- Security patch application process
- Backup and restore testing
- Disaster recovery planning and testing

## 10. Cost Optimization

### 10.1 Infrastructure Costs

- Right-sizing of compute resources
- Auto-scaling based on actual load
- Reserved instances for predictable workloads
- S3 lifecycle policies for infrequently accessed data
- CloudFront/Cloudflare caching to reduce origin requests

### 10.2 Development Costs

- Comprehensive automated testing to reduce bugs
- CI/CD automation to streamline deployments
- Clear documentation to reduce onboarding time
- Component library to accelerate UI development
- Monitoring to identify and address issues early 