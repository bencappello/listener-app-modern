# Listener App - Modernization Blueprint

## 1. Overview and Purpose

Listener is a music blog aggregator similar to Hype Machine. It scrapes music blogs for embedded music content and stores the links in a database. Users can play songs with the site's music player, search for songs, and browse blogs. Users can "love" songs which then appear on their loved songs page. They can also follow blogs and other users. Each user has a personalized feed displaying songs from blogs they follow and songs loved by users they follow.

## 2. User Functionality

### 2.1 Authentication
- User registration with username, email, and password
- User login/logout
- User profile with profile picture

### 2.2 Core Features
- **Song Playback**: Integrated music player to play embedded songs
- **Song Discovery**:
  - Browse latest songs
  - View popular songs (currently loved)
  - Search for songs by title or artist
- **Social Features**:
  - Love songs (favorites)
  - Follow blogs
  - Follow other users
  - User feed showing activity from followed entities
- **Content Creation**:
  - Add new songs to the system (with artist, blog source, etc.)
  - Create blogs
  - Add comments to songs, bands, and blogs

### 2.3 User Pages
- User profile page showing:
  - User information
  - Added songs
  - Created blogs
  - Loved songs
  - Followed blogs
  - Followed users
  - Followers
- Personal feed page showing songs from followed blogs and followed users' loved songs

## 3. Data Model

### 3.1 Core Entities

#### User
- id (PK)
- username
- email
- password_digest
- session_token
- image (profile picture)
- timestamps

#### Song
- id (PK)
- name
- band_id (FK)
- blog_id (FK)
- user_id (FK - who added the song)
- song_type (remix or regular)
- audio_url/file
- image_url/file
- timestamps

#### Band
- id (PK)
- name
- timestamps

#### Blog
- id (PK)
- name
- user_id (FK - blog creator)
- timestamps

#### Tag
- id (PK)
- name
- timestamps

#### Comment
- id (PK)
- author_id (FK)
- commentable_id
- commentable_type (polymorphic - can be on songs, bands, or blogs)
- body
- timestamps

### 3.2 Relationship Entities

#### UserSong (Loved Songs)
- id (PK)
- user_id (FK)
- song_id (FK)
- timestamps

#### UserBlog (Followed Blogs)
- id (PK)
- user_id (FK)
- blog_id (FK)
- timestamps

#### UserFollow (Followed Users)
- id (PK)
- follower_id (FK)
- followed_user_id (FK)
- timestamps

#### SongTag
- id (PK)
- song_id (FK)
- tag_id (FK)
- timestamps

#### BlogTag
- id (PK)
- blog_id (FK)
- tag_id (FK)
- timestamps

#### BandTag
- id (PK)
- band_id (FK)
- tag_id (FK)
- timestamps

## 4. Application Architecture

### 4.1 Current Architecture (Ruby on Rails & Backbone.js)

#### Backend (Ruby on Rails)
- RESTful API endpoints for all models
- Authentication using session tokens
- Data validation
- Polymorphic comments
- Image and audio file uploads
- Search functionality

#### Frontend (Backbone.js)
- Single-page application
- Models for User, Song, Band, Blog, etc.
- Collections for managing sets of models
- Views for UI components
- Routers for client-side navigation
- Templates for UI rendering (JST/EJS)

### 4.2 Proposed Modern Architecture

#### Backend (Python with FastAPI)
- RESTful API endpoints with OpenAPI documentation
- JWT authentication
- Pydantic models for data validation
- SQLAlchemy ORM for database interaction
- Alembic for database migrations
- Async support for improved performance
- CORS middleware for frontend communication

#### Frontend (React with TypeScript)
- Single-page application with React Router
- TypeScript for type safety
- Redux for state management
- React Query for data fetching and caching
- Styled components or Tailwind CSS for styling
- Component-based architecture
- Responsive design for mobile and desktop

#### Database
- PostgreSQL for relational data
- Redis for caching and session management

#### Infrastructure
- Docker containers for consistent environments
- CI/CD pipeline for automated testing and deployment
- Environment-specific configurations (dev, test, prod)

## 5. API Endpoints

### 5.1 Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `POST /api/auth/logout` - Logout (invalidate token)
- `GET /api/auth/me` - Get current user info

### 5.2 Users
- `GET /api/users` - List users
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `GET /api/users/{id}/songs` - Get songs added by user
- `GET /api/users/{id}/blogs` - Get blogs created by user
- `GET /api/users/{id}/favorite-songs` - Get user's favorite songs
- `GET /api/users/{id}/followed-blogs` - Get blogs followed by user
- `GET /api/users/{id}/followed-users` - Get users followed by user
- `GET /api/users/{id}/followers` - Get user's followers
- `GET /api/users/{id}/feed` - Get user's personalized feed

### 5.3 Songs
- `GET /api/songs` - List songs (with filtering options)
- `GET /api/songs/{id}` - Get song details
- `POST /api/songs` - Create a new song
- `PUT /api/songs/{id}` - Update a song
- `DELETE /api/songs/{id}` - Delete a song
- `GET /api/songs/search` - Search songs
- `GET /api/songs/popular` - Get popular songs
- `POST /api/songs/{id}/favorite` - Love/unlove a song
- `GET /api/songs/{id}/comments` - Get song comments
- `POST /api/songs/{id}/comments` - Add comment to song

### 5.4 Bands
- `GET /api/bands` - List bands
- `GET /api/bands/{id}` - Get band details
- `POST /api/bands` - Create a new band
- `PUT /api/bands/{id}` - Update a band
- `GET /api/bands/{id}/songs` - Get songs by band
- `GET /api/bands/{id}/comments` - Get band comments
- `POST /api/bands/{id}/comments` - Add comment to band

### 5.5 Blogs
- `GET /api/blogs` - List blogs
- `GET /api/blogs/{id}` - Get blog details
- `POST /api/blogs` - Create a new blog
- `PUT /api/blogs/{id}` - Update a blog
- `DELETE /api/blogs/{id}` - Delete a blog
- `GET /api/blogs/{id}/songs` - Get songs from blog
- `POST /api/blogs/{id}/follow` - Follow/unfollow a blog
- `GET /api/blogs/{id}/comments` - Get blog comments
- `POST /api/blogs/{id}/comments` - Add comment to blog

### 5.6 Tags
- `GET /api/tags` - List tags
- `GET /api/tags/{id}` - Get tag details
- `POST /api/tags` - Create a new tag
- `GET /api/tags/{id}/songs` - Get songs with tag
- `GET /api/tags/{id}/blogs` - Get blogs with tag
- `GET /api/tags/{id}/bands` - Get bands with tag

## 6. Frontend Components

### 6.1 Layout Components
- `Navbar` - Navigation bar with logo, search, user menu
- `Footer` - Site footer with links
- `MainLayout` - Main page layout wrapper
- `Sidebar` - Optional sidebar for navigation/filters

### 6.2 Authentication Components
- `LoginForm` - User login form
- `RegisterForm` - User registration form
- `ProfileForm` - Edit user profile form

### 6.3 Song Components
- `SongPlayer` - Audio player with controls
- `SongCard` - Card displaying song info with play button
- `SongList` - List of songs
- `SongDetail` - Detailed song view
- `SongForm` - Form to add/edit songs
- `SongSearch` - Search interface for songs

### 6.4 Blog Components
- `BlogCard` - Card displaying blog info
- `BlogList` - List of blogs
- `BlogDetail` - Detailed blog view
- `BlogForm` - Form to add/edit blogs

### 6.5 User Components
- `UserCard` - Card displaying user info
- `UserProfile` - User profile page
- `UserFeed` - User's personalized feed
- `FollowButton` - Button to follow/unfollow user
- `FavoriteButton` - Button to love/unlove song

### 6.6 Shared Components
- `CommentList` - List of comments
- `CommentForm` - Form to add comments
- `TagList` - List of tags/genres
- `Pagination` - Pagination controls
- `SearchBar` - Search input component
- `FileUpload` - Component for uploading files
- `Modal` - Reusable modal dialog
- `LoadingSpinner` - Loading indicator

## 7. Data Flow and State Management

### 7.1 Redux Store Structure
```
{
  auth: {
    currentUser: { ... },
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  songs: {
    items: [ ... ],
    current: { ... },
    popular: [ ... ],
    loading: boolean,
    error: string | null,
    pagination: { ... }
  },
  bands: {
    items: [ ... ],
    current: { ... },
    loading: boolean,
    error: string | null
  },
  blogs: {
    items: [ ... ],
    current: { ... },
    loading: boolean,
    error: string | null
  },
  users: {
    items: [ ... ],
    current: { ... },
    loading: boolean,
    error: string | null
  },
  player: {
    currentSong: { ... },
    isPlaying: boolean,
    queue: [ ... ],
    volume: number
  },
  search: {
    query: string,
    results: [ ... ],
    loading: boolean,
    error: string | null
  },
  ui: {
    modals: { ... },
    notifications: [ ... ],
    theme: string
  }
}
```

### 7.2 React Query Implementation
Use React Query for data fetching with automatic caching, refetching, and synchronization:

```typescript
// Example query hook
const useSongsQuery = (page = 1) => {
  return useQuery(['songs', page], () => 
    api.get(`/api/songs?page=${page}`)
  );
};

// Example mutation hook
const useAddSongMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (newSong) => api.post('/api/songs', newSong),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('songs');
      }
    }
  );
};
```

## 8. Authentication Flow

1. User registers or logs in
2. Backend validates credentials and issues JWT token
3. Token is stored in secure HttpOnly cookie or localStorage
4. Token is included in all subsequent API requests
5. Backend validates token for protected routes
6. JWT token expires after a defined period
7. On token expiration, user is prompted to log in again

## 9. Database Schema (SQL)

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bands table
CREATE TABLE bands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Blogs table
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Songs table
CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    band_id INTEGER REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    song_type VARCHAR(20) NOT NULL CHECK (song_type IN ('regular', 'remix')),
    audio_url VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(name, blog_id)
);

-- Tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    body TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    commentable_id INTEGER NOT NULL,
    commentable_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User-Song relationship (Loved songs)
CREATE TABLE user_songs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, song_id)
);

-- User-Blog relationship (Followed blogs)
CREATE TABLE user_blogs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, blog_id)
);

-- User-User relationship (Followed users)
CREATE TABLE user_follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    followed_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, followed_user_id)
);

-- Song-Tag relationship
CREATE TABLE song_tags (
    id SERIAL PRIMARY KEY,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(song_id, tag_id)
);

-- Blog-Tag relationship
CREATE TABLE blog_tags (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(blog_id, tag_id)
);

-- Band-Tag relationship
CREATE TABLE band_tags (
    id SERIAL PRIMARY KEY,
    band_id INTEGER REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(band_id, tag_id)
);

-- Indexes
CREATE INDEX ON songs(band_id);
CREATE INDEX ON songs(blog_id);
CREATE INDEX ON songs(user_id);
CREATE INDEX ON blogs(user_id);
CREATE INDEX ON comments(author_id);
CREATE INDEX ON comments(commentable_id, commentable_type);
CREATE INDEX ON user_songs(user_id);
CREATE INDEX ON user_songs(song_id);
CREATE INDEX ON user_blogs(user_id);
CREATE INDEX ON user_blogs(blog_id);
CREATE INDEX ON user_follows(follower_id);
CREATE INDEX ON user_follows(followed_user_id);
```

## 10. File Upload and Storage

### 10.1 Image Upload
- Use cloud storage (AWS S3, Google Cloud Storage)
- Generate secure URLs for stored files
- Support image resizing for different use cases:
  - Profile pictures
  - Song thumbnails
  - Various UI sizes

### 10.2 Audio File Handling
- Store audio files in cloud storage
- Support streaming playback
- Alternatively, integrate with external audio providers:
  - SoundCloud
  - YouTube
  - Spotify

## 11. Search Functionality

- Implement full-text search using PostgreSQL's full-text search capabilities
- Search across multiple fields (song name, band name)
- Filter by tags/genres
- Sort by relevance, popularity, or date
- Support pagination for search results

## 12. Development and Deployment

### 12.1 Development Environment
- Docker for containerized development
- Docker Compose for multi-container setup
- Hot reloading for frontend and backend
- Environment-specific configuration
- Database seeding for development

### 12.2 Testing Strategy
- Unit tests for backend services and models
- API integration tests
- Component tests for frontend
- End-to-end tests for critical user flows
- CI integration for automated testing

### 12.3 Deployment Pipeline
- Containerized deployment
- Separate environments:
  - Development
  - Testing
  - Production
- Database migration strategy
- Rollback procedures
- Monitoring and logging

## 13. Future Enhancements

### 13.1 Blog Scraping Functionality
- Implement scrapers to find embedded songs on music blogs
- Schedule regular scraping jobs
- Deduplication of songs from multiple blogs

### 13.2 Additional Features
- Advanced music player with playlists
- Mobile application
- Music recommendations
- Enhanced social features
- Analytics for artists/blogs

## 14. Migration Strategy

### 14.1 Data Migration
- Export data from existing Ruby on Rails database
- Transform data to fit new schema if necessary
- Import data into the new PostgreSQL database
- Verify data integrity

### 14.2 Phased Implementation
1. Develop backend API with FastAPI
2. Develop frontend with React
3. Integrate frontend and backend
4. Test thoroughly
5. Deploy new system
6. Run both systems in parallel temporarily
7. Redirect users to new system
8. Decommission old system

## 15. Modern Tech Stack Recommendations

### 15.1 Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Authentication**: JWT with PassLib
- **Database**: PostgreSQL
- **Migration**: Alembic
- **Task Queue**: Celery (for blog scraping)
- **File Storage**: AWS S3
- **Caching**: Redis

### 15.2 Frontend
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query
- **Routing**: React Router
- **Styling**: Tailwind CSS or Styled Components
- **UI Components**: MUI or Chakra UI
- **Forms**: React Hook Form
- **Audio Player**: Howler.js

### 15.3 Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose (development), Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Hosting**: AWS, Google Cloud, or Azure
- **Monitoring**: Prometheus and Grafana
- **Logging**: ELK Stack 