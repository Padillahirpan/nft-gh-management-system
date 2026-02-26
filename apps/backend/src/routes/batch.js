/**
 * Batch Routes
 * Batch (planting cycle) management endpoints
 */

import {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  updateBatchStage,
  getParameterConfig,
  getAllParameterConfigs,
} from '../services/batchService.js';

const routes = async function (fastify, options) {
  const { prefix } = options;

  // GET /api/batch - Get all batches
  fastify.get('/', {
    schema: {
      description: 'Get all batches',
      tags: ['Batch'],
      querystring: {
        type: 'object',
        properties: {
          talangId: { type: 'string' },
          stage: { type: 'string', enum: ['SEMAI', 'TRANSPLANT', 'VEGETATIF', 'PANEN'] },
          status: { type: 'string', enum: ['active', 'completed'] },
        },
      },
    },
  }, async (request, reply) => {
    const batches = await getAllBatches(request.query);
    return {
      success: true,
      data: batches,
      count: batches.length,
    };
  });

  // GET /api/batch/:id - Get batch by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get batch by ID',
      tags: ['Batch'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const batch = await getBatchById(id);

    if (!batch) {
      return reply.code(404).send({
        error: {
          message: 'Batch tidak ditemukan',
          code: 404,
        },
      });
    }

    return {
      success: true,
      data: batch,
    };
  });

  // GET /api/batch/config/:stage - Get parameter config by stage
  fastify.get('/config/:stage', {
    schema: {
      description: 'Get parameter config by stage',
      tags: ['Batch'],
      params: {
        type: 'object',
        properties: {
          stage: { type: 'string', enum: ['SEMAI', 'TRANSPLANT', 'VEGETATIF', 'PANEN'] },
        },
      },
    },
  }, async (request, reply) => {
    const { stage } = request.params;
    const config = await getParameterConfig(stage);

    if (!config) {
      return reply.code(404).send({
        error: {
          message: 'Konfigurasi parameter tidak ditemukan',
          code: 404,
        },
      });
    }

    return {
      success: true,
      data: config,
    };
  });

  // GET /api/batch/config - Get all parameter configs
  fastify.get('/config/all', {
    schema: {
      description: 'Get all parameter configs',
      tags: ['Batch'],
    },
  }, async (request, reply) => {
    const configs = await getAllParameterConfigs();
    return {
      success: true,
      data: configs,
    };
  });

  // POST /api/batch - Create new batch
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Create new batch',
      tags: ['Batch'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['talangId'],
        properties: {
          talangId: { type: 'string' },
          variety: { type: 'string', default: 'Selada Bokor Hijau' },
          filledSlots: { type: 'number', default: 0 },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const batch = await createBatch({
        ...request.body,
        createdBy: request.user.userId,
      });
      return reply.code(201).send({
        success: true,
        message: 'Batch berhasil dibuat',
        data: batch,
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

  // PATCH /api/batch/:id - Update batch
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Update batch',
      tags: ['Batch'],
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
          filledSlots: { type: 'number' },
          health: { type: 'string', enum: ['BAIK', 'PERLU_PERHATIAN', 'KRITIS'] },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      const batch = await updateBatch(id, request.body);
      return {
        success: true,
        message: 'Batch berhasil diupdate',
        data: batch,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.code(404).send({
          error: {
            message: 'Batch tidak ditemukan',
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

  // PATCH /api/batch/:id/stage - Update batch stage
  fastify.patch('/:id/stage', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Update batch stage',
      tags: ['Batch'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['stage'],
        properties: {
          stage: { type: 'string', enum: ['SEMAI', 'TRANSPLANT', 'VEGETATIF', 'PANEN'] },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { stage, notes } = request.body;

    try {
      const batch = await updateBatchStage(
        id,
        stage,
        request.user.userId,
        notes,
      );
      return {
        success: true,
        message: `Stage berhasil diupdate ke ${stage}`,
        data: batch,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.code(404).send({
          error: {
            message: 'Batch tidak ditemukan',
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
};

export default routes;
