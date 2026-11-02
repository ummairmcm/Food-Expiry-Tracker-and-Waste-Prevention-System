// FUNCTIONAL PARADIGM: pure functions, no side effects, no mutation of inputs.

const MS_PER_DAY = 86400000;

// Pure: days between two YYYY-MM-DD strings (negative = already expired)
const daysBetween = (fromStr, toStr) =>
  Math.round((Date.parse(toStr) - Date.parse(fromStr)) / MS_PER_DAY);

const todayStr = () => new Date().toISOString().slice(0, 10);

// Higher-order helpers
const groupBy = (keyFn) => (list) =>
  list.reduce((acc, x) => ({ ...acc, [keyFn(x)]: [...(acc[keyFn(x)] || []), x] }), {});

const countBy = (keyFn) => (list) =>
  list.reduce((acc, x) => ({ ...acc, [keyFn(x)]: (acc[keyFn(x)] || 0) + 1 }), {});

const sortBy = (keyFn) => (list) =>
  [...list].sort((a, b) => keyFn(a) - keyFn(b));

const sum = (list, fn = (x) => x) => list.reduce((t, x) => t + fn(x), 0);

// Pure: build the stats shown on the dashboard
const computeStats = (items, wasteRows) => {
  const consumed = items.filter((i) => i.state === 'consumed');
  const active = items.filter((i) => i.state === 'active');
  const savedCount = consumed.length;
  const wastedCount = wasteRows.length;
  const total = savedCount + wastedCount;
  return {
    activeItems: active.length,
    itemsSaved: savedCount,
    itemsWasted: wastedCount,
    savedPercent: total === 0 ? 0 : Math.round((savedCount / total) * 100),
    wasteByReason: countBy((w) => w.reason)(wasteRows),
    totalWastedQuantity: sum(wasteRows, (w) => w.quantity),
  };
};

module.exports = { daysBetween, todayStr, groupBy, countBy, sortBy, sum, computeStats };
