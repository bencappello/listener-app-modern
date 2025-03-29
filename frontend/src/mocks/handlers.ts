import { rest } from 'msw';

// Define handlers for mock API endpoints
export const handlers = [
  // Health check endpoint
  rest.get('/api/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'ok',
        version: '1.0.0',
      })
    );
  }),

  // Auth endpoints (to be used in future steps)
  rest.post('/api/auth/register', (req, res, ctx) => {
    // Mock user registration - we'll implement this properly in Step 7
    return res(
      ctx.status(201),
      ctx.json({
        id: 'mock-user-id-123',
        username: 'testuser',
        email: 'test@example.com',
      })
    );
  }),

  rest.post('/api/auth/login', (req, res, ctx) => {
    // Mock login - we'll implement this properly in Step 7
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'mock-jwt-token-for-testing',
        token_type: 'bearer',
      })
    );
  }),

  // We'll add more handlers as we implement more features
]; 