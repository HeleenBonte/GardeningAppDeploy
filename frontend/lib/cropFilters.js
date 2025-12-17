// Utilities for month parsing and crop filtering
const MONTHS = [
  'January','February','March','April','May','June','July','August','September','October','November','December'
];

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

export function monthIndex(monthName) {
  if (monthName == null) return -1;
  if (typeof monthName === 'number') {
    const v = monthName;
    if (v >= 1 && v <= 12) return v - 1;
    if (v >= 0 && v <= 11) return v;
    return -1;
  }
  const s = String(monthName).trim();
  if (/^\d+$/.test(s)) {
    const v = parseInt(s, 10);
    if (v >= 1 && v <= 12) return v - 1;
    if (v >= 0 && v <= 11) return v;
  }
  const lower = s.toLowerCase();
  for (let i = 0; i < MONTHS.length; i++) if (MONTHS[i].toLowerCase() === lower) return i;
  const upper = s.toUpperCase();
  const keys = Object.keys(MONTHS);
  for (let i = 0; i < keys.length; i++) if (keys[i] === upper) return i;
  return -1;
}

export function isMonthInRange(monthName, startName, endName) {
  if (!monthName) return false;
  const m = monthIndex(monthName);
  if (m === -1) return false;
  const sIdx = startName != null ? monthIndex(startName) : -1;
  const eIdx = endName != null ? monthIndex(endName) : -1;
  if (sIdx === -1 && eIdx === -1) return false;
  if (sIdx === -1) return m === eIdx;
  if (eIdx === -1) return m === sIdx;
  if (sIdx <= eIdx) return m >= sIdx && m <= eIdx;
  return m >= sIdx || m <= eIdx;
}

export function filterCrop(crop, { search, selectedSowingMonth, selectedHarvestMonth, selectedLocations }) {
  const q = (search || '').toLowerCase();
  if (q) {
    const name = (crop.name || crop.title || '').toLowerCase();
    if (!name.includes(q)) return false;
  }

  const selectedLocationKeys = Object.keys(selectedLocations || {}).filter(k => selectedLocations[k]);
  if (selectedLocationKeys.length > 0) {
    const allMatch = selectedLocationKeys.every(k => !!crop[k]);
    if (!allMatch) return false;
  }

  if (!selectedSowingMonth && !selectedHarvestMonth) return true;

  let sowingMatch = true;
  if (selectedSowingMonth) {
    const inSowing = isMonthInRange(selectedSowingMonth, crop.sowingStart, crop.sowingEnd);
    const inPlanting = isMonthInRange(selectedSowingMonth, crop.plantingStart, crop.plantingEnd);
    sowingMatch = inSowing || inPlanting;
  }

  let harvestMatch = true;
  if (selectedHarvestMonth) {
    harvestMatch = isMonthInRange(selectedHarvestMonth, crop.harvestStart || crop.harvestingStart, crop.harvestEnd || crop.harvestingEnd);
  }

  return sowingMatch && harvestMatch;
}
