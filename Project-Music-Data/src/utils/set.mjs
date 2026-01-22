// Helper: Get intersection of sets
export function intersection(sets) {
  if (!sets.length) return new Set();

  return sets.reduce((a, b) =>
    new Set([...a].filter(x => b.has(x)))
  );
}