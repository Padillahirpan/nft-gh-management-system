/**
 * Talang Service
 * Business logic for talang (growing channel) management
 */

import prisma from './prisma.js';
import {
  calculateHarvestDate,
  calculateDaysSincePlant,
  calculateEstimatedYield,
} from '../utils/helpers.js';

/**
 * Get all talangs with optional filters
 * @param {object} filters - Filter options
 * @returns {array} - Array of talangs
 */
export async function getAllTalangs(filters = {}) {
  const { isActive, includeBatch = true } = filters;

  const talangs = await prisma.talang.findMany({
    where: {
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
    },
    include: {
      currentBatch: includeBatch,
      greenhouse: includeBatch,
    },
    orderBy: {
      position: 'asc',
    },
  });

  // Calculate days since plant for each talang with active batch
  return talangs.map((talang) => {
    if (talang.currentBatch) {
      const daysSincePlant = calculateDaysSincePlant(talang.currentBatch.plantDate);
      return {
        ...talang,
        currentBatch: {
          ...talang.currentBatch,
          daysSincePlant,
        },
      };
    }
    return talang;
  });
}

/**
 * Get talang by ID
 * @param {string} id - Talang ID
 * @returns {object|null} - Talang object or null
 */
export async function getTalangById(id) {
  const talang = await prisma.talang.findUnique({
    where: { id },
    include: {
      currentBatch: true,
      greenhouse: true,
      batches: {
        orderBy: {
          plantDate: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!talang) {
    return null;
  }

  // Calculate days since plant if has active batch
  if (talang.currentBatch) {
    const daysSincePlant = calculateDaysSincePlant(talang.currentBatch.plantDate);
    return {
      ...talang,
      currentBatch: {
        ...talang.currentBatch,
        daysSincePlant,
      },
    };
  }

  return talang;
}

/**
 * Create new talang
 * @param {object} data - Talang data
 * @returns {object} - Created talang
 */
export async function createTalang(data) {
  const { greenhouseId, name, position, totalSlots = 20 } = data;

  return prisma.talang.create({
    data: {
      id: `T${String(position || 1).padStart(2, '0')}`,
      name,
      greenhouseId,
      position,
      totalSlots,
      isActive: true,
    },
    include: {
      greenhouse: true,
    },
  });
}

/**
 * Update talang
 * @param {string} id - Talang ID
 * @param {object} data - Update data
 * @returns {object} - Updated talang
 */
export async function updateTalang(id, data) {
  return prisma.talang.update({
    where: { id },
    data,
    include: {
      greenhouse: true,
      currentBatch: true,
    },
  });
}

/**
 * Delete talang
 * @param {string} id - Talang ID
 * @returns {object} - Deleted talang
 */
export async function deleteTalang(id) {
  // Check if has active batch
  const talang = await prisma.talang.findUnique({
    where: { id },
    include: {
      currentBatch: true,
    },
  });

  if (talang?.currentBatch) {
    throw new Error('Tidak dapat menghapus talang yang masih memiliki batch aktif');
  }

  return prisma.talang.delete({
    where: { id },
  });
}
