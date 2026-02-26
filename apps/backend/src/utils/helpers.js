/**
 * Helper Utilities
 */

/**
 * Calculate sensor status based on parameter value and thresholds
 * @param {number} value - The sensor value
 * @param {number} min - Minimum threshold
 * @param {number} max - Maximum threshold
 * @returns {string} - 'normal', 'warning', or 'danger'
 */
export function calculateStatus(value, min, max) {
  if (value < min * 0.8 || value > max * 1.2) {
    return 'danger';
  }
  if (value < min || value > max) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Get correction action for parameter
 * @param {string} parameter - Parameter name (ppm, ph, temp_air, temp_water)
 * @param {string} status - Current status
 * @param {number} value - Current value
 * @returns {string} - Correction action description
 */
export function getCorrectionAction(parameter, status, value) {
  const actions = {
    ppm: {
      low: 'Tambahkan AB Mix Part A + B (5ml/L per part). Tunggu 10 menit, cek ulang.',
      high: 'Encerkan dengan air bersih. Tambahkan air secara bertahap sambil cek PPM.',
    },
    ph: {
      low: 'Tambahkan pH Up (KOH) — 1ml/10L, tunggu 10 menit, cek ulang.',
      high: 'Tambahkan pH Down (H3PO4) — 1ml/10L, tunggu 10 menit, cek ulang.',
    },
    temp_air: {
      high: 'Gunakan chiller atau tambahkan es batu food grade. Buka ventilasi.',
    },
    temp_udara: {
      high: 'Buka ventilasi/cooling system. Aktifkan kipas angin.',
    },
  };

  if (parameter === 'ppm' && value < 800) return actions.ppm.low;
  if (parameter === 'ppm' && value > 1200) return actions.ppm.high;
  if (parameter === 'ph' && value < 5.5) return actions.ph.low;
  if (parameter === 'ph' && value > 6.5) return actions.ph.high;
  if (parameter === 'temp_air' && value > 24) return actions.temp_air.high;
  if (parameter === 'temp_udara' && value > 28) return actions.temp_udara.high;

  return 'Parameter dalam rentang normal.';
}

/**
 * Calculate harvest date based on plant date
 * @param {Date|string} plantDate - Planting date
 * @param {number} daysToHarvest - Days until harvest (default: 28)
 * @returns {Date} - Estimated harvest date
 */
export function calculateHarvestDate(plantDate, daysToHarvest = 28) {
  const date = new Date(plantDate);
  date.setDate(date.getDate() + daysToHarvest);
  return date;
}

/**
 * Calculate days since planting
 * @param {Date|string} plantDate - Planting date
 * @returns {number} - Days since planting
 */
export function calculateDaysSincePlant(plantDate) {
  const plant = new Date(plantDate);
  const now = new Date();
  const diffTime = Math.abs(now - plant);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate batch ID
 * @param {string} talangId - Talang ID
 * @returns {string} - Batch ID (e.g., B-2026-001)
 */
export function generateBatchId(talangId) {
  const year = new Date().getFullYear();
  // Simple random number for now - in production, use database sequence
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `B-${year}-${random}`;
}

/**
 * Calculate average weight per head
 * @param {number} totalWeight - Total weight in grams
 * @param {number} headCount - Number of heads
 * @returns {number} - Average weight per head
 */
export function calculateAvgWeight(totalWeight, headCount) {
  if (headCount === 0) return 0;
  return Math.round((totalWeight / headCount) * 10) / 10;
}

/**
 * Validate stage transition
 * @param {string} currentStage - Current stage
 * @param {string} newStage - New stage to transition to
 * @returns {boolean} - Whether transition is valid
 */
export function isValidStageTransition(currentStage, newStage) {
  const stages = ['SEMAI', 'TRANSPLANT', 'VEGETATIF', 'PANEN'];
  const currentIndex = stages.indexOf(currentStage);
  const newIndex = stages.indexOf(newStage);

  // Can only move forward or stay in same stage
  return newIndex >= currentIndex;
}

/**
 * Format date to Indonesian locale
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDateId(date) {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculate estimated yield based on filled slots
 * @param {number} filledSlots - Number of filled slots
 * @param {number} avgWeightPerHead - Average weight per head in grams (default: 120g)
 * @returns {number} - Estimated yield in grams
 */
export function calculateEstimatedYield(filledSlots, avgWeightPerHead = 120) {
  return filledSlots * avgWeightPerHead;
}
