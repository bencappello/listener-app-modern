# Listener App - Implementation Blueprint

## 1. Project Setup & Organization

### 1.1 Repository Structure

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
│   ├── main.py              # Entry point
│   └── requirements.txt     # Python dependencies
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
│   ├── tests/               # Frontend tests
│   └── package.json         # Node dependencies
├── scraper/                 # Blog scraping service
│   ├── app/                 # Scraper application
│   ├── tests/               # Scraper tests
│   └── requirements.txt     # Scraper dependencies
├── docker-compose.yml       # Docker Compose config
├── .env.example             # Environment variable examples
└── README.md                # Project documentation
```

### 1.2 Environment Configuration

- Development, testing, and production environments
- Environment-specific settings via `.env` files
- Docker Compose for local development
- Containerized services for consistent environments

## 2. Backend Implementation

### 2.1 FastAPI Application Structure

```python
# Structure for main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, users, songs, bands, blogs, tags, comments
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Listener API",
    description="Music blog aggregator API",
    version="1.0.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(songs.router, prefix="/api/songs", tags=["Songs"])
app.include_router(bands.router, prefix="/api/bands", tags=["Bands"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["Blogs"])
app.include_router(tags.router, prefix="/api/tags", tags=["Tags"])
app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])
```

### 2.2 Database Models

Define SQLAlchemy models that mirror the database schema from the modernization blueprint:

- User model
- Song model
- Band model
- Blog model
- Tag model
- Comment model (polymorphic)
- Relationship models (UserSong, UserBlog, UserFollow, SongTag, etc.)

Key implementations:
- Type hints for all properties
- Relationships defined with appropriate cascade behaviors
- Hybrid properties for computed values
- Base model with common fields (id, created_at, updated_at)

### 2.3 API Routes Implementation

Implement the API endpoints defined in the modernization blueprint using FastAPI:

#### Authentication Routes
- Registration, login, logout, current user info
- JWT token generation and validation
- Password hashing with PassLib

#### User Routes
- CRUD operations for users
- Endpoints for user's songs, blogs, favorites, follows, etc.
- User feed generation

#### Song Routes
- CRUD operations for songs
- Search, filtering, and popularity endpoints
- Favoriting functionality
- Comment management

#### Band Routes
- CRUD operations for bands
- Associated songs and comments

#### Blog Routes
- CRUD operations for blogs
- Following functionality
- Associated songs and comments

#### Tag Routes
- CRUD operations for tags
- Associated content retrieval

### 2.4 Database Interaction

- SQLAlchemy ORM for database interactions
- Alembic for database migrations
- Transaction management for multi-step operations
- Database connection pooling

### 2.5 Media File Handling

- S3 integration for storing audio files and images
- Pre-signed URLs for secure file access
- File upload and validation middleware
- Image resizing and optimization for different contexts

### 2.6 Authentication & Security

- JWT authentication with refresh tokens
- Role-based access control
- Password hashing with bcrypt
- Input validation with Pydantic
- Rate limiting for sensitive endpoints

### 2.7 Caching Strategy

- Redis for caching frequently accessed data
- Cache invalidation on data updates
- TTL-based cache expiration
- Cache hierarchy for different data types

## 3. Frontend Implementation

### 3.1 React Application Structure

```typescript
// Example App.tsx structure
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient } from 'react-query';

import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { PrivateRoute } from './components/PrivateRoute';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import SongDetailsPage from './pages/SongDetailsPage';
import BandPage from './pages/BandPage';
import BlogPage from './pages/BlogPage';
import SearchPage from './pages/SearchPage';
import UserFeedPage from './pages/UserFeedPage';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PlayerProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="songs/:id" element={<SongDetailsPage />} />
                  <Route path="bands/:id" element={<BandPage />} />
                  <Route path="blogs/:id" element={<BlogPage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route element={<PrivateRoute />}>
                    <Route path="feed" element={<UserFeedPage />} />
                    <Route path="users/:id" element={<UserProfilePage />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </PlayerProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}
```

### 3.2 State Management

- Redux Toolkit for global state management
- React Query for server state management
- Context API for specialized state (auth, player)
- Local component state for UI-specific state

```typescript
// Example of Redux store setup
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import songsReducer from './slices/songsSlice';
import bandsReducer from './slices/bandsSlice';
import blogsReducer from './slices/blogsSlice';
import playerReducer from './slices/playerSlice';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    songs: songsReducer,
    bands: bandsReducer,
    blogs: blogsReducer,
    player: playerReducer,
    search: searchReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 3.3 Component Implementation

Implement React components for all UI elements:

#### Layout Components
- `Navbar` with user menu, search, and navigation
- `Footer` with site links
- `MainLayout` as the page wrapper
- `Sidebar` for navigation and filters

#### Authentication Components
- `LoginForm` for user login
- `RegisterForm` for user registration
- `ProfileForm` for editing user profiles

#### Song Components
- `SongPlayer` with audio controls
- `SongList` for displaying lists of songs
- `SongCard` for individual song display
- `SongDetail` for full song information

#### User Components
- `UserProfile` for user information
- `UserFeed` for personalized content
- `FollowButton` for following users
- `FavoriteButton` for loving songs

#### Blog Components
- `BlogList` for displaying blogs
- `BlogDetail` for blog information
- `BlogForm` for creating/editing blogs

#### Shared Components
- `CommentList` for displaying comments
- `CommentForm` for adding comments
- `TagList` for displaying tags
- `SearchBar` for search functionality
- `Pagination` for paged content
- `Modal` for pop-up dialogs

### 3.4 API Integration

```typescript
// Example of React Query API hook
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../utils/api';

// Get songs with pagination
export const useSongs = (page = 1, limit = 10) => {
  return useQuery(['songs', page, limit], () => 
    api.get(`/api/songs?page=${page}&limit=${limit}`)
  );
};

// Get a single song by ID
export const useSong = (id: string) => {
  return useQuery(['song', id], () => 
    api.get(`/api/songs/${id}`)
  );
};

// Add a new song
export const useAddSong = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (songData: any) => api.post('/api/songs', songData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('songs');
      }
    }
  );
};

// Toggle favorite status
export const useFavoriteSong = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (songId: string) => api.post(`/api/songs/${songId}/favorite`),
    {
      onSuccess: (_, songId) => {
        queryClient.invalidateQueries(['song', songId]);
        queryClient.invalidateQueries('songs');
        queryClient.invalidateQueries('favorites');
      }
    }
  );
};
```

### 3.5 Audio Player Implementation

- Implement Howler.js for audio playback
- Create player controls for play, pause, skip, volume
- Implement queue management for continuous playback
- Handle streaming from S3 URLs

```typescript
// Example Player Context
import { createContext, useState, useContext, useEffect } from 'react';
import { Howl } from 'howler';

type PlayerContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  setVolume: (volume: number) => void;
  queue: Song[];
  addToQueue: (song: Song) => void;
  clearQueue: () => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [howl, setHowl] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState<Song[]>([]);

  // Implementation of player methods...

  return (
    <PlayerContext.Provider value={{ 
      currentSong, 
      isPlaying, 
      volume, 
      playSong, 
      pauseSong,
      nextSong,
      previousSong,
      setVolume,
      queue,
      addToQueue,
      clearQueue
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
```

### 3.6 Styling & UI Implementation

- Implement Tailwind CSS for utility-based styling
- Use Chakra UI for accessible component base
- Create responsive designs for mobile and desktop
- Implement light/dark theme support

### 3.7 Authentication Flow

- JWT token management
- Protected routes via React Router
- Login persistence with secure storage
- Session timeout handling

## 4. Blog Scraper Service

### 4.1 Scraper Architecture

- Independent Python service using BeautifulSoup or Scrapy
- Celery integration for scheduled scraping
- Configurable blog sources
- Content parsing and extraction

### 4.2 Scraper Implementation

```python
# Example scraper structure
from celery import Celery
from celery.schedules import crontab
from bs4 import BeautifulSoup
import requests
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Blog, Song, Band
from app.services import song_service

app = Celery('scraper', broker='redis://redis:6379/0')

app.conf.beat_schedule = {
    'scrape-blogs-every-hour': {
        'task': 'scraper.tasks.scrape_all_blogs',
        'schedule': crontab(minute=0),  # Every hour
    },
}

@app.task
def scrape_all_blogs():
    db = next(get_db())
    blogs = db.query(Blog).all()
    
    for blog in blogs:
        scrape_blog.delay(blog.id)

@app.task
def scrape_blog(blog_id):
    db = next(get_db())
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    
    # Fetch blog content
    response = requests.get(blog.url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Extract songs
    song_elements = soup.find_all('div', class_='song-embed')
    
    for element in song_elements:
        # Extract song data
        song_name = element.find('h3').text
        band_name = element.find('h4').text
        audio_url = element.find('audio').get('src')
        
        # Get or create band
        band = get_or_create_band(db, band_name)
        
        # Check if song exists
        existing_song = db.query(Song).filter(
            Song.name == song_name,
            Song.blog_id == blog.id
        ).first()
        
        if not existing_song:
            # Create new song
            song_service.create_song(
                db=db,
                name=song_name,
                band_id=band.id,
                blog_id=blog.id,
                audio_url=audio_url,
                song_type='regular'
            )
```

### 4.3 Content Processing

- Audio link extraction and validation
- Metadata parsing from blog content
- Image extraction for song/artist thumbnails
- Deduplication logic

## 5. Deployment & Infrastructure

### 5.1 Docker Configuration

```yaml
# Example docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    env_file:
      - ./.env
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm start
    env_file:
      - ./.env

  scraper:
    build: ./scraper
    depends_on:
      - postgres
      - redis
    env_file:
      - ./.env
    command: celery -A app.tasks worker --beat -l info

  postgres:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    env_file:
      - ./.env
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 5.2 CI/CD Pipeline

```yaml
# Example GitHub Action workflow
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install backend dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          
      - name: Run backend tests
        run: |
          cd backend
          pytest
          
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm install
          
      - name: Run frontend tests
        run: |
          cd frontend
          npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Deploy to staging
      - name: Deploy to staging
        uses: some-action/deploy@v1
        with:
          environment: staging
          
      # Manual approval step for production
      - name: Wait for approval
        uses: trstringer/manual-approval@v1
        with:
          secret: ${{ secrets.GITHUB_TOKEN }}
          approvers: username1,username2
          
      # Deploy to production
      - name: Deploy to production
        uses: some-action/deploy@v1
        with:
          environment: production
```

### 5.3 AWS Infrastructure Setup

- Elastic Beanstalk for backend services
- S3 for file storage
- RDS for PostgreSQL database
- ElastiCache for Redis
- CloudFront for CDN
- Route 53 for DNS
- IAM for service permissions

### 5.4 Monitoring & Logging

- Prometheus metrics collection
- Grafana dashboards for visualization
- ELK Stack for log aggregation
- Alerting configuration for critical issues

## 6. Testing Strategy

### 6.1 Backend Testing

```python
# Example test for user API
import pytest
from fastapi.testclient import TestClient

from main import app
from app.models import User
from app.core.security import create_jwt_token

client = TestClient(app)

@pytest.fixture
def user_token():
    # Create test user
    user = User(
        email="test@example.com",
        username="testuser",
        password_hash="hashed_password"
    )
    
    # Create token
    token = create_jwt_token({"sub": str(user.id)})
    return token

def test_get_current_user(user_token):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"

def test_create_song(user_token):
    response = client.post(
        "/api/songs",
        headers={"Authorization": f"Bearer {user_token}"},
        json={
            "name": "Test Song",
            "band_name": "Test Band",
            "blog_id": 1,
            "song_type": "regular",
            "audio_url": "https://example.com/song.mp3"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Song"
```

### 6.2 Frontend Testing

```typescript
// Example React component test
import { render, screen, fireEvent } from '@testing-library/react';
import { SongCard } from './SongCard';

// Mock data
const mockSong = {
  id: '1',
  name: 'Test Song',
  band_name: 'Test Band',
  blog_name: 'Test Blog',
  image_url: 'https://example.com/image.jpg',
  audio_url: 'https://example.com/audio.mp3',
  favorited: false,
};

// Mock functions
const mockFavorite = jest.fn();
const mockPlay = jest.fn();

test('renders song card with correct information', () => {
  render(
    <SongCard 
      song={mockSong} 
      onFavorite={mockFavorite} 
      onPlay={mockPlay} 
    />
  );
  
  expect(screen.getByText('Test Song')).toBeInTheDocument();
  expect(screen.getByText('Test Band')).toBeInTheDocument();
  expect(screen.getByText('Test Blog')).toBeInTheDocument();
});

test('calls favorite function when favorite button is clicked', () => {
  render(
    <SongCard 
      song={mockSong} 
      onFavorite={mockFavorite} 
      onPlay={mockPlay} 
    />
  );
  
  const favoriteButton = screen.getByRole('button', { name: /favorite/i });
  fireEvent.click(favoriteButton);
  
  expect(mockFavorite).toHaveBeenCalledWith('1');
});

test('calls play function when play button is clicked', () => {
  render(
    <SongCard 
      song={mockSong} 
      onFavorite={mockFavorite} 
      onPlay={mockPlay} 
    />
  );
  
  const playButton = screen.getByRole('button', { name: /play/i });
  fireEvent.click(playButton);
  
  expect(mockPlay).toHaveBeenCalledWith(mockSong);
});
```

### 6.3 Integration Testing

- API endpoint integration tests
- Frontend-backend integration testing
- Authentication flow testing
- End-to-end user journey tests

## 7. Data Migration Strategy

### 7.1 Data Export from Legacy System

```python
# Example data export script
import csv
import psycopg2

# Connect to legacy database
conn = psycopg2.connect(
    host="legacy-db-host",
    database="listener_production",
    user="username",
    password="password"
)

# Export users
with conn.cursor() as cur:
    cur.execute("SELECT id, username, email, password_digest, created_at, updated_at FROM users")
    with open('users.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'username', 'email', 'password_digest', 'created_at', 'updated_at'])
        writer.writerows(cur.fetchall())

# Export songs
with conn.cursor() as cur:
    cur.execute("""
        SELECT s.id, s.name, s.band_id, s.blog_id, s.user_id, s.song_type, 
               s.audio_url, s.image_url, s.created_at, s.updated_at 
        FROM songs s
    """)
    with open('songs.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'name', 'band_id', 'blog_id', 'user_id', 'song_type', 
                         'audio_url', 'image_url', 'created_at', 'updated_at'])
        writer.writerows(cur.fetchall())

# Export other tables...
```

### 7.2 Data Import to New System

```python
# Example data import script
import csv
from sqlalchemy.orm import Session

from app.db.session import engine
from app.models import User, Song, Band, Blog

def import_users():
    with open('users.csv', 'r') as f:
        reader = csv.DictReader(f)
        with Session(engine) as session:
            for row in reader:
                user = User(
                    id=row['id'],
                    username=row['username'],
                    email=row['email'],
                    password_hash=row['password_digest'],
                    created_at=row['created_at'],
                    updated_at=row['updated_at']
                )
                session.add(user)
            session.commit()

def import_songs():
    with open('songs.csv', 'r') as f:
        reader = csv.DictReader(f)
        with Session(engine) as session:
            for row in reader:
                song = Song(
                    id=row['id'],
                    name=row['name'],
                    band_id=row['band_id'],
                    blog_id=row['blog_id'],
                    user_id=row['user_id'],
                    song_type=row['song_type'],
                    audio_url=row['audio_url'],
                    image_url=row['image_url'],
                    created_at=row['created_at'],
                    updated_at=row['updated_at']
                )
                session.add(song)
            session.commit()

# Import other tables...
```

### 7.3 Data Validation & Verification

- Consistency checks between old and new data
- User account verification
- File migration validation
- Relationship integrity checking

## 8. Implementation Timeline & Phases

### 8.1 Phase 1: Foundation (Weeks 1-4)
- Set up project repository and structure
- Configure development environment with Docker
- Implement core database models and migrations
- Create basic API endpoints
- Set up CI/CD pipeline

### 8.2 Phase 2: Core Functionality (Weeks 5-8)
- Implement authentication system
- Develop song, band, and blog APIs
- Create frontend application skeleton
- Implement basic UI components
- Set up S3 integration for file storage

### 8.3 Phase 3: Features & Integration (Weeks 9-12)
- Implement audio player
- Develop user feed and discovery features
- Create search functionality
- Implement social features (following, favoriting)
- Build blog scraper service

### 8.4 Phase 4: Polish & Optimization (Weeks 13-16)
- Implement caching strategy
- Optimize database queries
- Enhance UI/UX with animations and polish
- Conduct performance testing and optimization
- Set up monitoring and alerts

### 8.5 Phase 5: Testing & Deployment (Weeks 17-20)
- Comprehensive testing of all features
- Data migration from legacy system
- Staging deployment and UAT
- Production deployment
- Post-launch monitoring and support

## 9. Maintenance & Support Plan

### 9.1 Regular Maintenance Tasks
- Weekly dependency updates
- Monthly security patches
- Quarterly performance reviews
- Bi-annual disaster recovery testing

### 9.2 Support Procedures
- Issue tracking and prioritization process
- Bug fix release schedule
- Feature request evaluation criteria
- Emergency response protocol

### 9.3 Documentation
- API documentation with Swagger UI
- Developer onboarding guides
- Administration manuals
- User help center content

## 10. Future Roadmap Considerations

### 10.1 Potential Enhancements
- Mobile application development
- Machine learning for song recommendations
- Enhanced analytics for user behavior
- Social sharing features
- Playlist creation and management
- Artist/band profiles and submission portal

### 10.2 Scalability Considerations
- Multi-region deployment for global availability
- Database sharding for horizontal scaling
- Microservices evolution for specific features
- CDN optimization for global content delivery

### 10.3 Technology Evolution
- Regular evaluation of new JavaScript frameworks
- Database technology reassessment
- Cloud provider optimization
- Monitoring and observability tools evolution 