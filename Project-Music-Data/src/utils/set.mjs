// Helper: Get intersection of sets
export function intersection(sets) {
  if (!sets.length) return new Set();
  const normalized = sets.map((s) => (s instanceof Set ? s : new Set(s)));
  return normalized.reduce((a, b) => new Set([...a].filter((x) => b.has(x))));
}
