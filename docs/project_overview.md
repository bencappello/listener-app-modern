# Listener App - Project Overview

## Purpose

Listener is a music blog aggregator similar to Hype Machine. It scrapes music blogs for embedded music content and stores the links in a database. Users can play songs with the site's music player, search for songs, and browse blogs. The application aims to help users discover new music through an interactive platform that aggregates content from multiple music blogs.

## Core Features

### Authentication
- User registration with username, email, and password
- User login/logout
- User profile with profile picture

### Song Playback
- Integrated music player to play embedded songs
- Queue management
- Play history tracking

### Song Discovery
- Browse latest songs
- View popular songs (currently loved)
- Search for songs by title or artist
- Tag-based browsing

### Social Features
- Love songs (favorites)
- Follow blogs
- Follow other users
- User feed showing activity from followed entities
- Comments on songs, bands, and blogs

### Content Creation
- Add new songs to the system
- Create blogs
- Add comments to songs, bands, and blogs

## Technical Architecture

The application follows a modern architecture with separate backend and frontend components:

### Backend (FastAPI)
- RESTful API endpoints with OpenAPI documentation
- JWT authentication
- SQLAlchemy ORM for database interaction
- Alembic for database migrations
- Async support for improved performance
- PostgreSQL for data storage
- Redis for caching

### Frontend (React)
- Single-page application with React Router
- TypeScript for type safety
- Redux for state management
- React Query for data fetching
- Responsive design for mobile and desktop

### Blog Scraper Service
- Python service for scraping music blogs
- Celery for task scheduling
- Content extraction and processing

### Infrastructure
- Docker containers for consistent environments
- AWS S3 for file storage
- CI/CD pipeline for automated testing and deployment

## Data Model

### Core Entities
- Users
- Songs
- Bands
- Blogs
- Tags
- Comments (polymorphic)

### Relationship Entities
- UserSong (Loved Songs)
- UserBlog (Followed Blogs)
- UserFollow (Followed Users)
- SongTag
- BlogTag
- BandTag

## Development Approach

The project follows Test-Driven Development (TDD) principles:
1. Write tests that define expected behavior
2. Implement features to pass the tests
3. Refactor code while maintaining test coverage

Development is structured in phases with clear milestones, as outlined in the build guide. 