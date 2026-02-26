/**
 * NFT Greenhouse Management System - Backend Server
 * Main entry point for Fastify application
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

// Import routes
import authRoutes from './routes/auth.js';
import sensorRoutes from './routes/sensor.js';
import talangRoutes from './routes/talang.js';
import batchRoutes from './routes/batch.js';
import harvestRoutes from './routes/harvest.js';
import alertRoutes from './routes/alert.js';

// Import plugins
import authPlugin from './plugins/auth.js';

// Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register CORS
await fastify.register(cors, {
  origin: true, // In production, specify allowed origins
  credentials: true,
});

// Register JWT
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your_super_secret_key_change_this',
});

// Register Swagger documentation
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'NFT Greenhouse Management API',
      description: 'API for managing NFT hydroponic greenhouse - selada bokor',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
});

await fastify.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

// Register auth plugin
await fastify.register(authPlugin);

// Register routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(sensorRoutes, { prefix: '/api/sensor' });
await fastify.register(talangRoutes, { prefix: '/api/talang' });
await fastify.register(batchRoutes, { prefix: '/api/batch' });
await fastify.register(harvestRoutes, { prefix: '/api/harvest' });
await fastify.register(alertRoutes, { prefix: '/api/alert' });

// Health check endpoint
fastify.get('/', async (request, reply) => {
  return {
    status: 'ok',
    message: 'NFT Greenhouse Management API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  reply.code(statusCode).send({
    error: {
      message,
      code: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
});

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    error: {
      message: 'Route not found',
      code: 404,
      path: request.url,
    },
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT) || 3001;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on http://${host}:${port}`);
    fastify.log.info(`API Documentation available at http://${host}:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
