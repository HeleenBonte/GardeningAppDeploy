export const UnitSystem = {
  METRIC: 'metric',
  IMPERIAL: 'imperial',
};

const GRAMS_PER_OUNCE = 28.349523125;
const GRAMS_PER_POUND = 453.59237;
const ML_PER_CUP = 236.5882365;
const ML_PER_FL_OUNCE = 29.5735295625;

export function gramsToOunces(g) {
  return g / GRAMS_PER_OUNCE;
}

export function ouncesToGrams(oz) {
  return oz * GRAMS_PER_OUNCE;
}

export function gramsToPounds(g) {
  return g / GRAMS_PER_POUND;
}

export function poundsToGrams(lb) {
  return lb * GRAMS_PER_POUND;
}

export function mlToFlOz(ml) {
  return ml / ML_PER_FL_OUNCE;
}

export function flOzToMl(fl) {
  return fl * ML_PER_FL_OUNCE;
}

function roundToOne(n) { return Math.round(n * 10) / 10; }

export function formatWeightFromGrams(g, unitSystem = UnitSystem.METRIC) {
  if (g == null || Number.isNaN(Number(g))) return '';
  if (unitSystem === UnitSystem.METRIC) {
    if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`;
    return `${Math.round(g)} g`;
  }
  if (g >= 1000) {
    const lbs = g / GRAMS_PER_POUND;
    return `${roundToOne(lbs)} lbs`;
  }
  return `${roundToOne(gramsToOunces(g))} oz`;
}

export function formatVolumeFromMl(ml, unitSystem = UnitSystem.METRIC, preferredUnit = null) {
  if (ml == null || Number.isNaN(Number(ml))) return '';
  if (unitSystem === UnitSystem.METRIC) {
    if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`;
    return `${Math.round(ml)} mL`;
  }
  return `${roundToOne(mlToFlOz(ml))} fl oz`;
}

export function formatTemperatureFromC(c, unitSystem = UnitSystem.METRIC) {
  if (c == null || Number.isNaN(Number(c))) return '';
  if (unitSystem === UnitSystem.METRIC) return `${Math.round(c)}°C`;
  return `${Math.round(cToF(c))}°F`;
}

export function formatMeasurement(valueInMetric, type = 'count', unitSystem = UnitSystem.METRIC, options = {}) {
  if (valueInMetric == null) return '';
  switch (type) {
    case 'weight':
      return formatWeightFromGrams(Number(valueInMetric), unitSystem);
    case 'volume':
      if (options && (options.preferredUnit === 'tsp' || options.preferredUnit === 'tbsp')) {
        return `${valueInMetric} ${options.preferredUnit}`;
      }
      return formatVolumeFromMl(Number(valueInMetric), unitSystem, options.preferredUnit);
    case 'temperature':
      return formatTemperatureFromC(Number(valueInMetric), unitSystem);
    default:
      return String(valueInMetric);
  }
}

export function parseWeightToGrams(value, unit) {
  if (value == null || value === '') return null;
  if (unit === 'g' || unit === 'gram' || unit === 'grams') return Number(value);
  if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') return Number(value) * 1000;
  if (unit === 'oz' || unit === 'ounce' || unit === 'ounces') return ouncesToGrams(Number(value));
  if (unit === 'lb' || unit === 'pound' || unit === 'pounds') return poundsToGrams(Number(value));
  return Number(value);
}

export function parseVolumeToMl(value, unit) {
  if (value == null || value === '') return null;
  if (unit === 'ml' || unit === 'milliliter' || unit === 'milliliters') return Number(value);
  if (unit === 'l' || unit === 'L' || unit === 'liter' || unit === 'liters') return Number(value) * 1000;
  
  if (unit === 'floz' || unit === 'fl oz' || unit === 'fl. oz') return flOzToMl(Number(value));
  return Number(value);
}

export default {
  UnitSystem,
  gramsToOunces,
  ouncesToGrams,
  gramsToPounds,
  poundsToGrams,
  mlToFlOz,
  flOzToMl,
  formatWeightFromGrams,
  formatVolumeFromMl,
  formatTemperatureFromC,
  formatMeasurement,
  parseWeightToGrams,
  parseVolumeToMl,
};