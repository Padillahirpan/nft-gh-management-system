/**
 * Auth Plugin
 * Extends Fastify instance with authentication utilities
 */

import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

/**
 * @param {FastifyInstance} fastify
 * @param {object} options
 */
const authPlugin = fp(async function (fastify, options) {
  // Decorate request with authenticate function
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({
        error: {
          message: 'Unauthorized - Invalid or missing token',
          code: 401,
        },
      });
    }
  });

  // Optional authentication - doesn't fail if no token
  fastify.decorate('optionalAuth', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      // Continue without authentication
      request.user = null;
    }
  });

  // Check if user has required role
  fastify.decorate('hasRole', function (user, roles) {
    if (!user) return false;
    return roles.includes(user.role);
  });
}, {
  name: 'auth-plugin',
});

export default authPlugin;
