/**
 * Auth Routes
 * Authentication endpoints: login, logout, get current user
 */

import { authenticateUser, generateTokenPayload } from '../services/authService.js';

const routes = async function (fastify, options) {
  const { prefix } = options;

  // POST /api/auth/login - Login and get JWT token
  fastify.post('/login', {
    schema: {
      description: 'Login with email and password',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                code: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      return reply.code(400).send({
        error: {
          message: 'Email dan password wajib diisi',
          code: 400,
        },
      });
    }

    // Authenticate user
    const user = await authenticateUser(email, password);

    if (!user) {
      return reply.code(401).send({
        error: {
          message: 'Email atau password salah',
          code: 401,
        },
      });
    }

    // Generate JWT token
    const token = fastify.jwt.sign(generateTokenPayload(user));

    return {
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  });

  // POST /api/auth/logout - Logout
  fastify.post('/logout', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Logout user',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    // In a stateless JWT system, logout is handled client-side
    // by deleting the token. This endpoint is for logging purposes.
    fastify.log.info(`User ${request.user.userId} logged out`);

    return {
      success: true,
      message: 'Logout berhasil',
    };
  });

  // GET /api/auth/me - Get current user info
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get current authenticated user info',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    // User info is already in request.user from JWT verification
    return {
      success: true,
      user: request.user,
    };
  });
};

export default routes;
