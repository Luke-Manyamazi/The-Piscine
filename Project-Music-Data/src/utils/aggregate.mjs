// Helper: Count occurrences by key
export function countBy(arr, keyFn) {
  const map = {};
  for (const item of arr) {
    const key = keyFn(item);
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}

// Helper: Sum durations by key
export function sumBy(arr, keyFn, valFn) {
  const map = {};
  for (const item of arr) {
    const key = keyFn(item);
    map[key] = (map[key] || 0) + valFn(item);
  }
  return map;
}

// Helper: Get top N from a map
export function topN(map, n) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}