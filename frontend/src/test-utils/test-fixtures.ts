// User fixtures
export const mockUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
};

// Authentication fixtures
export const mockAuthState = {
  user: mockUser,
  isAuthenticated: true,
  loading: false,
  error: null,
};

export const mockUnauthenticatedState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Song fixtures
export const mockSongs = [
  {
    id: 'song-1',
    name: 'Test Song 1',
    band_name: 'Test Band',
    audio_url: 'https://example.com/test-song-1.mp3',
    song_type: 'regular',
    blog_id: 'blog-1',
    user_id: 'user-1',
  },
  {
    id: 'song-2',
    name: 'Test Song 2',
    band_name: 'Another Band',
    audio_url: 'https://example.com/test-song-2.mp3',
    song_type: 'remix',
    blog_id: 'blog-2',
    user_id: 'user-2',
  },
];

// Blog fixtures
export const mockBlogs = [
  {
    id: 'blog-1',
    name: 'Test Blog',
    url: 'https://example.com/test-blog',
    last_scraped: '2023-05-01T12:00:00Z',
  },
  {
    id: 'blog-2',
    name: 'Another Blog',
    url: 'https://example.com/another-blog',
    last_scraped: '2023-05-02T12:00:00Z',
  },
];

// Error fixtures
export const mockNetworkError = {
  status: 500,
  message: 'Network Error',
};

export const mockValidationError = {
  status: 400,
  message: 'Validation Error',
  errors: {
    field: ['Invalid value'],
  },
}; 