// Helper: Count occurrences by key
function aggregateBy(arr, keyFn, valFn = () => 1) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + valFn(item);
    return acc;
  }, {});
}

export const countBy = (arr, keyFn) =>
  aggregateBy(arr, keyFn);

export const sumBy = (arr, keyFn, valFn) =>
  aggregateBy(arr, keyFn, valFn);

// Helper: Get top N from a map
export function topN(map, n) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}