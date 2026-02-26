/**
 * Sensor Routes
 * Sensor reading endpoints: latest, history, manual input
 */

import {
  getLatestReading,
  getSensorHistory,
  createManualReading,
  getSensorStats,
} from '../services/sensorService.js';

const routes = async function (fastify, options) {
  const { prefix } = options;

  // GET /api/sensor/latest - Get latest sensor reading
  fastify.get('/latest', {
    schema: {
      description: 'Get latest sensor reading',
      tags: ['Sensor'],
    },
  }, async (request, reply) => {
    const reading = await getLatestReading();

    if (!reading) {
      return reply.code(404).send({
        error: {
          message: 'Belum ada data sensor',
          code: 404,
        },
      });
    }

    return {
      success: true,
      data: reading,
    };
  });

  // GET /api/sensor/history - Get sensor history
  fastify.get('/history', {
    schema: {
      description: 'Get sensor history',
      tags: ['Sensor'],
      querystring: {
        type: 'object',
        properties: {
          from: { type: 'string', format: 'date-time' },
          to: { type: 'string', format: 'date-time' },
          interval: { type: 'string', default: '30m' },
          limit: { type: 'number', default: 100 },
        },
      },
    },
  }, async (request, reply) => {
    const readings = await getSensorHistory(request.query);

    return {
      success: true,
      data: readings,
      count: readings.length,
    };
  });

  // GET /api/sensor/stats - Get sensor statistics
  fastify.get('/stats', {
    schema: {
      description: 'Get sensor statistics',
      tags: ['Sensor'],
      querystring: {
        type: 'object',
        properties: {
          from: { type: 'string', format: 'date-time' },
          to: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, async (request, reply) => {
    const stats = await getSensorStats(request.query);

    if (!stats) {
      return reply.code(404).send({
        error: {
          message: 'Tidak ada data untuk periode ini',
          code: 404,
        },
      });
    }

    return {
      success: true,
      data: stats,
    };
  });

  // POST /api/sensor/manual - Manual sensor input
  fastify.post('/manual', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Create manual sensor reading',
      tags: ['Sensor'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['ppm', 'ph', 'tempWater', 'tempAir'],
        properties: {
          ppm: { type: 'number', minimum: 0 },
          ph: { type: 'number', minimum: 0, maximum: 14 },
          tempWater: { type: 'number' },
          tempAir: { type: 'number' },
          humidity: { type: 'number', minimum: 0, maximum: 100 },
          ec: { type: 'number', minimum: 0 },
          deviceId: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const reading = await createManualReading(request.body, request.user.userId);

      return reply.code(201).send({
        success: true,
        message: 'Data sensor berhasil dicatat',
        data: reading,
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
};

export default routes;
