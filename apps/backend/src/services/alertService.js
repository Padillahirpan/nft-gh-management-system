/**
 * Alert Service
 * Business logic for alert management and configuration
 */

import prisma from './prisma.js';

/**
 * Get all alerts with optional filters
 * @param {object} filters - Filter options
 * @returns {array} - Array of alerts
 */
export async function getAllAlerts(filters = {}) {
  const {
    status,
    severity,
    type,
    limit = 50,
  } = filters;

  const alerts = await prisma.alert.findMany({
    where: {
      ...(status && { status }),
      ...(severity && { severity }),
      ...(type && { type }),
    },
    include: {
      resolvedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' }, // Active first
      { createdAt: 'desc' },
    ],
    take: parseInt(limit),
  });

  return alerts.map(formatAlert);
}

/**
 * Get alert by ID
 * @param {string} id - Alert ID
 * @returns {object|null} - Alert object or null
 */
export async function getAlertById(id) {
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: {
      resolvedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!alert) {
    return null;
  }

  return formatAlert(alert);
}

/**
 * Resolve alert
 * @param {string} id - Alert ID
 * @param {string} userId - User ID resolving the alert
 * @param {string} notes - Resolution notes
 * @returns {object} - Updated alert
 */
export async function resolveAlert(id, userId, notes) {
  const alert = await prisma.alert.findUnique({
    where: { id },
  });

  if (!alert) {
    throw new Error('Alert tidak ditemukan');
  }

  if (alert.status === 'RESOLVED') {
    throw new Error('Alert sudah selesai');
  }

  const updated = await prisma.alert.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedBy: userId,
      resolutionNotes: notes,
    },
    include: {
      resolvedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return formatAlert(updated);
}

/**
 * Get parameter config for alerts
 * @param {string} stage - Talang stage (optional)
 * @returns {object|array} - Parameter config(s)
 */
export async function getParameterConfig(stage) {
  if (stage) {
    return prisma.parameterConfig.findUnique({
      where: { stage },
    });
  }

  return prisma.parameterConfig.findMany({
    orderBy: {
      stage: 'asc',
    },
  });
}

/**
 * Update parameter config
 * @param {string} stage - Talang stage
 * @param {object} data - Config data
 * @returns {object} - Updated config
 */
export async function updateParameterConfig(stage, data) {
  return prisma.parameterConfig.upsert({
    where: { stage },
    update: data,
    create: {
      stage,
      ...data,
    },
  });
}

/**
 * Create new alert
 * @param {object} data - Alert data
 * @returns {object} - Created alert
 */
export async function createAlert(data) {
  return prisma.alert.create({
    data: {
      ...data,
      status: 'ACTIVE',
    },
  });
}

/**
 * Get active alerts count
 * @returns {object} - Count of active alerts by severity
 */
export async function getActiveAlertsCount() {
  const activeAlerts = await prisma.alert.groupBy({
    by: ['severity'],
    where: {
      status: 'ACTIVE',
    },
    _count: {
      severity: true,
    },
  });

  const result = {
    total: 0,
    danger: 0,
    warning: 0,
  };

  for (const alert of activeAlerts) {
    result.total += alert._count.severity;
    if (alert.severity === 'DANGER') {
      result.danger = alert._count.severity;
    } else if (alert.severity === 'WARNING') {
      result.warning = alert._count.severity;
    }
  }

  return result;
}

/**
 * Clean old resolved alerts
 * @param {number} daysOld - Delete alerts older than this many days
 * @returns {number} - Number of alerts deleted
 */
export async function cleanOldAlerts(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.alert.deleteMany({
    where: {
      status: 'RESOLVED',
      resolvedAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

/**
 * Format alert for API response
 * @param {object} alert - Raw alert
 * @returns {object} - Formatted alert
 */
function formatAlert(alert) {
  return {
    id: alert.id,
    type: alert.type,
    severity: alert.severity.toLowerCase(),
    message: alert.message,
    currentValue: alert.currentValue,
    thresholdMin: alert.thresholdMin,
    thresholdMax: alert.thresholdMax,
    action: alert.action,
    status: alert.status.toLowerCase(),
    resolvedAt: alert.resolvedAt,
    resolvedBy: alert.resolvedByUser,
    resolutionNotes: alert.resolutionNotes,
    createdAt: alert.createdAt,
    updatedAt: alert.updatedAt,
  };
}
