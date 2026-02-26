/**
 * Batch Service
 * Business logic for batch (planting cycle) management
 */

import prisma from './prisma.js';
import {
  calculateHarvestDate,
  calculateDaysSincePlant,
  calculateEstimatedYield,
  isValidStageTransition,
  generateBatchId,
} from '../utils/helpers.js';

/**
 * Get all batches
 * @param {object} filters - Filter options
 * @returns {array} - Array of batches
 */
export async function getAllBatches(filters = {}) {
  const { talangId, stage, status } = filters;

  const batches = await prisma.batch.findMany({
    where: {
      ...(talangId && { talangId }),
      ...(stage && { stage }),
      ...(status === 'active' && { stage: { not: 'PANEN' } }),
      ...(status === 'completed' && { stage: 'PANEN' }),
    },
    include: {
      talang: true,
      stageLogs: {
        orderBy: {
          changedAt: 'desc',
        },
      },
    },
    orderBy: {
      plantDate: 'desc',
    },
  });

  // Calculate days since plant for each batch
  return batches.map((batch) => ({
    ...batch,
    daysSincePlant: calculateDaysSincePlant(batch.plantDate),
  }));
}

/**
 * Get batch by ID
 * @param {string} id - Batch ID
 * @returns {object|null} - Batch object or null
 */
export async function getBatchById(id) {
  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      talang: true,
      stageLogs: {
        orderBy: {
          changedAt: 'desc',
        },
        include: {
          changedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      harvests: true,
    },
  });

  if (!batch) {
    return null;
  }

  return {
    ...batch,
    daysSincePlant: calculateDaysSincePlant(batch.plantDate),
  };
}

/**
 * Create new batch
 * @param {object} data - Batch data
 * @returns {object} - Created batch
 */
export async function createBatch(data) {
  const {
    talangId,
    variety = 'Selada Bokor Hijau',
    filledSlots = 0,
    notes,
    createdBy,
  } = data;

  // Check if talang exists
  const talang = await prisma.talang.findUnique({
    where: { id: talangId },
    include: {
      currentBatch: true,
    },
  });

  if (!talang) {
    throw new Error('Talang tidak ditemukan');
  }

  // Check if talang already has active batch
  if (talang.currentBatch) {
    throw new Error('Talang ini masih memiliki batch aktif. Selesaikan batch terlebih dahulu.');
  }

  const plantDate = new Date();
  const estimatedHarvestDate = calculateHarvestDate(plantDate);
  const estimatedYield = calculateEstimatedYield(filledSlots);

  // Generate batch number
  const year = new Date().getFullYear();
  const count = await prisma.batch.count({
    where: {
      plantDate: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });
  const batchNumber = `B-${year}-${String(count + 1).padStart(3, '0')}`;

  const batch = await prisma.batch.create({
    data: {
      talangId,
      batchNumber,
      variety,
      plantDate,
      estimatedHarvestDate,
      stage: 'SEMAI',
      daysSincePlant: 0,
      filledSlots,
      health: 'BAIK',
      estimatedYield,
      notes,
      createdBy,
    },
    include: {
      talang: true,
    },
  });

  // Update talang's current batch
  await prisma.talang.update({
    where: { id: talangId },
    data: {
      currentBatchId: batch.id,
    },
  });

  // Log initial stage
  await prisma.batchStageLog.create({
    data: {
      batchId: batch.id,
      fromStage: null,
      toStage: 'SEMAI',
      changedBy: createdBy,
      notes: 'Batch dibuat',
    },
  });

  return batch;
}

/**
 * Update batch
 * @param {string} id - Batch ID
 * @param {object} data - Update data
 * @returns {object} - Updated batch
 */
export async function updateBatch(id, data) {
  const { filledSlots, health, notes } = data;

  const updateData = {};
  if (filledSlots !== undefined) {
    updateData.filledSlots = filledSlots;
    // Recalculate estimated yield
    const batch = await prisma.batch.findUnique({ where: { id } });
    if (batch) {
      updateData.estimatedYield = calculateEstimatedYield(filledSlots);
    }
  }
  if (health) updateData.health = health;
  if (notes !== undefined) updateData.notes = notes;

  return prisma.batch.update({
    where: { id },
    data: updateData,
    include: {
      talang: true,
    },
  });
}

/**
 * Update batch stage
 * @param {string} id - Batch ID
 * @param {string} newStage - New stage
 * @param {string} changedBy - User ID who made the change
 * @param {string} notes - Optional notes
 * @returns {object} - Updated batch
 */
export async function updateBatchStage(id, newStage, changedBy, notes) {
  const batch = await prisma.batch.findUnique({
    where: { id },
  });

  if (!batch) {
    throw new Error('Batch tidak ditemukan');
  }

  // Validate stage transition
  if (!isValidStageTransition(batch.stage, newStage)) {
    throw new Error(`Transisi stage dari ${batch.stage} ke ${newStage} tidak valid`);
  }

  // Update batch
  const updatedBatch = await prisma.batch.update({
    where: { id },
    data: {
      stage: newStage,
      daysSincePlant: calculateDaysSincePlant(batch.plantDate),
    },
    include: {
      talang: true,
    },
  });

  // Log stage change
  await prisma.batchStageLog.create({
    data: {
      batchId: id,
      fromStage: batch.stage,
      toStage: newStage,
      changedBy,
      notes,
    },
  });

  // If moving to PANEN, update talang's current batch to null
  if (newStage === 'PANEN') {
    await prisma.talang.update({
      where: { id: batch.talangId },
      data: {
        currentBatchId: null,
      },
    });
  }

  return updatedBatch;
}

/**
 * Get parameter config by stage
 * @param {string} stage - Talang stage
 * @returns {object|null} - Parameter config or null
 */
export async function getParameterConfig(stage) {
  return prisma.parameterConfig.findUnique({
    where: { stage },
  });
}

/**
 * Get all parameter configs
 * @returns {array} - Array of parameter configs
 */
export async function getAllParameterConfigs() {
  return prisma.parameterConfig.findMany({
    orderBy: {
      stage: 'asc',
    },
  });
}
