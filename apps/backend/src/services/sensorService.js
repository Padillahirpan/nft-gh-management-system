/**
 * Sensor Service
 * Business logic for sensor readings and monitoring
 */

import prisma from './prisma.js';
import {
  calculateStatus,
  getCorrectionAction,
} from '../utils/helpers.js';

/**
 * Get latest sensor reading
 * @returns {object|null} - Latest sensor reading or null
 */
export async function getLatestReading() {
  const reading = await prisma.sensorReading.findFirst({
    orderBy: {
      recordedAt: 'desc',
    },
    include: {
      device: true,
    },
  });

  if (!reading) {
    return null;
  }

  return formatSensorReading(reading);
}

/**
 * Get sensor history with optional filters
 * @param {object} filters - Filter options
 * @returns {array} - Array of sensor readings
 */
export async function getSensorHistory(filters = {}) {
  const {
    from,
    to,
    interval = '30m', // 30 minutes default
    limit = 100,
  } = filters;

  const startDate = from ? new Date(from) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default 24 hours
  const endDate = to ? new Date(to) : new Date();

  const readings = await prisma.sensorReading.findMany({
    where: {
      recordedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      device: true,
    },
    orderBy: {
      recordedAt: 'desc',
    },
    take: parseInt(limit),
  });

  return readings.map(formatSensorReading);
}

/**
 * Create manual sensor reading
 * @param {object} data - Sensor data
 * @param {string} userId - User ID who created the reading
 * @returns {object} - Created sensor reading
 */
export async function createManualReading(data, userId) {
  const {
    ppm,
    ph,
    tempWater,
    tempAir,
    humidity,
    ec,
    deviceId,
    notes,
  } = data;

  // Get parameter config for current active batches to determine thresholds
  // For now, use default thresholds for vegetative stage
  const thresholds = {
    ppm: { min: 800, max: 1200 },
    ph: { min: 5.5, max: 6.5 },
    tempWater: { min: 18, max: 24 },
    tempAir: { min: 18, max: 28 },
  };

  // Calculate status
  const ppmStatus = calculateStatus(ppm, thresholds.ppm.min, thresholds.ppm.max);
  const phStatus = calculateStatus(ph, thresholds.ph.min, thresholds.ph.max);
  const tempStatus =
    calculateStatus(tempWater, thresholds.tempWater.min, thresholds.tempWater.max) === 'danger' ||
    calculateStatus(tempAir, thresholds.tempAir.min, thresholds.tempAir.max) === 'danger'
      ? 'danger'
      : calculateStatus(tempAir, thresholds.tempAir.min, thresholds.tempAir.max);

  const reading = await prisma.sensorReading.create({
    data: {
      ppm,
      ph,
      tempWater,
      tempAir,
      humidity,
      ec,
      ppmStatus,
      phStatus,
      tempStatus,
      deviceId,
      isManual: true,
      notes,
    },
    include: {
      device: true,
    },
  });

  // Check for alerts and create if needed
  await checkAndCreateAlerts(reading);

  return formatSensorReading(reading);
}

/**
 * Format sensor reading for API response
 * @param {object} reading - Raw sensor reading
 * @returns {object} - Formatted reading
 */
function formatSensorReading(reading) {
  return {
    id: reading.id,
    ppm: reading.ppm,
    ph: reading.ph,
    tempWater: reading.tempWater,
    tempAir: reading.tempAir,
    humidity: reading.humidity,
    ec: reading.ec,
    ppmStatus: reading.ppmStatus,
    phStatus: reading.phStatus,
    tempStatus: reading.tempStatus,
    overallStatus: getOverallStatus(reading.ppmStatus, reading.phStatus, reading.tempStatus),
    deviceId: reading.deviceId,
    deviceName: reading.device?.name,
    recordedAt: reading.recordedAt,
    isManual: reading.isManual,
    notes: reading.notes,
  };
}

/**
 * Get overall status from individual statuses
 * @param {string} ppmStatus - PPM status
 * @param {string} phStatus - pH status
 * @param {string} tempStatus - Temperature status
 * @returns {string} - Overall status
 */
function getOverallStatus(ppmStatus, phStatus, tempStatus) {
  if (ppmStatus === 'danger' || phStatus === 'danger' || tempStatus === 'danger') {
    return 'danger';
  }
  if (ppmStatus === 'warning' || phStatus === 'warning' || tempStatus === 'warning') {
    return 'warning';
  }
  return 'normal';
}

/**
 * Check and create alerts based on sensor reading
 * @param {object} reading - Sensor reading
 */
async function checkAndCreateAlerts(reading) {
  const alerts = [];

  // Check PPM
  if (reading.ppmStatus !== 'normal') {
    alerts.push({
      type: 'ppm',
      severity: reading.ppmStatus === 'danger' ? 'DANGER' : 'WARNING',
      message: `PPM ${reading.ppm < 800 ? 'terlalu rendah' : 'terlalu tinggi'}: ${reading.ppm} ppm`,
      currentValue: reading.ppm,
      thresholdMin: 800,
      thresholdMax: 1200,
      action: getCorrectionAction('ppm', reading.ppmStatus, reading.ppm),
    });
  }

  // Check pH
  if (reading.phStatus !== 'normal') {
    alerts.push({
      type: 'ph',
      severity: reading.phStatus === 'danger' ? 'DANGER' : 'WARNING',
      message: `pH ${reading.ph < 5.5 ? 'terlalu rendah (asam)' : 'terlalu tinggi (basa)'}: ${reading.ph}`,
      currentValue: reading.ph,
      thresholdMin: 5.5,
      thresholdMax: 6.5,
      action: getCorrectionAction('ph', reading.phStatus, reading.ph),
    });
  }

  // Check temperature
  if (reading.tempStatus !== 'normal') {
    if (reading.tempAir > 28) {
      alerts.push({
        type: 'temp_air',
        severity: 'DANGER',
        message: `Suhu udara terlalu tinggi: ${reading.tempAir}°C`,
        currentValue: reading.tempAir,
        thresholdMax: 28,
        action: getCorrectionAction('temp_udara', 'warning', reading.tempAir),
      });
    }
    if (reading.tempWater > 24) {
      alerts.push({
        type: 'temp_water',
        severity: 'DANGER',
        message: `Suhu air terlalu tinggi: ${reading.tempWater}°C`,
        currentValue: reading.tempWater,
        thresholdMax: 24,
        action: getCorrectionAction('temp_air', 'warning', reading.tempWater),
      });
    }
  }

  // Create alerts in database
  for (const alert of alerts) {
    await prisma.alert.create({
      data: {
        ...alert,
        status: 'ACTIVE',
      },
    });
  }
}

/**
 * Get sensor statistics for a time period
 * @param {object} filters - Filter options
 * @returns {object} - Statistics
 */
export async function getSensorStats(filters = {}) {
  const {
    from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    to = new Date().toISOString(),
  } = filters;

  const readings = await prisma.sensorReading.findMany({
    where: {
      recordedAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
  });

  if (readings.length === 0) {
    return null;
  }

  // Calculate statistics
  const ppmValues = readings.map(r => r.ppm);
  const phValues = readings.map(r => r.ph);
  const tempAirValues = readings.map(r => r.tempAir);
  const tempWaterValues = readings.map(r => r.tempWater);

  return {
    ppm: {
      min: Math.min(...ppmValues),
      max: Math.max(...ppmValues),
      avg: ppmValues.reduce((a, b) => a + b, 0) / ppmValues.length,
    },
    ph: {
      min: Math.min(...phValues),
      max: Math.max(...phValues),
      avg: phValues.reduce((a, b) => a + b, 0) / phValues.length,
    },
    tempAir: {
      min: Math.min(...tempAirValues),
      max: Math.max(...tempAirValues),
      avg: tempAirValues.reduce((a, b) => a + b, 0) / tempAirValues.length,
    },
    tempWater: {
      min: Math.min(...tempWaterValues),
      max: Math.max(...tempWaterValues),
      avg: tempWaterValues.reduce((a, b) => a + b, 0) / tempWaterValues.length,
    },
    count: readings.length,
  };
}
