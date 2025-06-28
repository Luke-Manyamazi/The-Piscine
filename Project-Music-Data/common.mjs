import { getUserIDs } from "./data.mjs";

export const countUsers = () => getUserIDs().length;

// Helper: Get day string (YYYY-MM-DD) from timestamp
export function getDay(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

// Helper: Check if listen is on Friday night (Fri 5pm–Sat 4am)
export function isFridayNight(ts) {
  const d = new Date(ts);
  const day = d.getDay();
  const hour = d.getHours();
  return (day === 5 && hour >= 17) || (day === 6 && hour < 4);
}

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

// Helper: Get intersection of sets
export function intersection(sets) {
  if (!sets.length) return new Set();
  const normalized = sets.map((s) => (s instanceof Set ? s : new Set(s)));
  return normalized.reduce((a, b) => new Set([...a].filter((x) => b.has(x))));
}
