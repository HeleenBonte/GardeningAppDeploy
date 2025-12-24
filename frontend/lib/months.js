const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const monthIndex = (val) => {
  if (val === null || typeof val === 'undefined') return -1;
  const s = String(val).trim().toLowerCase();
  const asNum = parseInt(s, 10);
  if (!Number.isNaN(asNum) && asNum >= 1 && asNum <= 12) return asNum - 1;
  const map = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };
  return typeof map[s] !== 'undefined' ? map[s] : -1;
};

export const isInRange = (idx, startVal, endVal) => {
  const s = monthIndex(startVal);
  const e = monthIndex(endVal);
  if (s === -1 || e === -1) return false;
  if (s <= e) return idx >= s && idx <= e;
  return idx >= s || idx <= e;
};

export default MONTHS;
