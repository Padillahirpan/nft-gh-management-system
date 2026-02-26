/**
 * Harvest Service
 * Business logic for harvest recording and management
 */

import prisma from './prisma.js';
import { calculateAvgWeight } from '../utils/helpers.js';

/**
 * Get all harvests with optional filters
 * @param {object} filters - Filter options
 * @returns {array} - Array of harvests
 */
export async function getAllHarvests(filters = {}) {
  const {
    talangId,
    batchId,
    grade,
    saleStatus,
    limit = 50,
  } = filters;

  const harvests = await prisma.harvest.findMany({
    where: {
      ...(batchId && { batchId }),
      ...(talangId && {
        batch: {
          talangId,
        },
      }),
    },
    include: {
      batch: {
        include: {
          talang: true,
        },
      },
      recordedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      sales: {
        where: ...(saleStatus && { status: saleStatus }),
      },
    },
    orderBy: {
      harvestDate: 'desc',
    },
    take: parseInt(limit),
  });

  // Format and filter by grade if specified
  let formattedHarvests = harvests.map(formatHarvest);

  if (grade) {
    formattedHarvests = formattedHarvests.filter(h => {
      if (grade === 'A') return h.gradeACount > 0;
      if (grade === 'B') return h.gradeBCount > 0;
      if (grade === 'C') return h.gradeCCount > 0;
      return true;
    });
  }

  return formattedHarvests;
}

/**
 * Get harvest by ID
 * @param {string} id - Harvest ID
 * @returns {object|null} - Harvest object or null
 */
export async function getHarvestById(id) {
  const harvest = await prisma.harvest.findUnique({
    where: { id },
    include: {
      batch: {
        include: {
          talang: true,
          stageLogs: true,
        },
      },
      recordedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      sales: true,
    },
  });

  if (!harvest) {
    return null;
  }

  return formatHarvest(harvest);
}

/**
 * Create new harvest
 * @param {object} data - Harvest data
 * @param {string} userId - User ID who recorded the harvest
 * @returns {object} - Created harvest
 */
export async function createHarvest(data, userId) {
  const {
    batchId,
    harvestDate = new Date(),
    totalWeight,
    headCount,
    gradeACount = 0,
    gradeAWeight = 0,
    gradeBCount = 0,
    gradeBWeight = 0,
    gradeCCount = 0,
    gradeCWeight = 0,
    notes,
  } = data;

  // Validate batch exists
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      talang: true,
    },
  });

  if (!batch) {
    throw new Error('Batch tidak ditemukan');
  }

  // Calculate average weight
  const avgWeight = calculateAvgWeight(totalWeight, headCount);

  // Validate grade counts match head count
  const totalGradeCount = gradeACount + gradeBCount + gradeCCount;
  if (totalGradeCount !== headCount) {
    throw new Error(`Jumlah grade (${totalGradeCount}) tidak sama dengan jumlah kepala (${headCount})`);
  }

  // Validate grade weights match total weight
  const totalGradeWeight = gradeAWeight + gradeBWeight + gradeCWeight;
  if (Math.abs(totalGradeWeight - totalWeight) > 10) {
    throw new Error(`Total berat grade (${totalGradeWeight}g) tidak sama dengan total berat (${totalWeight}g)`);
  }

  // Create harvest
  const harvest = await prisma.harvest.create({
    data: {
      batchId,
      harvestDate: new Date(harvestDate),
      totalWeight,
      headCount,
      avgWeight,
      gradeACount,
      gradeAWeight,
      gradeBCount,
      gradeBWeight,
      gradeCCount,
      gradeCWeight,
      notes,
      recordedBy: userId,
    },
    include: {
      batch: {
        include: {
          talang: true,
        },
      },
      recordedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Update batch stage to PANEN if not already
  if (batch.stage !== 'PANEN') {
    await prisma.batch.update({
      where: { id: batchId },
      data: {
        stage: 'PANEN',
      },
    });

    // Create stage log
    await prisma.batchStageLog.create({
      data: {
        batchId,
        fromStage: batch.stage,
        toStage: 'PANEN',
        changedBy: userId,
        notes: 'Panen dicatat',
      },
    });
  }

  return formatHarvest(harvest);
}

/**
 * Mark harvest as sold
 * @param {string} harvestId - Harvest ID
 * @param {object} data - Sale data
 * @returns {object} - Created sale record
 */
export async function markAsSold(harvestId, data) {
  const {
    weight,
    price,
    totalAmount,
    customerName,
    notes,
  } = data;

  // Validate harvest exists
  const harvest = await prisma.harvest.findUnique({
    where: { id: harvestId },
    include: {
      sales: true,
    },
  });

  if (!harvest) {
    throw new Error('Data panen tidak ditemukan');
  }

  // Check if sale weight doesn't exceed harvest weight
  const soldWeight = harvest.sales.reduce((sum, sale) => sum + sale.weight, 0);
  const remainingWeight = harvest.totalWeight - soldWeight;

  if (weight > remainingWeight) {
    throw new Error(`Berat jual (${weight}g) melebihi sisa stok (${remainingWeight}g)`);
  }

  // Create sale record
  const sale = await prisma.harvestSale.create({
    data: {
      harvestId,
      saleDate: new Date(),
      weight,
      price,
      totalAmount: totalAmount || (price ? (price * weight / 1000) : null),
      customerName,
      notes,
      status: 'TERJUAL',
    },
    include: {
      harvest: {
        include: {
          batch: {
            include: {
              talang: true,
            },
          },
        },
      },
    },
  });

  // Check if all harvest is sold, update harvest sales status
  const newSoldWeight = soldWeight + weight;
  const allSales = await prisma.harvestSale.findMany({
    where: { harvestId },
  });

  // Format harvest with updated sales
  const updatedHarvest = await prisma.harvest.findUnique({
    where: { id: harvestId },
    include: {
      batch: {
        include: {
          talang: true,
        },
      },
      recordedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      sales: true,
    },
  });

  return formatHarvest(updatedHarvest);
}

/**
 * Get harvest statistics
 * @param {object} filters - Filter options
 * @returns {object} - Harvest statistics
 */
export async function getHarvestStats(filters = {}) {
  const {
    from,
    to,
    talangId,
  } = filters;

  const startDate = from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const endDate = to ? new Date(to) : new Date();

  const harvests = await prisma.harvest.findMany({
    where: {
      harvestDate: {
        gte: startDate,
        lte: endDate,
      },
      ...(talangId && {
        batch: {
          talangId,
        },
      }),
    },
    include: {
      batch: {
        include: {
          talang: true,
        },
      },
      sales: true,
    },
  });

  if (harvests.length === 0) {
    return {
      totalHarvests: 0,
      totalYield: 0,
      totalYieldKg: 0,
      avgYieldPerHarvest: 0,
      avgHeadsPerHarvest: 0,
      avgWeightPerHead: 0,
      totalSales: 0,
      totalSalesAmount: 0,
      gradeDistribution: {
        A: { count: 0, weight: 0, percentage: 0 },
        B: { count: 0, weight: 0, percentage: 0 },
        C: { count: 0, weight: 0, percentage: 0 },
      },
      talangYield: [],
    };
  }

  // Calculate statistics
  const totalYield = harvests.reduce((sum, h) => sum + h.totalWeight, 0);
  const totalHeads = harvests.reduce((sum, h) => sum + h.headCount, 0);
  const avgYieldPerHarvest = totalYield / harvests.length;
  const avgHeadsPerHarvest = totalHeads / harvests.length;
  const avgWeightPerHead = totalYield / totalHeads;

  // Calculate sales
  const allSales = harvests.flatMap(h => h.sales);
  const totalSalesAmount = allSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalSoldWeight = allSales.reduce((sum, s) => sum + s.weight, 0);

  // Grade distribution
  const gradeA = {
    count: harvests.reduce((sum, h) => sum + h.gradeACount, 0),
    weight: harvests.reduce((sum, h) => sum + h.gradeAWeight, 0),
  };
  const gradeB = {
    count: harvests.reduce((sum, h) => sum + h.gradeBCount, 0),
    weight: harvests.reduce((sum, h) => sum + h.gradeBWeight, 0),
  };
  const gradeC = {
    count: harvests.reduce((sum, h) => sum + h.gradeCCount, 0),
    weight: harvests.reduce((sum, h) => sum + h.gradeCWeight, 0),
  };

  const totalGradeCount = gradeA.count + gradeB.count + gradeC.count;

  // Yield per talang
  const talangYieldMap = {};
  for (const harvest of harvests) {
    const talangId = harvest.batch.talangId;
    const talangName = harvest.batch.talang.name;
    if (!talangYieldMap[talangId]) {
      talangYieldMap[talangId] = {
        talangId,
        talangName,
        yield: 0,
        count: 0,
      };
    }
    talangYieldMap[talangId].yield += harvest.totalWeight;
    talangYieldMap[talangId].count += 1;
  }

  return {
    totalHarvests: harvests.length,
    totalYield,
    totalYieldKg: Math.round(totalYield / 10) / 100,
    avgYieldPerHarvest: Math.round(avgYieldPerHarvest),
    avgHeadsPerHarvest: Math.round(avgHeadsPerHarvest),
    avgWeightPerHead: Math.round(avgWeightPerHead * 10) / 10,
    totalSales: allSales.length,
    totalSoldWeight,
    totalSoldWeightKg: Math.round(totalSoldWeight / 10) / 100,
    totalSalesAmount: Math.round(totalSalesAmount),
    gradeDistribution: {
      A: {
        ...gradeA,
        percentage: totalGradeCount > 0 ? Math.round((gradeA.count / totalGradeCount) * 100) : 0,
      },
      B: {
        ...gradeB,
        percentage: totalGradeCount > 0 ? Math.round((gradeB.count / totalGradeCount) * 100) : 0,
      },
      C: {
        ...gradeC,
        percentage: totalGradeCount > 0 ? Math.round((gradeC.count / totalGradeCount) * 100) : 0,
      },
    },
    talangYield: Object.values(talangYieldMap).map(t => ({
      ...t,
      avgYield: Math.round(t.yield / t.count),
    })),
    recentHarvests: harvests.slice(0, 5).map(formatHarvest),
  };
}

/**
 * Format harvest for API response
 * @param {object} harvest - Raw harvest
 * @returns {object} - Formatted harvest
 */
function formatHarvest(harvest) {
  const totalSoldWeight = harvest.sales?.reduce((sum, s) => sum + s.weight, 0) || 0;
  const remainingWeight = harvest.totalWeight - totalSoldWeight;

  return {
    id: harvest.id,
    batchId: harvest.batchId,
    talangId: harvest.batch?.talangId,
    talangName: harvest.batch?.talang?.name,
    batchNumber: harvest.batch?.batchNumber,
    variety: harvest.batch?.variety,
    harvestDate: harvest.harvestDate,
    totalWeight: harvest.totalWeight,
    headCount: harvest.headCount,
    avgWeight: harvest.avgWeight,
    gradeA: {
      count: harvest.gradeACount,
      weight: harvest.gradeAWeight,
    },
    gradeB: {
      count: harvest.gradeBCount,
      weight: harvest.gradeBWeight,
    },
    gradeC: {
      count: harvest.gradeCCount,
      weight: harvest.gradeCWeight,
    },
    notes: harvest.notes,
    recordedBy: harvest.recordedByUser,
    sales: harvest.sales || [],
    saleStatus: remainingWeight === 0 ? 'TERJUAL' : 'STOK',
    remainingWeight,
    createdAt: harvest.createdAt,
  };
}
