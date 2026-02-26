/**
 * Talang Routes
 * Talang (growing channel) management endpoints
 */

import {
  getAllTalangs,
  getTalangById,
  createTalang,
  updateTalang,
  deleteTalang,
} from '../services/talangService.js';

const routes = async function (fastify, options) {
  const { prefix } = options;

  // GET /api/talang - Get all talangs
  fastify.get('/', {
    schema: {
      description: 'Get all talangs',
      tags: ['Talang'],
      querystring: {
        type: 'object',
        properties: {
          isActive: { type: 'string', enum: ['true', 'false'] },
        },
      },
    },
  }, async (request, reply) => {
    const { isActive } = request.query;
    const talangs = await getAllTalangs({ isActive });
    return {
      success: true,
      data: talangs,
      count: talangs.length,
    };
  });

  // GET /api/talang/:id - Get talang by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get talang by ID',
      tags: ['Talang'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const talang = await getTalangById(id);

    if (!talang) {
      return reply.code(404).send({
        error: {
          message: 'Talang tidak ditemukan',
          code: 404,
        },
      });
    }

    return {
      success: true,
      data: talang,
    };
  });

  // POST /api/talang - Create new talang
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Create new talang',
      tags: ['Talang'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'position'],
        properties: {
          name: { type: 'string' },
          greenhouseId: { type: 'string' },
          position: { type: 'number' },
          totalSlots: { type: 'number', default: 20 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const talang = await createTalang(request.body);
      return reply.code(201).send({
        success: true,
        message: 'Talang berhasil dibuat',
        data: talang,
      });
    } catch (error) {
      return reply.code(400).send({
        error: {
          message: error.message,
          code: 400,
        },
      });
    }
  });

  // PATCH /api/talang/:id - Update talang
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Update talang',
      tags: ['Talang'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          position: { type: 'number' },
          totalSlots: { type: 'number' },
          isActive: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      const talang = await updateTalang(id, request.body);
      return {
        success: true,
        message: 'Talang berhasil diupdate',
        data: talang,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.code(404).send({
          error: {
            message: 'Talang tidak ditemukan',
            code: 404,
          },
        });
      }
      return reply.code(400).send({
        error: {
          message: error.message,
          code: 400,
        },
      });
    }
  });

  // DELETE /api/talang/:id - Delete talang
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Delete talang',
      tags: ['Talang'],
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      await deleteTalang(id);
      return reply.code(204).send();
    } catch (error) {
      return reply.code(400).send({
        error: {
          message: error.message,
          code: 400,
        },
      });
    }
  });
};

export default routes;
