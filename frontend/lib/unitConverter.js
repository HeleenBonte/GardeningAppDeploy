// Unit conversion helpers
// All values stored in DB are expected to be metric (grams, milliliters, Celsius)
// This module converts to/from imperial and provides formatting helpers.

export const UnitSystem = {
  METRIC: 'metric',
  IMPERIAL: 'imperial',
};

// Constants
const GRAMS_PER_OUNCE = 28.349523125;
const GRAMS_PER_POUND = 453.59237;
// teaspoon/tablepoon conversions removed — tsp/tbsp preserved as DB values
const ML_PER_CUP = 236.5882365;
const ML_PER_FL_OUNCE = 29.5735295625;

// Weight conversions
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

// Helpers
function roundToOne(n) { return Math.round(n * 10) / 10; }

// Formatting helpers
// Mapping rules requested:
// - grams -> ounces (show oz for values < 1000 g)
// - kilograms -> pounds (values >= 1000 g shown in lb)
// - milliliters -> fl oz (unless caller explicitly prefers tsp/tbsp)
// - tsp/tbsp/pieces preserved (handled by callers via preferredUnit or by not converting count)
export function formatWeightFromGrams(g, unitSystem = UnitSystem.METRIC) {
  if (g == null || Number.isNaN(Number(g))) return '';
  if (unitSystem === UnitSystem.METRIC) {
    // keep metric display as grams/kilograms
    if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`;
    return `${Math.round(g)} g`;
  }
  // Imperial: apply mapping -> grams -> oz, kilograms -> lb
  if (g >= 1000) {
    // show pounds (rounded to one decimal)
    const lbs = g / GRAMS_PER_POUND;
    return `${roundToOne(lbs)} lbs`;
  }
  // small weights -> ounces
  return `${roundToOne(gramsToOunces(g))} oz`;
}

export function formatVolumeFromMl(ml, unitSystem = UnitSystem.METRIC, preferredUnit = null) {
  if (ml == null || Number.isNaN(Number(ml))) return '';
  // preferredUnit handling for tsp/tbsp is done in formatMeasurement (show raw DB value)
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

// Generic formatter: measurement type can be 'weight'|'volume'|'temperature'|'count'
export function formatMeasurement(valueInMetric, type = 'count', unitSystem = UnitSystem.METRIC, options = {}) {
  if (valueInMetric == null) return '';
  switch (type) {
    case 'weight':
      return formatWeightFromGrams(Number(valueInMetric), unitSystem);
    case 'volume':
      // If the caller indicates the DB measurement unit is 'tsp' or 'tbsp',
      // show the raw value from the database with that unit label (no conversion),
      // regardless of the user's unit settings.
      if (options && (options.preferredUnit === 'tsp' || options.preferredUnit === 'tbsp')) {
        return `${valueInMetric} ${options.preferredUnit}`;
      }
      return formatVolumeFromMl(Number(valueInMetric), unitSystem, options.preferredUnit);
    case 'temperature':
      return formatTemperatureFromC(Number(valueInMetric), unitSystem);
    default:
      // count/other: no conversion, just stringify (e.g., pieces)
      return String(valueInMetric);
  }
}

// Convert displayed value (with unit) back to metric base unit.
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
  // tsp/tbsp are preserved as DB units — do not convert them to ml here
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