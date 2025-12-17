// Simple Crop model helpers and Month enum for frontend usage
export const Month = Object.freeze({
  JANUARY: 'January',
  FEBRUARY: 'February',
  MARCH: 'March',
  APRIL: 'April',
  MAY: 'May',
  JUNE: 'June',
  JULY: 'July',
  AUGUST: 'August',
  SEPTEMBER: 'September',
  OCTOBER: 'October',
  NOVEMBER: 'November',
  DECEMBER: 'December',
});

export function createCrop(overrides = {}) {
  return {
    id: overrides.id || Date.now().toString(),
    name: overrides.name || '',
    sowingStart: overrides.sowingStart || null,
    sowingEnd: overrides.sowingEnd || null,
    plantingStart: overrides.plantingStart || null,
    plantingEnd: overrides.plantingEnd || null,
    harvestStart: overrides.harvestStart || null,
    harvestEnd: overrides.harvestEnd || null,
    inHouse: !!overrides.inHouse,
    inPots: !!overrides.inPots,
    inGarden: !!overrides.inGarden,
    inGreenhouse: !!overrides.inGreenhouse,
    Description: overrides.cropDescription || '',
    Tips: overrides.cropTips || '',
    image: overrides.image || null,
  };
}

export default {
  Month,
  createCrop,
};
