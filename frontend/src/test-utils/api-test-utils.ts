import { rest } from 'msw';
import { server } from '../mocks/server';
import { mockUser, mockSongs, mockBlogs } from './test-fixtures';

// Helper to mock successful API responses
export const mockApiSuccess = {
  user: () => {
    server.use(
      rest.get('/api/users/me', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockUser));
      })
    );
  },
  songs: () => {
    server.use(
      rest.get('/api/songs', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockSongs));
      })
    );
  },
  blogs: () => {
    server.use(
      rest.get('/api/blogs', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockBlogs));
      })
    );
  },
  login: () => {
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            access_token: 'mock-jwt-token-for-testing',
            token_type: 'bearer',
          })
        );
      })
    );
  },
  register: () => {
    server.use(
      rest.post('/api/auth/register', (req, res, ctx) => {
        return res(ctx.status(201), ctx.json(mockUser));
      })
    );
  },
};

// Helper to mock failed API responses
export const mockApiError = {
  network: (endpoint: string) => {
    server.use(
      rest.get(endpoint, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Network Error' }));
      }),
      rest.post(endpoint, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Network Error' }));
      })
    );
  },
  unauthorized: (endpoint: string) => {
    server.use(
      rest.get(endpoint, (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
      }),
      rest.post(endpoint, (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
      })
    );
  },
  validation: (endpoint: string, errors: Record<string, string[]>) => {
    server.use(
      rest.post(endpoint, (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            message: 'Validation Error',
            errors,
          })
        );
      })
    );
  },
};

// Helper to wait for async operations
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0)); 