/**
 * Alert Routes
 * Alert and notification management endpoints
 */

import {
  getAllAlerts,
  getAlertById,
  resolveAlert,
  getParameterConfig,
  updateParameterConfig,
  getActiveAlertsCount,
} from '../services/alertService.js';

const routes = async function (fastify, options) {
  const { prefix } = options;

  // GET /api/alert - Get all alerts
  fastify.get('/', {
    schema: {
      description: 'Get all alerts',
      tags: ['Alert'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ACTIVE', 'RESOLVED'] },
          severity: { type: 'string', enum: ['WARNING', 'DANGER'] },
          type: { type: 'string' },
          limit: { type: 'number', default: 50 },
        },
      },
    },
  }, async (request, reply) => {
    const alerts = await getAllAlerts(request.query);

    return {
      success: true,
      data: alerts,
      count: alerts.length,
    };
  });

  // GET /api/alert/count - Get active alerts count
  fastify.get('/count', {
    schema: {
      description: 'Get active alerts count',
      tags: ['Alert'],
    },
  }, async (request, reply) => {
    const counts = await getActiveAlertsCount();

    return {
      success: true,
      data: counts,
    };
  });

  // GET /api/alert/config - Get alert configuration (parameter thresholds)
  fastify.get('/config', {
    schema: {
      description: 'Get parameter alert configurations',
      tags: ['Alert'],
      querystring: {
        type: 'object',
        properties: {
          stage: { type: 'string', enum: ['SEMAI', 'TRANSPLANT', 'VEGETATIF', 'PANEN'] },
        },
      },
    },
  }, async (request, reply) => {
    const { stage } = request.query;
    const config = await getParameterConfig(stage);

    return {
      success: true,
      data: config,
    };
  });

  // PUT /api/alert/config - Update alert configuration
  fastify.put('/config', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Update parameter alert configuration',
      tags: ['Alert'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['stage'],
        properties: {
          stage: { type: 'string', enum: ['SEMAI', 'TRANSPLANT', 'VEGETATIF', 'PANEN'] },
          ppmMin: { type: 'number' },
          ppmMax: { type: 'number' },
          phMin: { type: 'number' },
          phMax: { type: 'number' },
          tempWaterMin: { type: 'number' },
          tempWaterMax: { type: 'number' },
          tempAirMin: { type: 'number' },
          tempAirMax: { type: 'number' },
          humidityMin: { type: 'number' },
          humidityMax: { type: 'number' },
          ecMin: { type: 'number' },
          ecMax: { type: 'number' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { stage, ...configData } = request.body;

    try {
      const config = await updateParameterConfig(stage, configData);

      return {
        success: true,
        message: 'Konfigurasi alert berhasil diupdate',
        data: config,
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

  // GET /api/alert/:id - Get alert by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get alert by ID',
      tags: ['Alert'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const alert = await getAlertById(id);

    if (!alert) {
      return reply.code(404).send({
        error: {
          message: 'Alert tidak ditemukan',
          code: 404,
        },
      });
    }

    return {
      success: true,
      data: alert,
    };
  });

  // PATCH /api/alert/:id/resolve - Mark alert as resolved
  fastify.patch('/:id/resolve', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Resolve alert',
      tags: ['Alert'],
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
          notes: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { notes } = request.body;

    try {
      const alert = await resolveAlert(id, request.user.userId, notes);

      return {
        success: true,
        message: 'Alert berhasil ditandai selesai',
        data: alert,
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
