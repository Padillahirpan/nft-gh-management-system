/**
 * Harvest Routes
 * Harvest recording and management endpoints
 */

import {
  getAllHarvests,
  getHarvestById,
  createHarvest,
  markAsSold,
  getHarvestStats,
} from '../services/harvestService.js';

const routes = async function (fastify, options) {
  const { prefix } = options;

  // GET /api/harvest - Get all harvests
  fastify.get('/', {
    schema: {
      description: 'Get all harvests',
      tags: ['Harvest'],
      querystring: {
        type: 'object',
        properties: {
          talangId: { type: 'string' },
          batchId: { type: 'string' },
          grade: { type: 'string', enum: ['A', 'B', 'C'] },
          saleStatus: { type: 'string', enum: ['STOK', 'TERJUAL'] },
          limit: { type: 'number', default: 50 },
        },
      },
    },
  }, async (request, reply) => {
    const harvests = await getAllHarvests(request.query);

    return {
      success: true,
      data: harvests,
      count: harvests.length,
    };
  });

  // GET /api/harvest/stats - Get harvest statistics
  fastify.get('/stats', {
    schema: {
      description: 'Get harvest statistics',
      tags: ['Harvest'],
      querystring: {
        type: 'object',
        properties: {
          from: { type: 'string', format: 'date-time' },
          to: { type: 'string', format: 'date-time' },
          talangId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const stats = await getHarvestStats(request.query);

    return {
      success: true,
      data: stats,
    };
  });

  // GET /api/harvest/:id - Get harvest by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get harvest by ID',
      tags: ['Harvest'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const harvest = await getHarvestById(id);

    if (!harvest) {
      return reply.code(404).send({
        error: {
          message: 'Data panen tidak ditemukan',
          code: 404,
        },
      });
    }

    return {
      success: true,
      data: harvest,
    };
  });

  // POST /api/harvest - Record new harvest
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Record new harvest',
      tags: ['Harvest'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['batchId', 'totalWeight', 'headCount'],
        properties: {
          batchId: { type: 'string' },
          harvestDate: { type: 'string', format: 'date-time' },
          totalWeight: { type: 'number', minimum: 0 },
          headCount: { type: 'number', minimum: 0 },
          gradeACount: { type: 'number', default: 0 },
          gradeAWeight: { type: 'number', default: 0 },
          gradeBCount: { type: 'number', default: 0 },
          gradeBWeight: { type: 'number', default: 0 },
          gradeCCount: { type: 'number', default: 0 },
          gradeCWeight: { type: 'number', default: 0 },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const harvest = await createHarvest(request.body, request.user.userId);

      return reply.code(201).send({
        success: true,
        message: 'Data panen berhasil dicatat',
        data: harvest,
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

  // PATCH /api/harvest/:id/sell - Mark harvest as sold
  fastify.patch('/:id/sell', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Mark harvest as sold',
      tags: ['Harvest'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['weight'],
        properties: {
          weight: { type: 'number', minimum: 0 },
          price: { type: 'number', minimum: 0 },
          totalAmount: { type: 'number' },
          customerName: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      const harvest = await markAsSold(id, request.body);

      return {
        success: true,
        message: 'Data penjualan berhasil dicatat',
        data: harvest,
      };
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
